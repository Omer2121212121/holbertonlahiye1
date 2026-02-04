const themeToggle = document.getElementById('theme-toggle');

// Get current user
let currentUser = null;
try {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
} catch (e) {
    console.warn('Could not load user');
}

// Load user's theme preference
function loadTheme() {
    if (!currentUser) return;

    const userTheme = localStorage.getItem(`theme_${currentUser.username}`) || 'dark';

    if (userTheme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.checked = false;
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        if (themeToggle) themeToggle.checked = true;
    }
}

// Theme toggle handler
if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        const theme = themeToggle.checked ? 'dark' : 'light';

        // Update current page
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }

        // Save site-wide
        localStorage.setItem('site_theme', theme);

        // Save per user if logged in
        if (currentUser) {
            localStorage.setItem(`theme_${currentUser.username}`, theme);
        }
    });
}

// Clear all data
// Delete current user account
function deleteAccount() {
    if (!currentUser) return;

    if (confirm("Hesabınız həmişəlik silinəcək. Əminsiniz?")) {
        // Get all users
        let users = JSON.parse(localStorage.getItem('holberton_users')) || [];

        // Filter out current user
        users = users.filter(u => u.username !== currentUser.username);

        // Save back to localStorage
        localStorage.setItem('holberton_users', JSON.stringify(users));

        // Remove current user session and settings
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem(`theme_${currentUser.username}`);

        alert("Hesabınız silindi.");
        window.location.href = "login.html";
    }
}

// Apply theme on load
loadTheme();