import { offlineManager, sincronizar, atualizarStatusUI } from './offline.js';

const API_URL = 'http://localhost:3001/api';
let criterios = [];

async function init() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }

    await offlineManager.init();
    await carregarDados();
    
    document.getElementById('eventoSelect').addEventListener('change', carregarPregadores);
    document.getElementById('btnEnviar').addEventListener('click', enviarAvaliacao);
    
    atualizarStatusUI();
    setInterval(atualizarStatusUI, 5000);
}

async function carregarDados() {
    try {
        if (!navigator.onLine) {
            criterios = await offlineManager.getCriteriosCache();
            renderizarCriterios();
            return;
        }

        const eventoId = document.getElementById('eventoSelect').value;
        
        const eventosRes = await fetch(`${API_URL}/eventos`);
        if (!eventosRes.ok) throw new Error('Falha ao carregar eventos');
        
        const eventos = await eventosRes.json();
        
        eventos.forEach(e => offlineManager.cacheEvento(e));
        preencherEventos(eventos.filter(e => e.status === 'ativo'));
        
        if (eventoId) {
            const criteriosRes = await fetch(`${API_URL}/eventos/${eventoId}/criterios`);
            if (criteriosRes.ok) {
                const criteriosData = await criteriosRes.json();
                await offlineManager.cacheCriterios(criteriosData);
                criterios = criteriosData;
            }
        } else {
            const criteriosRes = await fetch(`${API_URL}/criterios`);
            if (criteriosRes.ok) {
                const criteriosData = await criteriosRes.json();
                await offlineManager.cacheCriterios(criteriosData);
                criterios = criteriosData;
            }
        }

        renderizarCriterios();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        criterios = await offlineManager.getCriteriosCache();
        renderizarCriterios();
    }
}

function preencherEventos(eventos) {
    const select = document.getElementById('eventoSelect');
    select.innerHTML = '<option value="">Selecione</option>';
    eventos.forEach(e => {
        const option = new Option(e.nome, e.id);
        select.add(option);
    });
}

async function carregarPregadores() {
    const eventoId = document.getElementById('eventoSelect').value;
    if (!eventoId) return;

    try {
        const [participacoesRes, criteriosRes] = await Promise.all([
            fetch(`${API_URL}/eventos/${eventoId}/participacoes`),
            fetch(`${API_URL}/eventos/${eventoId}/criterios`)
        ]);
        
        const participacoes = await participacoesRes.json();
        criterios = await criteriosRes.json();
        
        await offlineManager.cacheCriterios(criterios);
        renderizarCriterios();

        const select = document.getElementById('pregadorSelect');
        select.innerHTML = '<option value="">Selecione</option>';
        
        const avaliadorNome = document.getElementById('avaliadorNome').value;
        
        for (const p of participacoes) {
            // Verifica se já avaliou este pregador
            let jaAvaliou = false;
            if (avaliadorNome) {
                for (const c of criterios) {
                    const duplicata = await offlineManager.verificarDuplicata(p.id, c.id, avaliadorNome);
                    if (duplicata) {
                        jaAvaliou = true;
                        break;
                    }
                }
            }
            
            const label = jaAvaliou ? `${p.pregador_nome} ✅ (Já avaliado)` : p.pregador_nome;
            const option = new Option(label, p.id);
            if (jaAvaliou) {
                option.style.color = '#27ae60';
                option.style.fontWeight = 'bold';
                option.style.opacity = '0.6';
                option.disabled = true;
            }
            select.add(option);
        }

        document.getElementById('criteriosSection').style.display = 'block';
    } catch (error) {
        mostrarMensagem('Erro ao carregar pregadores. Verifique sua conexão.', 'error');
    }
}

function renderizarCriterios() {
    const container = document.getElementById('criteriosList');
    container.innerHTML = '';

    criterios.forEach(c => {
        const div = document.createElement('div');
        div.className = 'criterio-item';
        div.innerHTML = `
            <label>${c.nome} <span class="obrigatorio">*</span></label>
            <input type="number" 
                   id="criterio_${c.id}" 
                   class="nota-input"
                   min="0" 
                   max="10" 
                   step="0.5" 
                   placeholder="0-10"
                   required>
            <span class="erro-msg" id="erro_${c.id}"></span>
        `;
        container.appendChild(div);
        
        const input = div.querySelector('input');
        input.addEventListener('input', () => validarCampo(c.id));
        input.addEventListener('blur', () => validarCampo(c.id));
    });
}

async function enviarAvaliacao() {
    const avaliadorNome = document.getElementById('avaliadorNome').value.trim();
    const participacaoId = parseInt(document.getElementById('pregadorSelect').value);

    if (!avaliadorNome) {
        mostrarMensagem('O campo "Seu Nome (Avaliador)" é obrigatório', 'error');
        document.getElementById('avaliadorNome').focus();
        return;
    }

    if (!participacaoId) {
        mostrarMensagem('Selecione um pregador para avaliar', 'error');
        return;
    }

    const avaliacoes = [];
    let valido = true;
    let camposVazios = [];

    for (const c of criterios) {
        const input = document.getElementById(`criterio_${c.id}`);
        const valor = input.value.trim();
        
        if (valor === '') {
            camposVazios.push(c.nome);
            marcarErro(c.id, 'Campo obrigatório');
            valido = false;
            continue;
        }
        
        const nota = parseFloat(valor);
        
        if (isNaN(nota) || nota < 0 || nota > 10) {
            marcarErro(c.id, 'Nota deve estar entre 0 e 10');
            valido = false;
            continue;
        }

        if (nota % 0.5 !== 0) {
            marcarErro(c.id, 'Use incrementos de 0.5');
            valido = false;
            continue;
        }

        const duplicata = await offlineManager.verificarDuplicata(participacaoId, c.id, avaliadorNome);
        if (duplicata) {
            mostrarMensagem('Você já avaliou este pregador', 'error');
            valido = false;
            break;
        }

        limparErro(c.id);
        avaliacoes.push({
            participacao_id: participacaoId,
            criterio_id: c.id,
            nota: nota,
            avaliador_nome: avaliadorNome
        });
    }

    if (camposVazios.length > 0) {
        mostrarMensagem(`Preencha todos os campos obrigatórios: ${camposVazios.join(', ')}`, 'error');
        return;
    }

    if (!valido) return;

    // Confirmação antes de enviar
    if (!confirm('⚠️ Atenção!\n\nApós enviar a avaliação, ela NÃO poderá ser editada.\n\nDeseja realmente enviar?')) {
        return;
    }

    try {
        for (const avaliacao of avaliacoes) {
            console.log('Salvando avaliação:', avaliacao);
            await offlineManager.salvarAvaliacao(avaliacao);
        }

        mostrarMensagem('Avaliação enviada com sucesso!', 'success');
        
        if (navigator.onLine) {
            console.log('Online - iniciando sincronização imediata...');
            const resultado = await sincronizar();
            console.log('Sincronização concluída:', resultado);
            
            if (resultado && resultado.sucessos > 0) {
                console.log(`${resultado.sucessos} avaliações enviadas ao servidor`);
            }
        } else {
            console.log('Offline - avaliação salva localmente');
        }
        
        // Limpa apenas os campos de critérios e recarrega pregadores
        criterios.forEach(c => {
            const input = document.getElementById(`criterio_${c.id}`);
            input.value = '';
            limparErro(c.id);
        });
        
        // Recarrega a lista de pregadores para mostrar o avaliado como ofuscado
        await carregarPregadores();
    } catch (error) {
        mostrarMensagem('Erro ao salvar avaliação', 'error');
    }
}

function limparFormulario() {
    document.getElementById('avaliadorNome').value = '';
    document.getElementById('pregadorSelect').value = '';
    criterios.forEach(c => {
        const input = document.getElementById(`criterio_${c.id}`);
        input.value = '';
        limparErro(c.id);
    });
    document.getElementById('criteriosSection').style.display = 'none';
}

function mostrarMensagem(texto, tipo) {
    const div = document.getElementById('mensagem');
    div.textContent = texto;
    div.className = `mensagem ${tipo}`;
    setTimeout(() => div.className = 'mensagem', 3000);
}

function validarCampo(criterioId) {
    const input = document.getElementById(`criterio_${criterioId}`);
    const valor = input.value.trim();
    
    if (valor === '') {
        input.classList.add('invalido');
        return false;
    }
    
    const nota = parseFloat(valor);
    
    if (isNaN(nota) || nota < 0 || nota > 10) {
        marcarErro(criterioId, 'Entre 0 e 10');
        return false;
    }
    
    if (nota % 0.5 !== 0) {
        marcarErro(criterioId, 'Use 0.5');
        return false;
    }
    
    limparErro(criterioId);
    return true;
}

function marcarErro(criterioId, mensagem) {
    const input = document.getElementById(`criterio_${criterioId}`);
    const erroMsg = document.getElementById(`erro_${criterioId}`);
    
    input.classList.add('invalido');
    if (erroMsg) {
        erroMsg.textContent = mensagem;
        erroMsg.style.display = 'block';
    }
}

function limparErro(criterioId) {
    const input = document.getElementById(`criterio_${criterioId}`);
    const erroMsg = document.getElementById(`erro_${criterioId}`);
    
    input.classList.remove('invalido');
    if (erroMsg) {
        erroMsg.textContent = '';
        erroMsg.style.display = 'none';
    }
}

init();
