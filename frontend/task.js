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

// Show admin input area if user is admin
const adminInputArea = document.getElementById('admin-input-area');
if (isAdmin && adminInputArea) {
    adminInputArea.style.display = 'block';
}

function loadTasks() {
    try {
        tasks = JSON.parse(localStorage.getItem('myTasks') || '[]');
        renderTasks();
    } catch (e) {
        console.error("Failed to load tasks:", e);
        tasks = [];
        renderTasks();
    }
}

function addTask() {
    if (!isAdmin) return;

    const titleInput = document.getElementById('new-task-input');
    const questionsInput = document.getElementById('new-questions-input');

    if (!titleInput || !questionsInput) return;

    const text = titleInput.value.trim();
    const questions = questionsInput.value.trim();

    if (text === "") {
        alert("Lütfən bir başlıq daxil edin!");
        return;
    }

    const taskData = {
        id: Date.now().toString(),
        text: text,
        questions: questions || "Bu tapşırıq üçün sual əlavə edilməyib.",
        completed: false,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username
    };

    tasks.push(taskData);
    localStorage.setItem('myTasks', JSON.stringify(tasks));

    titleInput.value = "";
    questionsInput.value = "";
    renderTasks();
}

function toggleTask(id) {
    if (!isAdmin) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    renderTasks();
}

function deleteTask(id) {
    if (!isAdmin) return;

    if (confirm("Bu tapşırığı silməyə əminsiniz?")) {
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('myTasks', JSON.stringify(tasks));
        renderTasks();
    }
}

function editTask(id) {
    if (!isAdmin) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt("Yeni Başlıq:", task.text);
    if (newText === null) return;

    const newQuestions = prompt("Sualları redaktə edin (və ya boş qoyun):", task.questions);

    if (newText.trim() !== "") {
        task.text = newText.trim();
        if (newQuestions !== null) task.questions = newQuestions.trim() || "Bu tapşırıq üçün sual əlavə edilməyib.";
        localStorage.setItem('myTasks', JSON.stringify(tasks));
        renderTasks();
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

    // Sort by date (newest first)
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

        const handleTaskClick = task.completed ?
            `alert('Bu imtahan artıq bitib!')` :
            `openFocusMode('${task.id}')`;

        const completionBadge = task.completed ?
            `<div class="completion-badge"><i class="fas fa-check-circle"></i></div>` : '';

        // Students see read-only view
        if (isStudent) {
            div.innerHTML = `
                ${completionBadge}
                <div class="task-info">
                    <div class="status-indicator ${task.completed ? 'status-completed' : 'status-ongoing'}"></div>
                    <input type="checkbox" ${task.completed ? 'checked' : ''} disabled>
                    <div style="flex: 1; cursor: pointer;" onclick="${handleTaskClick}">
                        <span id="text-${task.id}">${task.text}</span>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px; display: flex; align-items: center; gap: 8px;">
                            ${formattedDate ? `<span><i class="far fa-clock"></i> ${formattedDate}</span>` : ''}
                            ${!task.completed ? `<span style="color: #fcc419; font-weight: 600;"><i class="fas fa-edit"></i> İmtahana gir</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Admins see full controls
            div.innerHTML = `
                ${completionBadge}
                <div class="task-info">
                    <div class="status-indicator ${task.completed ? 'status-completed' : 'status-ongoing'}"></div>
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
                    <div style="flex: 1; cursor: pointer;" onclick="${handleTaskClick}">
                        <span id="text-${task.id}">${task.text}</span>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px; display: flex; align-items: center; gap: 8px;">
                            ${formattedDate ? `<span><i class="far fa-clock"></i> ${formattedDate}</span>` : ''}
                            ${!task.completed ? `<span style="color: #fcc419; font-weight: 600;"><i class="fas fa-edit"></i> İmtahana gir</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <i class="fas fa-edit edit-icon" onclick="event.stopPropagation(); editTask('${task.id}')" style="color: #3498db; margin-right: 10px; cursor: pointer;" title="Mətni redaktə et"></i>
                    <i class="fas fa-trash delete-icon" onclick="event.stopPropagation(); deleteTask('${task.id}')" title="Sil"></i>
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

// --- FOCUS MODE LOGIC ---
const focusOverlay = document.getElementById('focus-overlay');
const focusContent = document.getElementById('focus-content');
const violationMsg = document.getElementById('violation-msg');
const focusTitle = document.getElementById('focus-task-title');
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer-btn');
const finishBtn = document.getElementById('finish-task-btn');
const sidebarBody = document.getElementById('questions-content');

let timerInterval = null;
let timeLeft = 3600;
let isTimerRunning = false;
let isExamActive = false;
let activeTaskId = null;

window.openFocusMode = function (taskId) {
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;

    if (task.completed) {
        alert("Bu imtahan artıq bitib!");
        return;
    }

    activeTaskId = taskId;
    focusTitle.innerText = task.text;
    if (sidebarBody) {
        sidebarBody.innerText = task.questions || "Bu tapşırıq üçün sual əlavə edilməyib.";
    }

    timeLeft = 3600;
    isExamActive = true;
    updateTimerDisplay();

    focusOverlay.style.display = 'block';
    if (violationMsg) violationMsg.style.display = 'none';

    // Clear answer area for new exam
    const answerInput = document.getElementById('exam-answer-input');
    if (answerInput) answerInput.value = "";

    startTimer();

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => {
            console.warn("Fullscreen request failed:", e);
            alert("İmtahan üçün tam ekran rejimi tələb olunur!");
        });
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (timerDisplay) timerDisplay.innerText = timeStr;
}

function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            alert("Vaxt bitdi!");
            finishExam();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

// Finish button click logic
if (finishBtn) {
    finishBtn.addEventListener('click', () => {
        if (confirm("İmtahanı bitirmək istədiyinizdən əminsiniz? Bu tapşırıq həmişəlik bağlanacaq.")) {
            finishExam();
        }
    });
}

function finishExam() {
    if (activeTaskId) {
        const task = tasks.find(t => t.id == activeTaskId);
        if (task) {
            task.completed = true;
            localStorage.setItem('myTasks', JSON.stringify(tasks));

            // Save Submissions for Admin to view
            try {
                const answerText = document.getElementById('exam-answer-input')?.value || "";
                const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const submissions = JSON.parse(localStorage.getItem('exam_submissions') || '[]');

                // Add or update submission
                const newSubmission = {
                    id: Date.now(),
                    studentName: user.name || 'Naməlum Tələbə',
                    username: user.username || 'unknown',
                    taskId: task.id,
                    taskTitle: task.text || 'Başlıqsız Tapşırıq',
                    answer: answerText || "(Cavab yazılmayıb)",
                    timestamp: new Date().toLocaleString('az-AZ'),
                    status: 'Submitted'
                };

                submissions.push(newSubmission);
                localStorage.setItem('exam_submissions', JSON.stringify(submissions));
            } catch (err) {
                console.error("Submission failed:", err);
            }
        }
    }
    closeFocusMode();
    renderTasks();
}

function closeFocusMode() {
    pauseTimer();
    isExamActive = false;
    activeTaskId = null;
    focusOverlay.style.display = 'none';
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(e => console.log(e));
    }
}

// --- LOCKED MODE PROTECTION ---
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && isExamActive) {
        handleViolation("Tab dəyişdirildiyi üçün imtahan dayandırıldı!");
    }
});

window.addEventListener('blur', () => {
    if (isExamActive) {
        handleViolation("Pəncərədən kənara çıxdığınız üçün imtahan dayandırıldı!");
    }
});

// Fullscreen Exit Detection
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isExamActive) {
        handleViolation("Tam ekran rejimi tərk edildiyi üçün imtahan dayandırıldı!");
    }
});

function handleViolation(reason) {
    if (!isExamActive) return;

    alert(reason);
    console.log(`Exam violation: ${reason}`);

    // Log violation to localStorage
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const violations = JSON.parse(localStorage.getItem('exam_violations') || '[]');
    violations.push({
        user: user.username,
        time: new Date().toISOString(),
        task: focusTitle.innerText,
        reason: reason
    });
    localStorage.setItem('exam_violations', JSON.stringify(violations));

    finishExam();
}

window.onbeforeunload = function () {
    if (isExamActive) {
        return "İmtahan davam edir!";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const focusId = urlParams.get('focus');
    if (focusId) {
        setTimeout(() => {
            if (typeof window.openFocusMode === 'function') {
                window.openFocusMode(focusId);
            }
        }, 500);
    }
});
