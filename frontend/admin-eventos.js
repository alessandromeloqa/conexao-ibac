// API_URL já declarado em auth.js

async function init() {
    await carregarEventos();
    document.getElementById('btnCriar').addEventListener('click', criarEvento);
}

async function carregarEventos() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        if (!response.ok) throw new Error('Falha ao carregar eventos');
        
        const eventos = await response.json();
        
        const tbody = document.querySelector('#eventosTable tbody');
        tbody.innerHTML = '';
        
        for (const e of eventos) {
            const tr = document.createElement('tr');
            const data = new Date(e.data_evento).toLocaleDateString('pt-BR');
            const nomeEscapado = e.nome.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const localEscapado = (e.local || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const dataISO = e.data_evento.split('T')[0];
            
            let linkAcesso = '-';
            if (e.token_acesso) {
                const url = `${window.location.origin}/avaliacao.html?token=${e.token_acesso}`;
                linkAcesso = `<button onclick="copiarLink('${url}')" style="padding: 6px 12px; font-size: 12px;">Copiar Link</button>`;
            } else {
                linkAcesso = `<button onclick="gerarLink(${e.id})" style="padding: 6px 12px; font-size: 12px; background: var(--success);">Gerar Link</button>`;
            }
            
            tr.innerHTML = `
                <td>${e.nome}</td>
                <td>${data}</td>
                <td>${e.local || '-'}</td>
                <td>
                    <span style="color: ${e.status === 'ativo' ? 'green' : 'gray'}">
                        ${e.status === 'ativo' ? 'Ativo' : 'Encerrado'}
                    </span>
                </td>
                <td>${linkAcesso}</td>
                <td>
                    <button onclick='editarEvento(${e.id}, "${nomeEscapado}", "${dataISO}", "${localEscapado}", "${e.status}")' 
                            style="padding: 8px 16px; margin-right: 5px; background: var(--accent);">
                        Editar
                    </button>
                    <button onclick="toggleStatus(${e.id}, '${e.status === 'ativo' ? 'encerrado' : 'ativo'}')" 
                            style="padding: 8px 16px; margin-right: 5px;">
                        ${e.status === 'ativo' ? 'Encerrar' : 'Ativar'}
                    </button>
                    <button onclick="deletarEvento(${e.id})" 
                            style="background: var(--danger); padding: 8px 16px;">
                        Deletar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        mostrarMensagem('Erro ao carregar eventos. Verifique se o backend está rodando.', 'error');
    }
}

async function criarEvento() {
    const nome = document.getElementById('nome').value;
    const data_evento = document.getElementById('data_evento').value;
    const local = document.getElementById('local').value;
    const status = document.getElementById('status').value;
    
    if (!nome || !data_evento) {
        mostrarMensagem('Preencha nome e data', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/eventos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, data_evento, local, status })
        });
        
        if (!response.ok) throw new Error('Falha ao criar evento');
        
        mostrarMensagem('Evento cadastrado com sucesso', 'success');
        document.getElementById('nome').value = '';
        document.getElementById('data_evento').value = '';
        document.getElementById('local').value = '';
        await carregarEventos();
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao cadastrar evento', 'error');
    }
}

async function toggleStatus(id, novoStatus) {
    try {
        const response = await fetch(`${API_URL}/eventos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        
        if (!response.ok) throw new Error('Falha ao atualizar');
        
        mostrarMensagem('Status atualizado', 'success');
        await carregarEventos();
    } catch (error) {
        mostrarMensagem('Erro ao atualizar status', 'error');
    }
}

async function deletarEvento(id) {
    if (!confirm('Deseja realmente deletar este evento?')) return;
    
    try {
        const response = await fetch(`${API_URL}/eventos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Falha ao deletar');
        
        mostrarMensagem('Evento deletado', 'success');
        await carregarEventos();
    } catch (error) {
        mostrarMensagem('Erro ao deletar. Pode haver participações vinculadas.', 'error');
    }
}

function mostrarMensagem(texto, tipo) {
    const div = document.getElementById('mensagem');
    div.textContent = texto;
    div.className = `mensagem ${tipo}`;
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 3000);
}

window.toggleStatus = toggleStatus;
window.deletarEvento = deletarEvento;
init();


async function gerarLink(eventoId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/evento/${eventoId}/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Falha ao gerar link');
        
        const data = await response.json();
        mostrarMensagem('Link gerado com sucesso!', 'success');
        await carregarEventos();
        
        // Copiar automaticamente
        copiarLink(data.url);
    } catch (error) {
        mostrarMensagem('Erro ao gerar link', 'error');
    }
}

function copiarLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        mostrarMensagem('Link copiado para área de transferência!', 'success');
    }).catch(() => {
        prompt('Copie o link:', url);
    });
}

window.gerarLink = gerarLink;
window.copiarLink = copiarLink;


let eventoEditando = null;

function editarEvento(id, nome, data, local, status) {
    eventoEditando = id;
    document.getElementById('nome').value = nome;
    document.getElementById('data_evento').value = data;
    document.getElementById('local').value = local;
    document.getElementById('status').value = status;
    document.getElementById('btnCriar').textContent = 'Atualizar Evento';
    document.getElementById('btnCriar').onclick = atualizarEvento;
}

async function atualizarEvento() {
    const nome = document.getElementById('nome').value;
    const data_evento = document.getElementById('data_evento').value;
    const local = document.getElementById('local').value;
    const status = document.getElementById('status').value;
    
    if (!nome || !data_evento) {
        mostrarMensagem('Preencha nome e data', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/eventos/${eventoEditando}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, data_evento, local, status })
        });
        
        if (!response.ok) throw new Error('Falha ao atualizar evento');
        
        mostrarMensagem('Evento atualizado com sucesso', 'success');
        cancelarEdicao();
        await carregarEventos();
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao atualizar evento', 'error');
    }
}

function cancelarEdicao() {
    eventoEditando = null;
    document.getElementById('nome').value = '';
    document.getElementById('data_evento').value = '';
    document.getElementById('local').value = '';
    document.getElementById('btnCriar').textContent = 'Cadastrar Evento';
    document.getElementById('btnCriar').onclick = criarEvento;
}

window.editarEvento = editarEvento;
