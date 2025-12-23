const API_URL = 'http://localhost:3001/api';

async function init() {
    await carregarEventosEncerrados();
    
    document.getElementById('btnGerarIndividual').addEventListener('click', gerarIndividual);
    document.getElementById('btnGerarLote').addEventListener('click', gerarLote);
    document.getElementById('btnValidar').addEventListener('click', validar);
    document.getElementById('eventoIndividual').addEventListener('change', carregarPregadores);
}

async function carregarEventosEncerrados() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        if (!response.ok) throw new Error('Falha ao carregar eventos');
        
        const eventos = await response.json();
        
        const encerrados = eventos.filter(e => e.status === 'encerrado');
        
        const selectIndividual = document.getElementById('eventoIndividual');
        const selectLote = document.getElementById('eventoLote');
        
        encerrados.forEach(e => {
            const option1 = new Option(e.nome, e.id);
            const option2 = new Option(e.nome, e.id);
            selectIndividual.add(option1);
            selectLote.add(option2);
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

async function carregarPregadores() {
    const eventoId = document.getElementById('eventoIndividual').value;
    if (!eventoId) return;
    
    const response = await fetch(`${API_URL}/eventos/${eventoId}/participacoes`);
    const participacoes = await response.json();
    
    const select = document.getElementById('pregadorIndividual');
    select.innerHTML = '<option value="">Selecione</option>';
    
    participacoes.forEach(p => {
        const option = new Option(p.pregador_nome, p.id);
        select.add(option);
    });
}

async function gerarIndividual() {
    const participacaoId = document.getElementById('pregadorIndividual').value;
    
    if (!participacaoId) {
        alert('Selecione um pregador');
        return;
    }
    
    window.open(`${API_URL}/certificado/participacao/${participacaoId}`, '_blank');
}

async function gerarLote() {
    const eventoId = document.getElementById('eventoLote').value;
    
    if (!eventoId) {
        alert('Selecione um evento');
        return;
    }
    
    const response = await fetch(`${API_URL}/certificado/evento/${eventoId}/lote`);
    const data = await response.json();
    
    const result = document.getElementById('loteResult');
    result.innerHTML = `<p>${data.participacoes.length} certificados disponíveis</p>`;
    
    data.participacoes.forEach(id => {
        const link = document.createElement('a');
        link.href = `${API_URL}/certificado/participacao/${id}`;
        link.target = '_blank';
        link.textContent = `Certificado ${id}`;
        link.style.display = 'block';
        link.style.marginTop = '5px';
        result.appendChild(link);
    });
}

async function validar() {
    const codigo = document.getElementById('codigoValidacao').value;
    
    if (!codigo) {
        alert('Informe o código');
        return;
    }
    
    const response = await fetch(`${API_URL}/certificado/validar/${codigo}`);
    const data = await response.json();
    
    const result = document.getElementById('validacaoResult');
    
    if (data.valido) {
        result.innerHTML = `
            <div style="color: green; margin-top: 10px;">
                <strong>✓ Certificado Válido</strong><br>
                Pregador: ${data.dados.pregador_nome}<br>
                Evento: ${data.dados.evento_nome}<br>
                Média: ${parseFloat(data.dados.media_geral).toFixed(2)}<br>
                Ranking: ${data.dados.ranking}º
            </div>
        `;
    } else {
        result.innerHTML = '<div style="color: red; margin-top: 10px;">✗ Certificado Inválido</div>';
    }
}

init();
