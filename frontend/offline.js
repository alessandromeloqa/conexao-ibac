class OfflineManager {
  constructor() {
    this.dbName = 'ConexaoIBAC';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        if (!db.objectStoreNames.contains('avaliacoes')) {
          const store = db.createObjectStore('avaliacoes', { keyPath: 'id', autoIncrement: true });
          store.createIndex('sync', 'synced', { unique: false });
          store.createIndex('participacao', 'participacao_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('eventos')) {
          db.createObjectStore('eventos', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('criterios')) {
          db.createObjectStore('criterios', { keyPath: 'id' });
        }
      };
    });
  }

  async salvarAvaliacao(avaliacao) {
    const tx = this.db.transaction(['avaliacoes'], 'readwrite');
    const store = tx.objectStore('avaliacoes');
    
    const data = {
      ...avaliacao,
      synced: false,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAvaliacoesNaoSincronizadas() {
    if (!this.db) return [];
    
    const tx = this.db.transaction(['avaliacoes'], 'readonly');
    const store = tx.objectStore('avaliacoes');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const todas = request.result || [];
        const naoSincronizadas = todas.filter(a => !a.synced);
        resolve(naoSincronizadas);
      };
      request.onerror = () => resolve([]);
    });
  }

  async marcarComoSincronizado(id) {
    const tx = this.db.transaction(['avaliacoes'], 'readwrite');
    const store = tx.objectStore('avaliacoes');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        data.synced = true;
        const putRequest = store.put(data);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async verificarDuplicata(participacaoId, criterioId, avaliadorNome) {
    const tx = this.db.transaction(['avaliacoes'], 'readonly');
    const store = tx.objectStore('avaliacoes');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const duplicata = request.result.find(a => 
          a.participacao_id === participacaoId &&
          a.criterio_id === criterioId &&
          a.avaliador_nome === avaliadorNome
        );
        resolve(!!duplicata);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async cacheEvento(evento) {
    const tx = this.db.transaction(['eventos'], 'readwrite');
    const store = tx.objectStore('eventos');
    return new Promise((resolve, reject) => {
      const request = store.put(evento);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cacheCriterios(criterios) {
    const tx = this.db.transaction(['criterios'], 'readwrite');
    const store = tx.objectStore('criterios');
    
    return Promise.all(criterios.map(c => 
      new Promise((resolve, reject) => {
        const request = store.put(c);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ));
  }

  async getEventoCache(id) {
    const tx = this.db.transaction(['eventos'], 'readonly');
    const store = tx.objectStore('eventos');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCriteriosCache() {
    if (!this.db) return [];
    
    const tx = this.db.transaction(['criterios'], 'readonly');
    const store = tx.objectStore('criterios');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }
}

const offlineManager = new OfflineManager();

async function sincronizar() {
  if (!navigator.onLine || !offlineManager.db) {
    console.log('Sincronização cancelada - offline ou DB não inicializado');
    return;
  }

  try {
    const pendentes = await offlineManager.getAvaliacoesNaoSincronizadas();
    console.log(`Sincronizando ${pendentes.length} avaliações pendentes...`);
    
    let sucessos = 0;
    let erros = 0;
    
    for (const avaliacao of pendentes) {
      try {
        console.log('Enviando avaliação:', avaliacao);
        const response = await fetch('http://localhost:3001/api/avaliacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participacao_id: avaliacao.participacao_id,
            criterio_id: avaliacao.criterio_id,
            nota: avaliacao.nota,
            avaliador_nome: avaliacao.avaliador_nome
          })
        });

        if (response.ok) {
          await offlineManager.marcarComoSincronizado(avaliacao.id);
          console.log(`Avaliação ${avaliacao.id} sincronizada com sucesso`);
          sucessos++;
        } else {
          const error = await response.text();
          console.error(`Erro ao sincronizar avaliação ${avaliacao.id}:`, error);
          erros++;
        }
      } catch (error) {
        console.error('Erro ao sincronizar avaliação:', error);
        erros++;
      }
    }

    console.log(`Sincronização concluída: ${sucessos} sucesso(s), ${erros} erro(s)`);
    
    // Atualizar views se houver sucessos
    if (sucessos > 0) {
      try {
        await fetch('http://localhost:3001/api/historico/refresh', { method: 'POST' });
        console.log('Views atualizadas');
      } catch (e) {
        console.log('Erro ao atualizar views:', e);
      }
    }
    
    atualizarStatusUI();
    
    return { sucessos, erros, total: pendentes.length };
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return { sucessos: 0, erros: 0, total: 0 };
  }
}

function atualizarStatusUI() {
  const statusEl = document.getElementById('syncStatus');
  if (!statusEl || !offlineManager.db) return;

  offlineManager.getAvaliacoesNaoSincronizadas()
    .then(pendentes => {
      const online = navigator.onLine;
      statusEl.innerHTML = `
        <span class="status-dot ${online ? 'online' : 'offline'}"></span>
        ${online ? 'Online' : 'Offline'} | 
        ${pendentes.length} pendente(s)
      `;
      statusEl.className = online ? 'status online' : 'status offline';
    })
    .catch(error => {
      console.error('Erro ao atualizar status:', error);
    });
}

window.addEventListener('online', () => {
  console.log('Conexão restaurada - sincronizando...');
  sincronizar();
});
window.addEventListener('offline', () => {
  console.log('Conexão perdida - modo offline');
  atualizarStatusUI();
});

// Sincronização automática a cada 10 segundos
setInterval(() => {
  if (navigator.onLine) {
    sincronizar();
  }
}, 10000);

// Sincroniza ao carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(sincronizar, 1000);
  });
} else {
  setTimeout(sincronizar, 1000);
}

export { offlineManager, sincronizar, atualizarStatusUI };
