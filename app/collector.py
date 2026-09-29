import subprocess
import sys
import re


def ping_host(host: str, count: int = 4) -> str:
    """Executa disparos ICMP contra um host de destino usando o utilitário nativo do SO.

    Trata a divergência de parâmetros de contagem entre plataformas (Windows usa '-n'
    e Linux/macOS usa '-c') e executa o processo via lista de argumentos para evitar
    vulnerabilidades de injeção de comandos (Command Injection).

    Args:
        host (str): Endereço IP ou domínio de destino (ex.: '8.8.8.8').
        count (int, optional): Quantidade de pacotes a enviar. Padrão: 4.

    Returns:
        str: Saída de texto pura gerada pelo terminal (stdout).
    """
    param = "-n" if sys.platform.startswith("win") else "-c"
    comando = ["ping", param, str(count), host]

    resultado = subprocess.run(
        comando,
        capture_output=True,
        text=True
    )
    return resultado.stdout


def extrair_metricas_ping(saida_texto: str, pacotes_enviados: int = 4) -> dict:
    """Extrai métricas de rede a partir da saída textual de um comando ping.

    Utiliza expressão regular para identificar os tempos de ida e volta (RTT) de cada
    pacote respondido em milissegundos, calculando a latência média e a taxa percentual
    de perda de pacotes.

    Args:
        saida_texto (str): Saída bruta de texto retornada pela função ping_host.
        pacotes_enviados (int, optional): Total de pacotes disparados no teste. Padrão: 4.

    Returns:
        dict: Dicionário contendo os dados processados:
            - 'latencias_individuais' (list[float]): Lista com os RTTs capturados em ms.
            - 'latencia_media' (float): Média aritmética das latências dos pacotes recebidos.
            - 'perda_pacotes' (float): Taxa percentual de pacotes perdidos (0.0 a 100.0).
    """
    # Expressão regular flexível para Windows (PT/EN) e Linux:
    # Captura valores numéricos associados a "tempo=" ou "time="
    padrao = r"(?:time|tempo)[=<](\d+(?:\.\d+)?)\s*ms"
    tempos_encontrados = re.findall(padrao, saida_texto, re.IGNORECASE)

    # Converte os números encontrados de string para float
    latencias = [float(t) for t in tempos_encontrados]

    pacotes_recebidos = len(latencias)
    pacotes_perdidos = pacotes_enviados - pacotes_recebidos
    perda_pacotes = (pacotes_perdidos / pacotes_enviados) * 100.0

    # Se ao menos um pacote voltou, calculamos a média; caso contrário, latência é 0.0
    latencia_media = sum(latencias) / pacotes_recebidos if pacotes_recebidos > 0 else 0.0

    return {
        "latencias_individuais": latencias,
        "latencia_media": round(latencia_media, 2),
        "perda_pacotes": round(perda_pacotes, 2)
    }


if __name__ == "__main__":
    host_alvo = "8.8.8.8"
    print(f"Executando coleta para {host_alvo}...")
    saida = ping_host(host_alvo)

    dados = extrair_metricas_ping(saida)
    print("--- Métricas Processadas ---")
    print(f"Latências individuais (ms): {dados['latencias_individuais']}")
    print(f"Latência média: {dados['latencia_media']} ms")
    print(f"Perda de pacotes: {dados['perda_pacotes']}%")