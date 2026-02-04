// Theme initialization - robust and site-wide
(function () {
    function applyTheme() {
        try {
            // Priority 1: Current user's preference
            // Priority 2: Last saved site-wide preference (persists after logout)
            // Default: dark

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const userKey = currentUser ? `theme_${currentUser.username}` : null;

            const userTheme = (userKey ? localStorage.getItem(userKey) : null) ||
                localStorage.getItem('site_theme') ||
                'dark';

            if (userTheme === 'light') {
                document.documentElement.classList.add('light-theme');
                document.documentElement.classList.remove('dark-theme');
            } else {
                document.documentElement.classList.add('dark-theme');
                document.documentElement.classList.remove('light-theme');
            }
        } catch (e) {
            console.error('Theme initialization failed:', e);
        }
    }

    // Run immediately to avoid flashing
    applyTheme();

    // Also run when DOM is loaded to ensure body is available if needed
    document.addEventListener('DOMContentLoaded', applyTheme);
})();
