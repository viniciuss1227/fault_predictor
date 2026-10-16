import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  obterPrevisaoAtual,
  obterAvaliacaoAtividades,
} from './src/services/forecastService';

export default function App() {
  const [previsao, setPrevisao] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [dadosPrevisao, dadosAtividades] = await Promise.all([
          obterPrevisaoAtual(),
          obterAvaliacaoAtividades(),
        ]);
        setPrevisao(dadosPrevisao);
        setAtividades(dadosAtividades);
      } catch (erro) {
        console.error('Falha ao obter dados de previsão:', erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  if (carregando) {
    return (
      <SafeAreaView style={styles.containerCarregamento}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.textoCarregamento}>
          Carregando previsão da rede...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0E15" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.tagLocalizacao} accessibilityRole="text">
            Sonda RIPE #{previsao?.probe.id} • {previsao?.probe.location}
          </Text>
          <Text style={styles.tituloPrincipal} accessibilityRole="header">
            Qualidade da Conexão
          </Text>
          <Text style={styles.subtitulo}>
            Acompanhe a previsão de estabilidade para a sua região em tempo real.
          </Text>
        </View>

        {/* Card Principal: Status Geral da Conexão (RQ01) */}
        <View
          style={styles.cardPrincipal}
          accessible={true}
          accessibilityLabel={`Status da rede: ${previsao?.assessment.label}`}
        >
          <View style={styles.cardPrincipalHeader}>
            <View>
              <Text style={styles.cardLabel}>Classificação Geral</Text>
              <Text style={styles.statusTexto}>{previsao?.assessment.label}</Text>
            </View>
            <View style={styles.badgeStatus}>
              <Text style={styles.badgeTexto}>{previsao?.assessment.quality}</Text>
            </View>
          </View>

          {/* Grade de Métricas Numéricas Técnicas (RQ02) */}
          <View style={styles.gradeMetricas}>
            <View style={styles.itemMetrica}>
              <Text style={styles.metricaLabel}>Latência Média</Text>
              <Text style={styles.metricaValor}>
                {previsao?.metrics.predictedAvgRttMs} ms
              </Text>
            </View>
            <View style={styles.itemMetrica}>
              <Text style={styles.metricaLabel}>Jitter Previsto</Text>
              <Text style={styles.metricaValor}>
                {previsao?.metrics.predictedJitterMs} ms
              </Text>
            </View>
            <View style={styles.itemMetrica}>
              <Text style={styles.metricaLabel}>Perda de Pacotes</Text>
              <Text style={styles.metricaValor}>
                {previsao?.metrics.predictedPacketLossPct}%
              </Text>
            </View>
            <View style={styles.itemMetrica}>
              <Text style={styles.metricaLabel}>Distância da Sonda</Text>
              <Text style={styles.metricaValor}>
                {previsao?.probe.distanceKm} km
              </Text>
            </View>
          </View>
        </View>

        {/* Card de Orientação de Uso / Linguagem Simples (RQ04 / ODS 9) */}
        <View style={styles.cardRecomendacao} accessible={true}>
          <Text style={styles.recomendacaoTitulo}>Orientação de Uso</Text>
          <Text style={styles.recomendacaoMensagem}>
            {previsao?.recommendation.friendlyMessage}
          </Text>
          <Text style={styles.modeloRodape}>
            Previsão gerada via: {previsao?.modelInUse}
          </Text>
        </View>

        {/* Seção de Atividades Recomendadas (RQ03 / ODS 9) */}
        <View style={styles.secaoAtividades}>
          <Text style={styles.tituloSecao} accessibilityRole="header">
            Atividades Recomendadas
          </Text>

          {atividades.map((item) => (
            <View
              key={item.id}
              style={styles.cardAtividade}
              accessible={true}
              accessibilityLabel={`${item.title}: ${item.statusLabel}`}
            >
              <View style={styles.infoAtividade}>
                <Text style={styles.atividadeTitulo}>{item.title}</Text>
                <Text style={styles.atividadeDescricao}>{item.statusLabel}</Text>
              </View>

              <View
                style={[
                  styles.badgeAtividade,
                  {
                    borderColor: item.recommended ? '#2ECC71' : '#E74C3C',
                    backgroundColor: item.recommended ? '#143022' : '#331B1B',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeAtividadeTexto,
                    { color: item.recommended ? '#2ECC71' : '#E74C3C' },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0E15',
  },
  containerCarregamento: {
    flex: 1,
    backgroundColor: '#0D0E15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarregamento: {
    color: '#A0A3BD',
    marginTop: 12,
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  tagLocalizacao: {
    color: '#6C5CE7',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tituloPrincipal: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitulo: {
    color: '#8E92BC',
    fontSize: 14,
    lineHeight: 20,
  },
  cardPrincipal: {
    backgroundColor: '#161826',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#24273D',
  },
  cardPrincipalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardLabel: {
    color: '#8E92BC',
    fontSize: 13,
    marginBottom: 4,
  },
  statusTexto: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  badgeStatus: {
    backgroundColor: '#382D1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFA502',
  },
  badgeTexto: {
    color: '#FFA502',
    fontWeight: '700',
    fontSize: 12,
  },
  gradeMetricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemMetrica: {
    width: '48%',
    backgroundColor: '#1F2235',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  metricaLabel: {
    color: '#8E92BC',
    fontSize: 12,
    marginBottom: 6,
  },
  metricaValor: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cardRecomendacao: {
    backgroundColor: '#161826',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6C5CE7',
    marginBottom: 20,
  },
  recomendacaoTitulo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recomendacaoMensagem: {
    color: '#C7C9D9',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  modeloRodape: {
    color: '#656889',
    fontSize: 12,
    fontStyle: 'italic',
  },
  secaoAtividades: {
    marginTop: 8,
    marginBottom: 20,
  },
  tituloSecao: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  cardAtividade: {
    backgroundColor: '#161826',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#24273D',
  },
  infoAtividade: {
    flex: 1,
    marginRight: 10,
  },
  atividadeTitulo: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  atividadeDescricao: {
    color: '#8E92BC',
    fontSize: 13,
    lineHeight: 18,
  },
  badgeAtividade: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeAtividadeTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
});