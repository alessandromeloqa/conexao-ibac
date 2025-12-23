const API_URL = 'http://localhost:3001/api';
const EVENTO_ID = new URLSearchParams(window.location.search).get('evento') || 1;
const INTERVALO_ATUALIZACAO = 5000;

async function carregarRanking() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_URL}/ranking/${EVENTO_ID}?_t=${timestamp}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Ranking carregado:', data);

        atualizarHeader(data.evento);
        atualizarPodio(data.ranking);
        atualizarTabelaCompleta(data.ranking);
        
        // Mostrar indicador de atualização
        const indicador = document.getElementById('atualizando');
        if (indicador) {
            indicador.style.display = 'inline';
            setTimeout(() => indicador.style.display = 'none', 2000);
        }
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
    }
}

function atualizarHeader(evento) {
    if (!evento) return;
    
    document.getElementById('eventoNome').textContent = evento.nome;
    document.getElementById('eventoData').textContent = 
        new Date(evento.data_evento).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
}

function atualizarPodio(ranking) {
    const posicoes = ['primeiro', 'segundo', 'terceiro'];
    
    posicoes.forEach((pos, index) => {
        const elemento = document.getElementById(pos);
        const pregador = ranking[index === 0 ? 0 : index === 1 ? 1 : 2];
        
        if (pregador) {
            elemento.querySelector('.nome').textContent = pregador.pregador;
            elemento.querySelector('.nota').textContent = parseFloat(pregador.media).toFixed(2);
        } else {
            elemento.querySelector('.nome').textContent = '-';
            elemento.querySelector('.nota').textContent = '-';
        }
    });
}

function atualizarTabelaCompleta(ranking) {
    const tbody = document.querySelector('#rankingTable tbody');
    tbody.innerHTML = '';

    if (!ranking || ranking.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum dado disponível</td></tr>';
        return;
    }

    ranking.forEach((item) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.posicao}º</td>
            <td>${item.pregador}</td>
            <td>${parseFloat(item.media).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

carregarRanking();
setInterval(carregarRanking, INTERVALO_ATUALIZACAO);
