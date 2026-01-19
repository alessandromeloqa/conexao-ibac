// API_URL já declarado em auth.js

let avaliacoesChart = null;
let mediasChart = null;
let eventoSelecionado = '';

async function init() {
    await carregarEventos();
    await carregarDados();
    document.getElementById('eventoFiltro').addEventListener('change', carregarDados);
}

async function carregarEventos() {
    try {
        const eventos = await fetch(`${API_URL}/eventos`).then(r => r.json());
        const selectFiltro = document.getElementById('eventoFiltro');
        const selectRelatorio = document.getElementById('eventoRelatorioGeral');
        
        eventos.filter(e => e.status === 'ativo').forEach(e => {
            selectFiltro.add(new Option(e.nome, e.id));
        });
        
        eventos.forEach(e => {
            selectRelatorio.add(new Option(e.nome, e.id));
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

async function carregarDados() {
    eventoSelecionado = document.getElementById('eventoFiltro').value;
    await carregarResumo();
    await carregarGraficos();
    await carregarUltimasAvaliacoes();
}

async function carregarResumo() {
    try {
        const [eventos, pregadores, stats] = await Promise.all([
            fetch(`${API_URL}/eventos`).then(r => r.json()),
            fetch(`${API_URL}/pregadores`).then(r => r.json()),
            fetch(`${API_URL}/dashboard/stats${eventoSelecionado ? '?evento_id=' + eventoSelecionado : ''}`).then(r => r.json()).catch(() => ({ total_avaliacoes: 0 }))
        ]);

        if (eventoSelecionado) {
            const participacoes = await fetch(`${API_URL}/eventos/${eventoSelecionado}/participacoes`).then(r => r.json());
            document.getElementById('totalEventos').textContent = 1;
            document.getElementById('totalPregadores').textContent = participacoes.length;
        } else {
            document.getElementById('totalEventos').textContent = eventos.length;
            document.getElementById('totalPregadores').textContent = pregadores.length;
        }
        
        document.getElementById('totalAvaliacoes').textContent = stats.total_avaliacoes || 0;
        document.getElementById('eventosAtivos').textContent = eventos.filter(e => e.status === 'ativo').length;
    } catch (error) {
        console.error('Erro ao carregar resumo:', error);
    }
}

async function carregarGraficos() {
    try {
        const eventos = await fetch(`${API_URL}/eventos`).then(r => r.json());
        const eventosFiltrados = eventoSelecionado 
            ? eventos.filter(e => e.id == eventoSelecionado)
            : eventos.slice(0, 5);
        
        const dadosEventos = [];
        for (const evento of eventosFiltrados) {
            try {
                const ranking = await fetch(`${API_URL}/ranking/${evento.id}`).then(r => r.json());
                dadosEventos.push({
                    nome: evento.nome,
                    total: ranking.ranking?.length || 0,
                    media: ranking.ranking?.[0]?.media || 0
                });
            } catch (e) {
                dadosEventos.push({ nome: evento.nome, total: 0, media: 0 });
            }
        }

        const ctx1 = document.getElementById('avaliacoesChart').getContext('2d');
        if (avaliacoesChart) avaliacoesChart.destroy();
        
        avaliacoesChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: dadosEventos.map(d => d.nome),
                datasets: [{
                    label: 'Número de Participantes',
                    data: dadosEventos.map(d => d.total),
                    backgroundColor: 'rgba(26, 77, 124, 0.8)',
                    borderColor: 'rgba(26, 77, 124, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        const ctx2 = document.getElementById('mediasChart').getContext('2d');
        if (mediasChart) mediasChart.destroy();
        
        mediasChart = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: dadosEventos.map(d => d.nome),
                datasets: [{
                    label: 'Média Geral',
                    data: dadosEventos.map(d => d.media),
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 10 }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar gráficos:', error);
    }
}

async function carregarUltimasAvaliacoes() {
    try {
        const url = eventoSelecionado 
            ? `${API_URL}/dashboard/ultimas-avaliacoes?evento_id=${eventoSelecionado}`
            : `${API_URL}/dashboard/ultimas-avaliacoes`;
        
        const avaliacoes = await fetch(url).then(r => r.json()).catch(() => []);

        const tbody = document.querySelector('#ultimasAvaliacoes tbody');
        tbody.innerHTML = '';

        if (avaliacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhuma avaliação encontrada</td></tr>';
            return;
        }

        avaliacoes.slice(0, 10).forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
                <td>${a.evento_nome}</td>
                <td>${a.pregador_nome}</td>
                <td>${a.avaliador_nome}</td>
                <td>${parseFloat(a.nota).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar últimas avaliações:', error);
    }
}

// Relatórios
const modal = document.getElementById('modalRelatorio');
const closeBtn = document.querySelector('.close-relatorio');
const btnRelatorioGeral = document.getElementById('btnRelatorioGeral');
const btnRelatorioPorCandidato = document.getElementById('btnRelatorioPorCandidato');
const eventoRelatorioSelect = document.getElementById('eventoRelatorio');
const pregadorRelatorioSelect = document.getElementById('pregadorRelatorio');
const btnGerarRelatorio = document.getElementById('btnGerarRelatorio');

btnRelatorioGeral.addEventListener('click', gerarRelatorioGeral);
btnRelatorioPorCandidato.addEventListener('click', abrirModalCandidato);
closeBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

eventoRelatorioSelect.addEventListener('change', carregarPregadoresRelatorio);
btnGerarRelatorio.addEventListener('click', gerarRelatorioCandidato);

async function gerarRelatorioGeral() {
    try {
        const eventoId = document.getElementById('eventoRelatorioGeral').value;
        
        btnRelatorioGeral.disabled = true;
        btnRelatorioGeral.textContent = '⏳ Gerando...';
        
        const url = eventoId 
            ? `${API_URL}/relatorios/geral/pdf?eventoId=${eventoId}`
            : `${API_URL}/relatorios/geral/pdf`;
        
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Erro ao gerar relatório');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `relatorio_geral_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        btnRelatorioGeral.disabled = false;
        btnRelatorioGeral.textContent = '📄 Relatório Geral';
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao gerar relatório');
        btnRelatorioGeral.disabled = false;
        btnRelatorioGeral.textContent = '📄 Relatório Geral';
    }
}

async function abrirModalCandidato() {
    modal.style.display = 'block';
    
    try {
        const eventos = await fetch(`${API_URL}/eventos`).then(r => r.json());
        eventoRelatorioSelect.innerHTML = '<option value="">Selecione um evento</option>';
        eventos.forEach(e => {
            eventoRelatorioSelect.add(new Option(e.nome, e.id));
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

async function carregarPregadoresRelatorio() {
    const eventoId = eventoRelatorioSelect.value;
    pregadorRelatorioSelect.innerHTML = '<option value="">Selecione um pregador</option>';
    btnGerarRelatorio.disabled = true;
    
    if (!eventoId) return;
    
    try {
        const participacoes = await fetch(`${API_URL}/eventos/${eventoId}/participacoes`).then(r => r.json());
        participacoes.forEach(p => {
            pregadorRelatorioSelect.add(new Option(p.pregador_nome, p.pregador_id));
        });
    } catch (error) {
        console.error('Erro ao carregar pregadores:', error);
    }
}

pregadorRelatorioSelect.addEventListener('change', () => {
    btnGerarRelatorio.disabled = !pregadorRelatorioSelect.value;
});

async function gerarRelatorioCandidato() {
    const pregadorId = pregadorRelatorioSelect.value;
    const eventoId = eventoRelatorioSelect.value;
    
    if (!pregadorId || !eventoId) return;
    
    try {
        btnGerarRelatorio.disabled = true;
        btnGerarRelatorio.textContent = '⏳ Gerando...';
        
        const response = await fetch(`${API_URL}/relatorios/candidato/${pregadorId}/evento/${eventoId}/pdf`);
        
        if (!response.ok) throw new Error('Erro ao gerar relatório');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_candidato_${pregadorId}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        modal.style.display = 'none';
        btnGerarRelatorio.disabled = false;
        btnGerarRelatorio.textContent = 'Gerar Relatório';
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao gerar relatório');
        btnGerarRelatorio.disabled = false;
        btnGerarRelatorio.textContent = 'Gerar Relatório';
    }
}

init();
