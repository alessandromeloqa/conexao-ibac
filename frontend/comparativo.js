const API_URL = 'http://localhost:3001/api';
let barChart = null;
let radarChart = null;

async function init() {
    await carregarEventos();
    await carregarCriterios();
    
    document.getElementById('btnComparar').addEventListener('click', comparar);
    document.getElementById('dataInicio').addEventListener('change', carregarEventos);
    document.getElementById('dataFim').addEventListener('change', carregarEventos);
}

async function carregarEventos() {
    try {
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        
        let url = `${API_URL}/eventos`;
        const params = [];
        if (dataInicio) params.push(`dataInicio=${dataInicio}`);
        if (dataFim) params.push(`dataFim=${dataFim}`);
        if (params.length) url += '?' + params.join('&');
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao carregar eventos');
        
        const eventos = await response.json();
        
        const select = document.getElementById('eventoSelect');
        select.innerHTML = eventos.map(e => 
            `<option value="${e.id}">${e.nome} (${new Date(e.data_evento).toLocaleDateString('pt-BR')})</option>`
        ).join('');
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

async function carregarCriterios() {
    try {
        const response = await fetch(`${API_URL}/criterios`);
        if (!response.ok) throw new Error('Falha ao carregar critérios');
        
        const criterios = await response.json();
        
        const select = document.getElementById('criterioSelect');
        criterios.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar critérios:', error);
    }
}

async function comparar() {
    const select = document.getElementById('eventoSelect');
    const selectedIds = Array.from(select.selectedOptions).map(o => o.value);
    
    if (selectedIds.length < 2) {
        alert('Selecione pelo menos 2 eventos');
        return;
    }
    
    const criterioId = document.getElementById('criterioSelect').value;
    
    let url = `${API_URL}/comparativo/eventos?eventoIds=${selectedIds.join(',')}`;
    if (criterioId) url += `&criterioId=${criterioId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    document.getElementById('results').style.display = 'block';
    
    exibirGraficoBarras(data);
    await exibirGraficoRadar(selectedIds);
    exibirTabela(data);
}

function exibirGraficoBarras(data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    if (barChart) barChart.destroy();
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.evento),
            datasets: [{
                label: 'Média',
                data: data.map(d => parseFloat(d.media)),
                backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 10 }
            }
        }
    });
}

async function exibirGraficoRadar(eventoIds) {
    const datasets = [];
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
    
    for (let i = 0; i < eventoIds.length; i++) {
        const response = await fetch(`${API_URL}/comparativo/evento/${eventoIds[i]}/criterios`);
        const criterios = await response.json();
        
        const eventoNome = document.querySelector(`#eventoSelect option[value="${eventoIds[i]}"]`).textContent;
        
        datasets.push({
            label: eventoNome,
            data: criterios.map(c => parseFloat(c.media)),
            borderColor: colors[i],
            backgroundColor: colors[i] + '33'
        });
    }
    
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    if (radarChart) radarChart.destroy();
    
    const labels = datasets[0] ? await getCriterioLabels(eventoIds[0]) : [];
    
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: { labels, datasets },
        options: {
            responsive: true,
            scales: {
                r: { beginAtZero: true, max: 10 }
            }
        }
    });
}

async function getCriterioLabels(eventoId) {
    const response = await fetch(`${API_URL}/comparativo/evento/${eventoId}/criterios`);
    const criterios = await response.json();
    return criterios.map(c => c.criterio);
}

function exibirTabela(data) {
    const tbody = document.querySelector('#comparativoTable tbody');
    tbody.innerHTML = '';
    
    const medias = data.map(d => parseFloat(d.media));
    const mediaMax = Math.max(...medias);
    
    data.forEach(d => {
        const media = parseFloat(d.media);
        const diff = (media - mediaMax).toFixed(2);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d.evento}</td>
            <td>${media.toFixed(2)}</td>
            <td style="color: ${diff >= 0 ? 'green' : 'red'}">${diff >= 0 ? '+' : ''}${diff}</td>
        `;
        tbody.appendChild(tr);
    });
}

init();
