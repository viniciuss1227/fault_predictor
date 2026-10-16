import mockData from './apiMockData.json';

/**
 * Camada de abstração de serviços de previsão de qualidade de conexão.
 * Atualmente consome o contrato mockado localmente e, quando o backend
 * de CC estiver em produção, alternará para requisições HTTP reais via fetch.
 */

/**
 * Obtém os dados de previsão atuais consolidados.
 * @returns {Promise<typeof mockData.currentForecast>} Objeto com métricas e avaliações de rede.
 */
export async function obterPrevisaoAtual() {
  // Simula uma pequena latência de requisição de rede (100ms) para comportamento assíncrono realista
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData.currentForecast);
    }, 100);
  });
}

/**
 * Obtém a lista de atividades recomendadas com base nas métricas preditas.
 * @returns {Promise<Array<typeof mockData.activitiesAssessment[0]>>} Lista de atividades e seus estados.
 */
export async function obterAvaliacaoAtividades() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData.activitiesAssessment);
    }, 100);
  });
}

/**
 * Obtém a lista de modelos de Machine Learning disponíveis na API.
 * @returns {Promise<Array<typeof mockData.models[0]>>} Modelos preditivos cadastrados.
 */
export async function obterModelosDisponiveis() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData.models);
    }, 100);
  });
}