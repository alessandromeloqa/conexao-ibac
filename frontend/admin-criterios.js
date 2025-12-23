// API_URL já declarado em auth.js

async function init() {
    await carregarCriterios();
    await carregarEventos();
    
    document.getElementById('btnCriar').addEventListener('click', criarCriterio);
    document.getElementById('btnVincular').addEventListener('click', vincularCriterios);
}

async function carregarCriterios() {
    try {
        const response = await fetch(`${API_URL}/admin/criterios`);
        if (!response.ok) throw new Error('Falha ao carregar critérios');
        
        const criterios = await response.json();
        
        const tbody = document.querySelector('#criteriosTable tbody');
        tbody.innerHTML = '';
        
        const select = document.getElementById('criteriosVinculo');
        select.innerHTML = '';
        
        criterios.forEach(c => {
            const tr = document.createElement('tr');
            const nomeEscapado = c.nome.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            tr.innerHTML = `
                <td>${c.nome}</td>
                <td>${c.peso}</td>
                <td>${c.ordem}</td>
                <td>
                    <span style="color: ${c.ativo ? 'green' : 'red'}">
                        ${c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button onclick='editarCriterio(${c.id}, "${nomeEscapado}", ${c.peso}, ${c.ordem})' style="background: var(--accent); padding: 8px 16px; margin-right: 5px;">
                        Editar
                    </button>
                    <button onclick="toggleStatus(${c.id}, ${!c.ativo})">
                        ${c.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
            
            const option = new Option(c.nome, c.id);
            select.add(option);
        });
    } catch (error) {
        console.error('Erro ao carregar critérios:', error);
        mostrarMensagem('Erro ao carregar critérios. Verifique se o backend está rodando.', 'error');
    }
}

async function carregarEventos() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        if (!response.ok) throw new Error('Falha ao carregar eventos');
        
        const eventos = await response.json();
        
        const select = document.getElementById('eventoVinculo');
        select.innerHTML = '<option value="">Selecione</option>';
        
        eventos.forEach(e => {
            const option = new Option(e.nome, e.id);
            select.add(option);
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        mostrarMensagem('Erro ao carregar eventos. Verifique se o backend está rodando.', 'error');
    }
}

async function criarCriterio() {
    const nome = document.getElementById('nomeCriterio').value;
    const peso = parseFloat(document.getElementById('pesoCriterio').value);
    const ordem = parseInt(document.getElementById('ordemCriterio').value);
    
    if (!nome) {
        mostrarMensagem('Preencha o nome', 'error');
        return;
    }
    
    try {
        await fetch(`${API_URL}/admin/criterios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, peso, ordem })
        });
        
        mostrarMensagem('Critério criado', 'success');
        document.getElementById('nomeCriterio').value = '';
        await carregarCriterios();
    } catch (error) {
        mostrarMensagem('Erro ao criar', 'error');
    }
}

async function toggleStatus(id, ativo) {
    try {
        await fetch(`${API_URL}/admin/criterios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativo })
        });
        
        mostrarMensagem('Status atualizado', 'success');
        await carregarCriterios();
    } catch (error) {
        mostrarMensagem('Erro ao atualizar', 'error');
    }
}

async function vincularCriterios() {
    const eventoId = document.getElementById('eventoVinculo').value;
    const select = document.getElementById('criteriosVinculo');
    const criterioIds = Array.from(select.selectedOptions).map(o => parseInt(o.value));
    
    if (!eventoId || criterioIds.length === 0) {
        mostrarMensagem('Selecione evento e critérios', 'error');
        return;
    }
    
    try {
        await fetch(`${API_URL}/admin/eventos/${eventoId}/criterios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ criterioIds })
        });
        
        mostrarMensagem('Critérios vinculados ao evento', 'success');
    } catch (error) {
        mostrarMensagem('Erro ao vincular', 'error');
    }
}

function mostrarMensagem(texto, tipo) {
    const div = document.getElementById('mensagem');
    div.textContent = texto;
    div.className = `mensagem ${tipo}`;
    setTimeout(() => div.className = 'mensagem', 3000);
}

window.toggleStatus = toggleStatus;
init();


let criterioEditando = null;

function editarCriterio(id, nome, peso, ordem) {
    criterioEditando = id;
    document.getElementById('nomeCriterio').value = nome;
    document.getElementById('pesoCriterio').value = peso;
    document.getElementById('ordemCriterio').value = ordem;
    document.getElementById('tituloForm').textContent = 'Editar Critério';
    document.getElementById('btnCriar').textContent = 'Atualizar Critério';
    document.getElementById('btnCriar').onclick = atualizarCriterio;
    document.getElementById('btnCancelar').style.display = 'inline-block';
}

async function atualizarCriterio() {
    const nome = document.getElementById('nomeCriterio').value;
    const peso = parseFloat(document.getElementById('pesoCriterio').value);
    const ordem = parseInt(document.getElementById('ordemCriterio').value);
    
    if (!nome) {
        mostrarMensagem('Preencha o nome', 'error');
        return;
    }
    
    try {
        await fetch(`${API_URL}/admin/criterios/${criterioEditando}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, peso, ordem })
        });
        
        mostrarMensagem('Critério atualizado', 'success');
        cancelarEdicaoCriterio();
        await carregarCriterios();
    } catch (error) {
        mostrarMensagem('Erro ao atualizar', 'error');
    }
}

function cancelarEdicaoCriterio() {
    criterioEditando = null;
    document.getElementById('nomeCriterio').value = '';
    document.getElementById('pesoCriterio').value = '1.0';
    document.getElementById('ordemCriterio').value = '0';
    document.getElementById('tituloForm').textContent = 'Novo Critério';
    document.getElementById('btnCriar').textContent = 'Criar Critério';
    document.getElementById('btnCriar').onclick = criarCriterio;
    document.getElementById('btnCancelar').style.display = 'none';
}

window.editarCriterio = editarCriterio;
window.cancelarEdicaoCriterio = cancelarEdicaoCriterio;
