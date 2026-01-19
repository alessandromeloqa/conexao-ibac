const API_URL = 'http://localhost:3001/api';

document.getElementById('btnLogin').addEventListener('click', login);
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
});

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        mostrarMensagem('Preencha usuário e senha', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Credenciais inválidas');
        }

        const data = await response.json();
        
        // Limpar qualquer sessão anterior
        localStorage.clear();
        sessionStorage.clear();
        
        // Salvar nova sessão
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.setItem('loginTime', Date.now());
        
        window.location.replace('dashboard.html');
    } catch (error) {
        mostrarMensagem('Usuário ou senha incorretos', 'error');
    }
}

function mostrarMensagem(texto, tipo) {
    const div = document.getElementById('mensagem');
    div.textContent = texto;
    div.className = `mensagem ${tipo}`;
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 3000);
}
