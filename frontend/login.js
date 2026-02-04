document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorBox = document.getElementById('error-message');

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Check login status on page load
    // Check login status on page load - REMOVED to force login every time
    // try {
    //     if (localStorage.getItem('isLoggedIn') === 'true' && window.location.pathname.includes('login.html')) {
    //         window.location.href = 'holberton1.html';
    //     }
    // } catch (e) {
    //     console.warn('LocalStorage access denied or error:', e);
    // }

    function handleLogin() {
        const user = usernameInput.value;
        const pass = passwordInput.value;

        // Reset error
        if (errorBox) errorBox.style.display = 'none';

        // Disable button
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerText = 'Giriş edilir...';
        }

        // Simulate backend request
        setTimeout(() => {
            if (user === "Omer" && pass === "12345") {
                try {
                    localStorage.setItem('isLoggedIn', 'true');
                } catch (e) {
                    console.warn('Could not save login state:', e);
                }
                // Redirect
                window.location.href = 'holberton1.html';
            } else {
                if (errorBox) errorBox.style.display = 'block';
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.innerText = 'DAXİL OL';
                }
            }
        }, 1000);
    }
});
