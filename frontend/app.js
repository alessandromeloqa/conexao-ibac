const API_URL = 'http://localhost:3001/api';
let chart = null;
let pregadorAtual = null;

async function init() {
    await carregarEventos();
    document.getElementById('eventoSelect').addEventListener('change', carregarPregadores);
    document.getElementById('pregadorSelect').addEventListener('change', (e) => {
        if (e.target.value) {
            pregadorAtual = e.target.value;
            carregarHistorico(e.target.value);
        }
    });
    
    document.getElementById('btnExportarPDF').addEventListener('click', exportarPDF);
    
    const modal = document.getElementById('modalDetalhes');
    const closeBtn = document.querySelector('.close');
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
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
        document.getElementById('btnExportarPDF').style.display = 'inline-block';
        
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum evento encontrado</td></tr>';
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
            <td>
                <button class="btn-detalhes" onclick="verDetalhes(${evento.pregador_id}, ${evento.evento_id})">Ver Detalhes</button>
            </td>
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

async function verDetalhes(pregadorId, eventoId) {
    try {
        const response = await fetch(`${API_URL}/pregador/${pregadorId}/evento/${eventoId}/detalhes`);
        const detalhes = await response.json();
        
        if (!detalhes || detalhes.length === 0) {
            alert('Nenhum detalhe encontrado');
            return;
        }
        
        const modal = document.getElementById('modalDetalhes');
        const modalBody = document.getElementById('modalBody');
        
        const evento = detalhes[0];
        const criteriosAgrupados = {};
        
        detalhes.forEach(d => {
            if (!criteriosAgrupados[d.criterio_nome]) {
                criteriosAgrupados[d.criterio_nome] = [];
            }
            criteriosAgrupados[d.criterio_nome].push(d);
        });
        
        let html = `
            <div style="margin-bottom: 20px;">
                <h3>${evento.evento_nome}</h3>
                <p><strong>Pregador:</strong> ${evento.pregador_nome}</p>
                <p><strong>Data:</strong> ${new Date(evento.data_evento).toLocaleDateString('pt-BR')}</p>
            </div>
        `;
        
        Object.keys(criteriosAgrupados).forEach(criterio => {
            html += `<div class="detalhes-grupo">`;
            html += `<h3>${criterio}</h3>`;
            
            criteriosAgrupados[criterio].forEach(avaliacao => {
                html += `
                    <div class="avaliacao-item">
                        <div class="avaliador">👤 ${avaliacao.avaliador_nome}</div>
                        <div class="nota">Nota: ${parseFloat(avaliacao.nota).toFixed(2)}</div>
                        <div class="data">${new Date(avaliacao.data_avaliacao).toLocaleString('pt-BR')}</div>
                    </div>
                `;
            });
            
            const media = criteriosAgrupados[criterio].reduce((sum, a) => sum + parseFloat(a.nota), 0) / criteriosAgrupados[criterio].length;
            html += `<p style="margin-top: 10px; font-weight: 600;">Média: ${media.toFixed(2)}</p>`;
            html += `</div>`;
        });
        
        modalBody.innerHTML = html;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes');
    }
}

async function exportarPDF() {
    if (!pregadorAtual) {
        alert('Selecione um pregador primeiro');
        return;
    }
    
    try {
        const btn = document.getElementById('btnExportarPDF');
        btn.disabled = true;
        btn.textContent = '⏳ Gerando PDF...';
        
        const response = await fetch(`${API_URL}/pregador/${pregadorAtual}/historico/pdf`);
        
        if (!response.ok) {
            throw new Error('Erro ao gerar PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historico_pregador.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        btn.disabled = false;
        btn.textContent = '📄 Exportar PDF';
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        alert('Erro ao gerar PDF. Tente novamente.');
        const btn = document.getElementById('btnExportarPDF');
        btn.disabled = false;
        btn.textContent = '📄 Exportar PDF';
    }
}

init();
