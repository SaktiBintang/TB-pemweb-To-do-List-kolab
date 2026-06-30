async function login() {
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');

    if (!usernameInput || !passwordInput) {
        return alert('Nama pengguna dan kata sandi harus diisi!');
    }

    loginBtn.disabled = true;
    loginBtn.innerText = "Memproses...";

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', usernameInput);

            alert(data.message || 'Login Berhasil!');
            window.location.href = 'index.html';
        } else {
            const errMsg = await response.text();
            alert(errMsg || 'Login gagal, periksa kembali username dan password Anda');
        }
    } catch (error) {
        console.error('Error login:', error);
        alert('Gagal terhubung ke server. Pastikan server backend Anda menyala.');
    } finally {
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerText = "Masuk";
        }
    }
}

async function register() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username || !password) return alert("Username dan Password wajib diisi!");

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const text = await response.text();
        let payload = {};
        try {
            payload = text ? JSON.parse(text) : {};
        } catch {
            payload = { message: text };
        }

        if (response.ok) {
            alert(payload.message || 'Berhasil daftar! Silakan login.');
            window.location.href = 'login.html';
        } else {
            alert(payload.message || 'Gagal daftar');
        }
    } catch (error) {
        console.error('Error register:', error);
        alert('Gagal terhubung ke server.');
    }
}
