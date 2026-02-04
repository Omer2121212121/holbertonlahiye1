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

    async function handleRegister() {
        const name = document.getElementById('full-name').value.trim();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const discord = document.getElementById('reg-discord').value.trim();
        const gender = document.getElementById('reg-gender').value;
        const errorBox = document.getElementById('error-message');

        if (!name || !username || !password || !gender) {
            showError(errorBox, "Zəhmət olmasa bütün xanaları (Cinsiyyət daxil) doldurun!");
            return;
        }

        if (regBtn) {
            regBtn.innerText = "Gözləyin...";
            regBtn.disabled = true;
        }

        try {
            // Get existing users to check username
            const users = await api.getUsers();

            // Check if username exists
            if (users.find(u => u.username === username)) {
                showError(errorBox, "Bu istifadəçi adı artıq mövcuddur!");
                resetBtn(regBtn, "QEYDİYYATDAN KEÇ");
                return;
            }

            // Create new user
            const newUser = {
                name: name,
                username: username,
                password: password,
                gender: gender,
                discord: discord || undefined
            };

            await api.createUser(newUser);

            alert("Uğurla qeydiyyatdan keçdiniz! İndi daxil olun.");
            window.location.href = 'login.html';
        } catch (e) {
            console.error(e);
        } catch (e) {
            console.error(e);
            showError(errorBox, `Error: ${e.message || "Unknown error occurred"}`);
            resetBtn(regBtn, "QEYDİYYATDAN KEÇ");
        }
    }

    async function handleLogin() {
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

        try {
            let currentUser = null;

            // Check for admin login (Hardcoded for safety/demo, could also be key from API)
            if (username === "admin" && password === "admin") {
                currentUser = {
                    name: "Admin",
                    username: "admin",
                    role: "admin",
                    // Mock ID for admin
                    id: "admin_id"
                };
            } else {
                // Get registered users from API
                const users = await api.getUsers();
                const user = users.find(u => u.username === username && u.password === password);

                if (user) {
                    currentUser = user;
                }
            }

            if (currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'holberton1.html';
            } else {
                showError(errorBox, "İstifadəçi adı və ya şifrə yanlışdır!");
                resetBtn(btn, "Daxil ol");
            }
        } catch (e) {
            console.error(e);
            showError(errorBox, "Server xətası!");
            resetBtn(btn, "Daxil ol");
        }
    }

    function showError(element, message) {
        if (element) {
            element.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            element.style.display = 'block';
        } else {
            alert(message);
        }
    }

    function resetBtn(btn, text) {
        if (btn) {
            btn.disabled = false;
            btn.innerText = text;
        }
    }
});
