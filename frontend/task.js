// Get current user role
let currentUser = null;
try {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
} catch (e) {
    console.warn('Could not load user:', e);
}

const isAdmin = currentUser && currentUser.role === 'admin';
const isStudent = currentUser && currentUser.role === 'student';

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

const input = document.getElementById('new-task-input');
const addBtn = document.getElementById('add-task-btn');
const container = document.getElementById('tasks-container');

// Hide input for students
if (isStudent) {
    const inputGroup = document.querySelector('.input-group');
    if (inputGroup) inputGroup.style.display = 'none';
}

function saveTasks() {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    renderTasks();
}

function addTask() {
    // Only admins can add tasks
    if (!isAdmin) {
        alert('Yalnız adminlər tapşırıq əlavə edə bilər!');
        return;
    }

    if (input.value.trim() === "") return;

    const task = {
        id: Date.now(),
        text: input.value,
        completed: false
    };

    tasks.push(task);
    input.value = "";
    saveTasks();
}

function toggleTask(id) {
    // Only admins can toggle
    if (!isAdmin) return;
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
}

function deleteTask(id) {
    // Only admins can delete
    if (!isAdmin) {
        alert('Yalnız adminlər tapşırığı silə bilər!');
        return;
    }
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
}

let currentFilter = 'all';

function filterTasks(filter) {
    currentFilter = filter;
    renderTasks(filter);

    // Update active class on tabs
    document.querySelectorAll('.filter').forEach(tab => {
        tab.classList.remove('active');
        if (tab.innerText === 'Hamısı' && filter === 'all') tab.classList.add('active');
        if (tab.innerText === 'Davam edənlər' && filter === 'active') tab.classList.add('active');
        if (tab.innerText === 'Bitənlər' && filter === 'completed') tab.classList.add('active');
    });
}

function renderTasks(filter = currentFilter) {
    container.innerHTML = "";

    let filteredTasks = tasks;
    if (filter === 'active') filteredTasks = tasks.filter(t => !t.completed);
    if (filter === 'completed') filteredTasks = tasks.filter(t => t.completed);

    // Sort by date (newest first)
    filteredTasks.sort((a, b) => b.id - a.id);

    filteredTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-card ${task.completed ? 'completed' : ''}`;

        // Format date
        const date = new Date(task.id);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Students see read-only view
        if (isStudent) {
            div.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} disabled>
                    <div>
                        <span id="text-${task.id}">${task.text}</span>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                            <i class="far fa-clock"></i> ${formattedDate}
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Admins see full controls
            div.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id}); event.stopPropagation();">
                    <div style="flex: 1; cursor: pointer;" onclick="openFocusMode(${task.id})">
                        <span id="text-${task.id}">${task.text}</span>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                            <i class="far fa-clock"></i> ${formattedDate}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <i class="fas fa-edit edit-icon" onclick="editTask(${task.id}); event.stopPropagation();" style="color: #3498db; margin-right: 10px; cursor: pointer;"></i>
                    <i class="fas fa-trash delete-icon" onclick="deleteTask(${task.id}); event.stopPropagation();"></i>
                </div>
            `;
        }
        container.appendChild(div);
    });
}

function editTask(id) {
    // Only admins can edit
    if (!isAdmin) {
        alert('Yalnız adminlər tapşırığı redaktə edə bilər!');
        return;
    }

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt("Tapşırığı redaktə et:", task.text);
    if (newText !== null && newText.trim() !== "") {
        tasks = tasks.map(t => t.id === id ? { ...t, text: newText.trim() } : t);
        saveTasks();
    }
}

if (addBtn) addBtn.addEventListener('click', addTask);
if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

// İlkin yükləmə
renderTasks();

// --- FOCUS MODE LOGIC ---
const focusOverlay = document.getElementById('focus-overlay');
const focusTitle = document.getElementById('focus-task-title');
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer-btn');
const finishBtn = document.getElementById('finish-task-btn');

let timerInterval = null;
let timeLeft = 3600; // 1 hour in seconds
let isTimerRunning = false;

function openFocusMode(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    focusTitle.innerText = task.text;

    // Reset Timer
    timeLeft = 3600;
    isTimerRunning = false;
    updateTimerDisplay();
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';

    // Show Overlay
    focusOverlay.style.display = 'flex';

    // Request Fullscreen
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

startBtn.addEventListener('click', () => {
    if (isTimerRunning) {
        // Pause
        clearInterval(timerInterval);
        isTimerRunning = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    } else {
        // Start
        isTimerRunning = true;
        startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                alert("Time is up!");
            }
        }, 1000);
    }
});

finishBtn.addEventListener('click', () => {
    // Stop timer
    clearInterval(timerInterval);
    isTimerRunning = false;

    // Hide Overlay
    focusOverlay.style.display = 'none';

    // Exit Fullscreen
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(e => console.log(e));
    }
});
