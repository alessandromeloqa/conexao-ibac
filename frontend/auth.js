const API_URL = 'http://localhost:3001/api';

async function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.replace('login.html');
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/auth/verificar`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        return true;
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        sessionStorage.clear();
        window.location.replace('login.html');
        return false;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.clear();
    
    // Limpar cache do service worker
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    window.location.replace('login.html');
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Verificar autenticação ao carregar páginas admin
if (window.location.pathname.includes('admin-')) {
    verificarAutenticacao();
}


// Verificar expiração de sessão (8 horas)
function verificarExpiracao() {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
        const horasPassadas = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
        if (horasPassadas > 8) {
            logout();
        }
    }
}

// Verificar a cada minuto
if (window.location.pathname.includes('admin-')) {
    setInterval(verificarExpiracao, 60000);
    verificarExpiracao();
}
