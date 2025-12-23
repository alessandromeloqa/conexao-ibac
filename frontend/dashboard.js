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
        const select = document.getElementById('eventoFiltro');
        
        eventos.filter(e => e.status === 'ativo').forEach(e => {
            select.add(new Option(e.nome, e.id));
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

init();
