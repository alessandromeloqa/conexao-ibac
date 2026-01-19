/**
 * Conexão IBAC - Histórico do Pregador
 * JavaScript moderno com ES6+, SOLID principles
 */

// Configuration
const CONFIG = {
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : '/api',
  CHART_OPTIONS: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        backgroundColor: 'rgba(26, 77, 124, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 1 }
      }
    }
  }
};

// State Management
const state = {
  chart: null,
  currentPregadorId: null,
  eventos: [],
  pregadores: []
};

// DOM Elements
const elements = {
  eventoSelect: document.getElementById('eventoSelect'),
  pregadorSelect: document.getElementById('pregadorSelect'),
  content: document.getElementById('content'),
  loading: document.getElementById('loading'),
  errorMessage: document.getElementById('errorMessage'),
  totalEventos: document.getElementById('totalEventos'),
  mediaGeral: document.getElementById('mediaGeral'),
  totalAvaliacoes: document.getElementById('totalAvaliacoes'),
  historicoTable: document.getElementById('historicoTable'),
  evolucaoChart: document.getElementById('evolucaoChart')
};

// API Service
class ApiService {
  static async fetch(endpoint) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  static async getEventos() {
    return this.fetch('/eventos');
  }

  static async getParticipacoes(eventoId) {
    return this.fetch(`/eventos/${eventoId}/participacoes`);
  }

  static async getHistorico(pregadorId) {
    return this.fetch(`/pregador/${pregadorId}/historico`);
  }

  static async getEvolucao(pregadorId) {
    return this.fetch(`/pregador/${pregadorId}/evolucao`);
  }
}

// UI Service
class UIService {
  static showLoading() {
    elements.loading?.classList.remove('hidden');
    elements.content?.classList.add('hidden');
  }

  static hideLoading() {
    elements.loading?.classList.add('hidden');
  }

  static showContent() {
    elements.content?.classList.remove('hidden');
  }

  static showError(message) {
    if (elements.errorMessage) {
      elements.errorMessage.textContent = message;
      elements.errorMessage.classList.remove('hidden');
      
      setTimeout(() => {
        elements.errorMessage.classList.add('hidden');
      }, 5000);
    }
  }

  static populateSelect(selectElement, options, valueKey = 'id', textKey = 'nome') {
    if (!selectElement) return;
    
    const defaultOption = selectElement.querySelector('option[value=""]');
    selectElement.innerHTML = '';
    
    if (defaultOption) {
      selectElement.appendChild(defaultOption);
    }
    
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option[valueKey];
      optionElement.textContent = option[textKey];
      selectElement.appendChild(optionElement);
    });
  }

  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  static formatNumber(number, decimals = 2) {
    return Number(number).toFixed(decimals);
  }
}

// Chart Service
class ChartService {
  static create(ctx, data) {
    if (state.chart) {
      state.chart.destroy();
    }

    state.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.evento_nome),
        datasets: [{
          label: 'Média por Evento',
          data: data.map(d => parseFloat(d.media_geral)),
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#3498db',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: CONFIG.CHART_OPTIONS
    });
  }

  static destroy() {
    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }
  }
}

// Historico Service
class HistoricoService {
  static renderResumo(resumo) {
    if (!resumo) return;
    
    elements.totalEventos.textContent = resumo.total_eventos || 0;
    elements.mediaGeral.textContent = resumo.media_geral_historica 
      ? UIService.formatNumber(resumo.media_geral_historica) 
      : '-';
    elements.totalAvaliacoes.textContent = resumo.total_avaliacoes || 0;
  }

  static renderTabela(eventos) {
    const tbody = elements.historicoTable?.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (!eventos || eventos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">Nenhum evento encontrado</td>
        </tr>
      `;
      return;
    }

    eventos.forEach(evento => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${evento.evento_nome}</td>
        <td>${UIService.formatDate(evento.data_evento)}</td>
        <td>${evento.tema || '-'}</td>
        <td><strong>${UIService.formatNumber(evento.media_geral)}</strong></td>
        <td><span class="ranking">${evento.ranking}º</span></td>
        <td>${evento.total_avaliacoes}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  static async load(pregadorId) {
    try {
      UIService.showLoading();
      
      const [historico, evolucao] = await Promise.all([
        ApiService.getHistorico(pregadorId),
        ApiService.getEvolucao(pregadorId)
      ]);

      this.renderResumo(historico.resumo);
      this.renderTabela(historico.eventos);
      
      if (evolucao && evolucao.length > 0) {
        ChartService.create(elements.evolucaoChart.getContext('2d'), evolucao);
      }

      UIService.hideLoading();
      UIService.showContent();
      
      state.currentPregadorId = pregadorId;
    } catch (error) {
      UIService.hideLoading();
      UIService.showError('Erro ao carregar histórico. Tente novamente.');
      console.error('Erro ao carregar histórico:', error);
    }
  }
}

// Event Handlers
async function handleEventoChange() {
  const eventoId = elements.eventoSelect.value;
  
  // Reset pregador select
  UIService.populateSelect(elements.pregadorSelect, []);
  elements.content?.classList.add('hidden');
  
  if (!eventoId) return;
  
  try {
    const participacoes = await ApiService.getParticipacoes(eventoId);
    
    const pregadores = participacoes.map(p => ({
      id: p.pregador_id,
      nome: p.pregador_nome
    }));
    
    UIService.populateSelect(elements.pregadorSelect, pregadores, 'id', 'nome');
    state.pregadores = pregadores;
  } catch (error) {
    UIService.showError('Erro ao carregar pregadores. Tente novamente.');
    console.error('Erro ao carregar pregadores:', error);
  }
}

async function handlePregadorChange() {
  const pregadorId = elements.pregadorSelect.value;
  
  if (!pregadorId) {
    elements.content?.classList.add('hidden');
    return;
  }
  
  await HistoricoService.load(pregadorId);
}

// Initialization
async function init() {
  try {
    // Load eventos
    const eventos = await ApiService.getEventos();
    const eventosAtivos = eventos.filter(e => e.status === 'ativo');
    
    UIService.populateSelect(elements.eventoSelect, eventosAtivos);
    state.eventos = eventosAtivos;
    
    // Setup event listeners
    elements.eventoSelect?.addEventListener('change', handleEventoChange);
    elements.pregadorSelect?.addEventListener('change', handlePregadorChange);
    
    console.log('✅ Aplicação inicializada com sucesso');
  } catch (error) {
    UIService.showError('Erro ao inicializar aplicação. Recarregue a página.');
    console.error('Erro na inicialização:', error);
  }
}

// Start application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  ChartService.destroy();
});

// Export for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ApiService,
    UIService,
    ChartService,
    HistoricoService
  };
}
