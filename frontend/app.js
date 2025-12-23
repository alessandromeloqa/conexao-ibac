const API_URL = 'http://localhost:3001/api';
let chart = null;

async function init() {
    await carregarEventos();
    document.getElementById('eventoSelect').addEventListener('change', carregarPregadores);
    document.getElementById('pregadorSelect').addEventListener('change', (e) => {
        if (e.target.value) carregarHistorico(e.target.value);
    });
}

async function carregarEventos() {
    try {
        const eventos = await fetch(`${API_URL}/eventos`).then(r => r.json());
        const select = document.getElementById('eventoSelect');
        
        eventos.filter(e => e.status === 'ativo').forEach(e => {
            select.add(new Option(e.nome, e.id));
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

async function carregarPregadores() {
    const eventoId = document.getElementById('eventoSelect').value;
    const select = document.getElementById('pregadorSelect');
    
    select.innerHTML = '<option value="">Selecione um pregador</option>';
    document.getElementById('content').style.display = 'none';
    
    if (!eventoId) return;
    
    try {
        const participacoes = await fetch(`${API_URL}/eventos/${eventoId}/participacoes`).then(r => r.json());
        
        participacoes.forEach(p => {
            select.add(new Option(p.pregador_nome, p.pregador_id));
        });
    } catch (error) {
        console.error('Erro ao carregar pregadores:', error);
    }
}

async function carregarHistorico(pregadorId) {
    try {
        const response = await fetch(`${API_URL}/pregador/${pregadorId}/historico`);
        if (!response.ok) throw new Error('Falha ao carregar histórico');
        
        const data = await response.json();

        document.getElementById('content').style.display = 'block';
        
        exibirResumo(data.resumo || {});
        exibirTabela(data.eventos || []);
        await carregarGrafico(pregadorId);
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        document.getElementById('content').style.display = 'block';
        exibirResumo({});
        exibirTabela([]);
    }
}

function exibirResumo(resumo) {
    document.getElementById('totalEventos').textContent = resumo.total_eventos || 0;
    document.getElementById('mediaGeral').textContent = resumo.media_geral_historica 
        ? parseFloat(resumo.media_geral_historica).toFixed(2) 
        : '-';
    document.getElementById('totalAvaliacoes').textContent = resumo.total_avaliacoes || 0;
}

function exibirTabela(eventos) {
    const tbody = document.querySelector('#historicoTable tbody');
    tbody.innerHTML = '';

    if (!eventos || eventos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum evento encontrado</td></tr>';
        return;
    }

    eventos.forEach(evento => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${evento.evento_nome}</td>
            <td>${new Date(evento.data_evento).toLocaleDateString('pt-BR')}</td>
            <td>${evento.tema || '-'}</td>
            <td>${parseFloat(evento.media_geral).toFixed(2)}</td>
            <td class="ranking">${evento.ranking}º</td>
            <td>${evento.total_avaliacoes}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function carregarGrafico(pregadorId) {
    try {
        const response = await fetch(`${API_URL}/pregador/${pregadorId}/evolucao`);
        const data = await response.json();

        const ctx = document.getElementById('evolucaoChart').getContext('2d');
        
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.evento_nome),
                datasets: [{
                    label: 'Média por Evento',
                    data: data.map(d => parseFloat(d.media_geral)),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar gráfico:', error);
    }
}

init();
