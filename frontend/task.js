// Get current user role
let currentUser = null;
try {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
} catch (e) {
    console.warn('Could not load user:', e);
}

const isAdmin = currentUser && currentUser.role === 'admin';
const isStudent = currentUser && currentUser.role === 'student';

// Global state for tasks
let tasks = [];

const input = document.getElementById('new-task-input');
const addBtn = document.getElementById('add-task-btn');
const container = document.getElementById('tasks-container');

// Hide input for students
if (isStudent && input) {
    const inputGroup = document.querySelector('.input-group');
    if (inputGroup) inputGroup.style.display = 'none';
}

// Fetch Tasks from API
async function loadTasks() {
    try {
        tasks = await api.getTasks();
        renderTasks();
    } catch (e) {
        console.error("Failed to load tasks:", e);
    }
}

async function addTask() {
    // Only admins can add tasks
    if (!isAdmin) {
        alert('Yalnız adminlər tapşırıq əlavə edə bilər!');
        return;
    }

    if (input.value.trim() === "") return;

    const taskData = {
        text: input.value,
        completed: false,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username
    };

    try {
        await api.createTask(taskData);
        input.value = "";
        loadTasks(); // Reload to get new list
    } catch (e) {
        alert("Failed to add task");
    }
}

async function toggleTask(id) {
    // Only admins can toggle status (based on original logic, though usually users mark done)
    // Assuming original logic: Admin toggles status
    if (!isAdmin) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
        await api.updateTask(id, { completed: !task.completed });
        loadTasks();
    } catch (e) {
        console.error(e);
    }
}

async function deleteTask(id) {
    // Only admins can delete
    if (!isAdmin) {
        alert('Yalnız adminlər tapşırığı silə bilər!');
        return;
    }

    if (confirm("Are you sure?")) {
        try {
            await api.deleteTask(id);
            loadTasks();
        } catch (e) {
            console.error(e);
        }
    }
}

async function editTask(id) {
    // Only admins can edit
    if (!isAdmin) {
        alert('Yalnız adminlər tapşırığı redaktə edə bilər!');
        return;
    }

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt("Tapşırığı redaktə et:", task.text);
    if (newText !== null && newText.trim() !== "") {
        try {
            await api.updateTask(id, { text: newText.trim() });
            loadTasks();
        } catch (e) {
            console.error(e);
            alert("Update failed");
        }
    }
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

    let filteredTasks = [...tasks];
    if (filter === 'active') filteredTasks = tasks.filter(t => !t.completed);
    if (filter === 'completed') filteredTasks = tasks.filter(t => t.completed);

    // Sort by date (newest first) - assuming IDs are growing or createdAt exists
    filteredTasks.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });

    if (filteredTasks.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 20px; color: #64748b;">No tasks found</div>';
        return;
    }

    filteredTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-card ${task.completed ? 'completed' : ''}`;

        // Format date
        let formattedDate = "";
        if (task.createdAt) {
            const date = new Date(task.createdAt);
            formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }

        // Students see read-only view
        if (isStudent) {
            div.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} disabled>
                    <div>
                        <span id="text-${task.id}">${task.text}</span>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                            ${formattedDate ? `<i class="far fa-clock"></i> ${formattedDate}` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Admins see full controls
            div.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
                    <div style="flex: 1; cursor: pointer;" onclick="openFocusMode('${task.id}')">
                        <span id="text-${task.id}">${task.text}</span>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                            ${formattedDate ? `<i class="far fa-clock"></i> ${formattedDate}` : ''}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <i class="fas fa-edit edit-icon" onclick="editTask('${task.id}')" style="color: #3498db; margin-right: 10px; cursor: pointer;"></i>
                    <i class="fas fa-trash delete-icon" onclick="deleteTask('${task.id}')"></i>
                </div>
            `;
        }
        container.appendChild(div);
    });
}


if (addBtn) addBtn.addEventListener('click', addTask);
if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

// Initial load
loadTasks();

// --- FOCUS MODE LOGIC (Unchanged mostly, just string ID update) ---
const focusOverlay = document.getElementById('focus-overlay');
const focusTitle = document.getElementById('focus-task-title');
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer-btn');
const finishBtn = document.getElementById('finish-task-btn');

let timerInterval = null;
let timeLeft = 3600;
let isTimerRunning = false;

window.openFocusMode = function (taskId) {
    // Ensure taskId is compared correctly (API returns string IDs usually)
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;

    focusTitle.innerText = task.text;

    // Reset Timer
    timeLeft = 3600;
    isTimerRunning = false;
    updateTimerDisplay();
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';

    // Show Overlay
    focusOverlay.style.display = 'flex';

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        } else {
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
}

if (finishBtn) {
    finishBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        focusOverlay.style.display = 'none';
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(e => console.log(e));
        }
    });
}
