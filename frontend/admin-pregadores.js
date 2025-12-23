// API_URL já declarado em auth.js

async function init() {
    await carregarEventos();
    await carregarParticipacoes();
    document.getElementById('btnCriar').addEventListener('click', criarParticipacao);
    document.getElementById('eventoFiltro').addEventListener('change', carregarParticipacoes);
    document.getElementById('btnImportar').addEventListener('click', importarPregadores);
    document.getElementById('btnBaixarModelo').addEventListener('click', baixarModelo);
}

async function carregarEventos() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        if (!response.ok) throw new Error('Falha ao carregar eventos');
        
        const eventos = await response.json();
        
        const selectCadastro = document.getElementById('eventoSelect');
        const selectFiltro = document.getElementById('eventoFiltro');
        const selectImportar = document.getElementById('eventoImportar');
        
        selectCadastro.innerHTML = '<option value="">Selecione o evento</option>';
        selectFiltro.innerHTML = '<option value="">Todos os eventos</option>';
        selectImportar.innerHTML = '<option value="">Selecione o evento</option>';
        
        eventos.forEach(e => {
            selectCadastro.add(new Option(e.nome, e.id));
            selectFiltro.add(new Option(e.nome, e.id));
            selectImportar.add(new Option(e.nome, e.id));
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        mostrarMensagem('Erro ao carregar eventos', 'error');
    }
}

async function carregarParticipacoes() {
    try {
        const eventoId = document.getElementById('eventoFiltro').value;
        const url = eventoId ? `${API_URL}/eventos/${eventoId}/participacoes` : `${API_URL}/participacoes`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao carregar participações');
        
        const participacoes = await response.json();
        
        const tbody = document.querySelector('#pregadoresTable tbody');
        tbody.innerHTML = '';
        
        participacoes.forEach(p => {
            const tr = document.createElement('tr');
            const nomeEscapado = p.pregador_nome.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const temaEscapado = (p.tema || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            tr.innerHTML = `
                <td>${p.evento_nome || '-'}</td>
                <td>${p.pregador_nome}</td>
                <td>${p.tema || '-'}</td>
                <td>
                    <button onclick='editarParticipacao(${p.id}, "${nomeEscapado}", "${temaEscapado}")' style="background: var(--accent); padding: 8px 16px; margin-right: 5px;">
                        Editar
                    </button>
                    <button onclick="deletarParticipacao(${p.id})" style="background: var(--danger); padding: 8px 16px;">
                        Deletar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar participações:', error);
        mostrarMensagem('Erro ao carregar pregadores', 'error');
    }
}

async function criarParticipacao() {
    const eventoId = document.getElementById('eventoSelect').value;
    const nome = document.getElementById('nome').value;
    const tema = document.getElementById('tema').value;
    
    if (!eventoId || !nome) {
        mostrarMensagem('Preencha evento e nome do pregador', 'error');
        return;
    }
    
    try {
        // Primeiro cria ou busca o pregador
        let pregadorId;
        const pregadoresRes = await fetch(`${API_URL}/pregadores`);
        const pregadores = await pregadoresRes.json();
        const pregadorExistente = pregadores.find(p => p.nome.toLowerCase() === nome.toLowerCase());
        
        if (pregadorExistente) {
            pregadorId = pregadorExistente.id;
        } else {
            const novoPregadorRes = await fetch(`${API_URL}/pregadores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome })
            });
            const novoPregador = await novoPregadorRes.json();
            pregadorId = novoPregador.id;
        }
        
        // Cria a participação
        const response = await fetch(`${API_URL}/participacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ evento_id: eventoId, pregador_id: pregadorId, tema })
        });
        
        if (!response.ok) throw new Error('Falha ao criar participação');
        
        mostrarMensagem('Pregador cadastrado no evento com sucesso', 'success');
        document.getElementById('eventoSelect').value = '';
        document.getElementById('nome').value = '';
        document.getElementById('tema').value = '';
        await carregarParticipacoes();
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao cadastrar. Pregador pode já estar neste evento.', 'error');
    }
}

async function deletarParticipacao(id) {
    if (!confirm('Deseja realmente remover este pregador do evento?')) return;
    
    try {
        const response = await fetch(`${API_URL}/participacoes/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Falha ao deletar');
        
        mostrarMensagem('Participação removida', 'success');
        await carregarParticipacoes();
    } catch (error) {
        mostrarMensagem('Erro ao deletar. Pode haver avaliações vinculadas.', 'error');
    }
}

function mostrarMensagem(texto, tipo) {
    const div = document.getElementById('mensagem');
    div.textContent = texto;
    div.className = `mensagem ${tipo}`;
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 3000);
}

window.deletarParticipacao = deletarParticipacao;
init();


let participacaoEditando = null;

function editarParticipacao(id, nome, tema) {
    participacaoEditando = id;
    document.getElementById('editNome').value = nome;
    document.getElementById('editTema').value = tema || '';
    document.getElementById('modalEditar').style.display = 'flex';
}

async function salvarEdicao() {
    const tema = document.getElementById('editTema').value;
    
    try {
        const response = await fetch(`${API_URL}/participacoes/${participacaoEditando}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema })
        });
        
        if (!response.ok) throw new Error('Falha ao atualizar');
        
        mostrarMensagem('Participação atualizada', 'success');
        fecharModal();
        await carregarParticipacoes();
    } catch (error) {
        mostrarMensagem('Erro ao atualizar', 'error');
    }
}

function fecharModal() {
    document.getElementById('modalEditar').style.display = 'none';
    participacaoEditando = null;
}

window.editarParticipacao = editarParticipacao;
window.salvarEdicao = salvarEdicao;
window.fecharModal = fecharModal;

async function importarPregadores() {
    const eventoId = document.getElementById('eventoImportar').value;
    const arquivo = document.getElementById('arquivoCSV').files[0];
    
    if (!eventoId || !arquivo) {
        mostrarMensagem('Selecione o evento e o arquivo CSV', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('evento_id', eventoId);
    
    try {
        const response = await fetch(`${API_URL}/pregadores/importar`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Falha na importação');
        
        const resultado = await response.json();
        
        let mensagem = `Importação concluída: ${resultado.sucesso} pregadores cadastrados`;
        if (resultado.erros.length > 0) {
            mensagem += `\n\nErros (${resultado.erros.length}):\n${resultado.erros.slice(0, 5).join('\n')}`;
            if (resultado.erros.length > 5) {
                mensagem += `\n... e mais ${resultado.erros.length - 5} erros`;
            }
        }
        
        alert(mensagem);
        
        document.getElementById('eventoImportar').value = '';
        document.getElementById('arquivoCSV').value = '';
        await carregarParticipacoes();
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao importar arquivo', 'error');
    }
}

function baixarModelo(e) {
    e.preventDefault();
    const csv = 'nome\nJoão Silva\nMaria Santos\nPedro Oliveira';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_pregadores.csv';
    link.click();
}
