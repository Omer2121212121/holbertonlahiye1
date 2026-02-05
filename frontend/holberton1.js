// Təhlükəsizlik Guard-ı
try {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
} catch (e) {
    console.warn('LocalStorage access invalid:', e);
    // If we can't check login, safe default is redirect to login
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage-dan tapşırıqları yüklə (OLD LOCAL STORAGE METHOD REMOVED)
    // Now we will load in updateUI asynchronously


    function updatePLD() {
        // Anchor date: Feb 4, 2026 10:30
        const now = new Date();
        const anchorStart = new Date('2026-02-04T10:30:00');
        const anchorEnd = new Date('2026-02-05T15:30:00'); // Assuming PLD ends next day? User said "4-5"

        // Calculate weeks passed since anchor
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        let diff = now - anchorStart;

        // If now is before anchor, show anchor
        let weeksToAdd = 0;
        if (diff > 0) {
            // If we are PAST the end of the current cycle, show next week
            // Current cycle end relative to start is (anchorEnd - anchorStart)
            // But simplified: Find start of "current" week cycle
            weeksToAdd = Math.floor(diff / oneWeekMs);

            // Check if we are past the END of this week's PLD
            // Current recurrence start
            let currentStart = new Date(anchorStart.getTime() + (weeksToAdd * oneWeekMs));
            let currentEnd = new Date(anchorEnd.getTime() + (weeksToAdd * oneWeekMs));

            if (now > currentEnd) {
                weeksToAdd++;
            }
        }

        let nextStart = new Date(anchorStart.getTime() + (weeksToAdd * oneWeekMs));
        let nextEnd = new Date(anchorEnd.getTime() + (weeksToAdd * oneWeekMs));

        const options = { month: 'short', day: 'numeric' };
        let displayStr = nextStart.toLocaleDateString('en-US', options) + " - " + nextEnd.toLocaleDateString('en-US', options);

        const displayElement = document.getElementById('pld-range-display');
        if (displayElement) displayElement.innerText = displayStr;
    }

    function updatePLDTopic() {
        const topics = [
            "Mastering C Programming: Pointers and Memory Management",
            "Data Structures: Linked Lists, Stacks, and Queues",
            "Algorithm Design: Sorting and Searching Techniques",
            "System Programming: Processes and Threads",
            "Web Development: Building Dynamic Applications",
            "Database Design: SQL and Relational Databases",
            "Version Control: Advanced Git Workflows",
            "Problem Solving: Algorithmic Thinking Strategies"
        ];

        // Rotate topics weekly based on current week of year
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
        const topicIndex = weekNumber % topics.length;

        const topicElement = document.getElementById('pld-topic');
        if (topicElement) {
            topicElement.textContent = topics[topicIndex];
        }
    }

    async function updateUI() {
        // Reload tasks from API
        let tasks = [];
        try {
            tasks = await api.getTasks();
        } catch (e) {
            console.warn('Could not load tasks from API:', e);
            tasks = [];
        }

        const activeTasks = tasks.filter(t => !t.completed);
        const activeCount = activeTasks.length;
        const badge = document.getElementById('task-count');
        const statVal = document.getElementById('active-task-val');
        const taskList = document.getElementById('dashboard-task-list');

        // Update User Name from Session
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.name) {
                const nameElements = document.querySelectorAll('.user-name');
                nameElements.forEach(el => el.innerText = currentUser.name);

                // Update Avatar if using UI Avatars
                const avatar = document.querySelector('.avatar');
                if (avatar) {
                    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=d12027&color=fff`;
                }
            }
        } catch (e) {
            console.warn('Could not load user profile:', e);
        }

        if (badge) badge.innerText = activeCount;
        if (statVal) statVal.innerText = activeCount;

        if (taskList) {
            taskList.innerHTML = "";
            if (activeTasks.length === 0) {
                taskList.innerHTML = '<li style="color: #7f8c8d; font-style: italic;">No active tasks</li>';
            } else {
                activeTasks.slice(0, 5).forEach(task => { // Show max 5 tasks
                    const li = document.createElement('li');
                    li.style.padding = "10px 0";
                    li.style.borderBottom = "1px solid #334155";
                    li.style.color = "var(--text-white)"; // Dark theme text color
                    li.style.display = "flex";
                    li.style.alignItems = "center";
                    li.innerHTML = `<i class="fas fa-circle" style="font-size: 8px; color: #f1c40f; margin-right: 10px;"></i> ${task.text}`;
                    taskList.appendChild(li);
                });
            }
        }
    }

    // Timer
    let timeLeft = 30 * 60;
    let countdown = null;
    const startBtn = document.getElementById('start-pld-btn');
    const stopBtn = document.getElementById('stop-pld-btn');

    function updateTimerDisplay() {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }

    function startPLD() {
        if (!startBtn) return;
        startBtn.innerText = "PLD DAVAM EDİR...";
        startBtn.style.background = "#10b981";
        startBtn.disabled = true;

        if (stopBtn) stopBtn.style.display = 'inline-flex';

        countdown = setInterval(() => {
            if (timeLeft <= 0) {
                stopPLD();
                alert("PLD vaxtı bitdi!");
                return;
            }
            timeLeft--;
            updateTimerDisplay();
        }, 1000);
    }

    function stopPLD() {
        clearInterval(countdown);
        countdown = null;
        timeLeft = 30 * 60; // Reset to 30 mins
        updateTimerDisplay();

        if (startBtn) {
            startBtn.innerText = "PLD-YƏ BAŞLA";
            startBtn.style.background = ""; // Reset to default CSS color
            startBtn.disabled = false;
        }

        if (stopBtn) stopBtn.style.display = 'none';
    }

    if (startBtn) {
        startBtn.addEventListener('click', startPLD);
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', stopPLD);
    }

    // Initial calls
    updatePLD();
    updatePLDTopic();
    updateUI();
});

// Çıxış funksiyası (Sidebar-a əlavə etmək üçün global olaraq qalmalıdır)
function logout() {
    try {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
    } catch (e) {
        console.warn('Logout failed:', e);
    }
    window.location.href = 'login.html';
}