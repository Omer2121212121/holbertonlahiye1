document.addEventListener('DOMContentLoaded', () => {
    // --- REGISTER PAGE LOGIC ---
    const regBtn = document.getElementById('register-btn');
    if (regBtn) {
        regBtn.addEventListener('click', handleRegister);
    }

    // --- LOGIN PAGE LOGIC ---
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    function handleRegister() {
        const name = document.getElementById('full-name').value.trim();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const discord = document.getElementById('reg-discord').value.trim();
        const errorBox = document.getElementById('error-message');

        if (!name || !username || !password) {
            showError(errorBox, "Zəhmət olmasa bütün xanaları doldurun!");
            return;
        }

        // Get existing users
        const users = JSON.parse(localStorage.getItem('holberton_users')) || [];

        // Check if username exists
        if (users.find(u => u.username === username)) {
            showError(errorBox, "Bu istifadəçi adı artıq mövcuddur!");
            return;
        }

        // Create new user
        const newUser = {
            name: name,
            username: username,
            password: password
        };

        // Add Discord if provided
        if (discord) {
            newUser.discord = discord;
        }

        // Save
        users.push(newUser);
        localStorage.setItem('holberton_users', JSON.stringify(users));

        alert("Uğurla qeydiyyatdan keçdiniz! İndi daxil olun.");
        window.location.href = 'login.html';
    }

    function handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorBox = document.getElementById('error-message');
        const btn = document.getElementById('login-btn');

        if (!username || !password) {
            showError(errorBox, "İstifadəçi adı və şifrə daxil edin!");
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerText = "Yoxlanılır...";
        }

        // Simulate network delay
        setTimeout(() => {
            let currentUser = null;

            // Check for admin login
            if (username === "admin" && password === "admin") {
                currentUser = {
                    name: "Admin",
                    username: "admin",
                    role: "admin"
                };
            } else {
                // Get registered users
                const users = JSON.parse(localStorage.getItem('holberton_users')) || [];
                const user = users.find(u => u.username === username && u.password === password);

                if (user) {
                    currentUser = {
                        name: user.name,
                        username: user.username,
                        role: "student"
                    };
                }
            }

            if (currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'holberton1.html';
            } else {
                showError(errorBox, "İstifadəçi adı və ya şifrə yanlışdır!");
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = "Daxil ol";
                }
            }
        }, 800);
    }

    function showError(element, message) {
        if (element) {
            element.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            element.style.display = 'block';
        } else {
            alert(message);
        }
    }
});
