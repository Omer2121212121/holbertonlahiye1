// Get current user
let currentUser = null;
try {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
} catch (e) {
    console.warn('Could not load user:', e);
    window.location.href = 'login.html';
}

// Redirect if not logged in
if (!currentUser) {
    window.location.href = 'login.html';
}

const isAdmin = currentUser.role === 'admin';
const isStudent = currentUser.role === 'student';

// Global users list for admin
let allUsers = [];

// Show role badge
const badge = document.getElementById('role-badge');
if (badge) {
    if (isAdmin) {
        badge.textContent = 'Admin';
        badge.style.background = 'rgba(225, 29, 72, 0.2)';
        badge.style.color = '#e11d48';
        badge.style.border = '1px solid rgba(225, 29, 72, 0.3)';
    } else {
        badge.textContent = 'Student';
        badge.style.background = 'rgba(56, 189, 248, 0.2)';
        badge.style.color = '#38bdf8';
        badge.style.border = '1px solid rgba(56, 189, 248, 0.3)';
    }
}

// Display appropriate view
function initProfile() {
    if (isStudent) {
        showStudentProfile();
    } else if (isAdmin) {
        showAdminPanel();
    }
}

initProfile();


function showStudentProfile() {
    const studentView = document.getElementById('student-view');
    if (studentView) studentView.style.display = 'block';

    document.getElementById('student-name').textContent = currentUser.name;
    document.getElementById('student-username').textContent = `@${currentUser.username}`;

    // Show Discord if available
    const discordInfo = document.getElementById('student-role');
    if (currentUser.discord) {
        discordInfo.innerHTML = `<i class="fab fa-discord" style="color: #5865F2;"></i> ${currentUser.discord}`;
    } else {
        discordInfo.textContent = 'Student';
    }

    const genderInfo = document.getElementById('student-gender');
    if (genderInfo) {
        genderInfo.textContent = currentUser.gender === 'Male' ? 'Kişi' : (currentUser.gender === 'Female' ? 'Qadın' : 'Qeyd olunmayıb');
    }

    document.getElementById('student-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=38bdf8&color=fff&size=128`;
}

function showAdminPanel() {
    const adminView = document.getElementById('admin-view');
    if (adminView) adminView.style.display = 'block';
    loadAllUsers();
    loadSubmissions(); // Load submissions for admin
}

function loadSubmissions() {
    const subList = document.getElementById('submissions-list');
    if (!subList) return;

    try {
        const submissions = JSON.parse(localStorage.getItem('exam_submissions') || '[]').reverse(); // Show latest first

        if (submissions.length === 0) {
            subList.innerHTML = '<div style="color: #94a3b8; background: #1e293b; padding: 20px; border-radius: 12px; text-align: center;">Hələ heç bir təqdimat yoxdur.</div>';
            return;
        }

        subList.innerHTML = submissions.map(sub => `
            <div class="user-card-item" style="background: #1e293b; padding: 24px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #334155;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <div style="width: 40px; height: 40px; background: rgba(56, 189, 248, 0.1); color: #38bdf8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                        <div>
                            <h4 style="color: white; margin: 0; font-size: 16px; font-weight: 600;">${sub.studentName}</h4>
                            <p style="color: #94a3b8; margin: 2px 0 0 0; font-size: 12px;">
                                <i class="far fa-clock"></i> ${sub.timestamp} | <span style="color: #38bdf8;">${sub.taskTitle || 'İmtahan Cavabı'}</span>
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="deleteSubmission('${sub.id}')" style="padding: 8px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; border-radius: 8px; cursor: pointer; transition: 0.3s;" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div style="background: #ffffff; border-radius: 10px; padding: 16px; border: 1px solid #e2e8f0; margin-top: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">Tələbənin Cavabı:</div>
                    <pre style="color: #1e293b; margin: 0; white-space: pre-wrap; font-family: 'Fira Code', 'Consolas', monospace; font-size: 14px; line-height: 1.6;">${sub.answer && sub.answer.trim() !== "" ? sub.answer : "(Bu tələbə heç bir cavab yazmayıb)"}</pre>
                </div>

                <!-- Rating Section -->
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <label style="color: #94a3b8; font-size: 14px; font-weight: 600;">Qiymətləndirmə (1-10):</label>
                        <select onchange="rateSubmission('${sub.id}', this.value)" style="background: #0f172a; color: white; border: 1px solid #334155; border-radius: 8px; padding: 6px 12px; font-size: 14px; cursor: pointer;">
                            <option value="">Seçin</option>
                            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}" ${sub.rating == n ? 'selected' : ''}>${n}</option>`).join('')}
                        </select>
                    </div>
                    ${sub.rating ? (() => {
                let color = '#ef4444'; // red 1-3
                let bg = 'rgba(239, 68, 68, 0.1)';
                let border = 'rgba(239, 68, 68, 0.2)';

                if (sub.rating >= 8) {
                    color = '#10b981'; // green 8-10
                    bg = 'rgba(16, 185, 129, 0.1)';
                    border = 'rgba(16, 185, 129, 0.2)';
                } else if (sub.rating >= 4) {
                    color = '#f59e0b'; // yellow 4-7
                    bg = 'rgba(245, 158, 11, 0.1)';
                    border = 'rgba(245, 158, 11, 0.2)';
                }

                return `<div style="background: ${bg}; color: ${color}; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 14px; border: 1px solid ${border};">
                            <i class="fas fa-star"></i> Bal: ${sub.rating}/10
                        </div>`;
            })() : '<div style="color: #64748b; font-size: 13px; font-style: italic;">Qiymətləndirilməyib</div>'}
                </div>
            </div>
        `).join('');

    } catch (e) {
        subList.innerHTML = '<div style="color: #ef4444;">Xəta: Təqdimatları yükləmək mümkün olmadı.</div>';
    }
}

function viewSubmission(id) {
    try {
        const submissions = JSON.parse(localStorage.getItem('exam_submissions') || '[]');
        const sub = submissions.find(s => String(s.id) === String(id));

        if (sub) {
            const modalTitle = document.getElementById('modal-sub-title');
            const modalInfo = document.getElementById('modal-sub-info');
            const modalContent = document.getElementById('modal-sub-content');
            const modal = document.getElementById('submission-modal');

            if (modalTitle) modalTitle.textContent = `${sub.studentName} - ${sub.taskTitle || 'İmtahan Cavabı'}`;
            if (modalInfo) modalInfo.textContent = `Təqdimat vaxtı: ${sub.timestamp} | @${sub.username}`;
            if (modalContent) {
                // Use innerText to preserve line breaks and show text clearly as requested
                modalContent.innerText = sub.answer && sub.answer.trim() !== "" ? sub.answer : "(Bu tələbə heç bir cavab yazmayıb)";
            }

            if (modal) modal.style.display = 'flex';
        } else {
            alert("Təqdimat tapılmadı!");
        }
    } catch (e) {
        console.error("View error:", e);
        alert("Baxış zamanı xəta baş verdi!");
    }
}

function closeSubModal() {
    document.getElementById('submission-modal').style.display = 'none';
}

function deleteSubmission(id) {
    if (confirm('Bu təqdimatı silmək istədiyinizə əminsiniz?')) {
        try {
            let submissions = JSON.parse(localStorage.getItem('exam_submissions') || '[]');
            submissions = submissions.filter(s => String(s.id) !== String(id));
            localStorage.setItem('exam_submissions', JSON.stringify(submissions));
            loadSubmissions();
        } catch (e) {
            alert("Silinmə zamanı xəta baş verdi!");
        }
    }
}

function rateSubmission(id, rating) {
    if (!rating) return;

    try {
        let submissions = JSON.parse(localStorage.getItem('exam_submissions') || '[]');
        const subIndex = submissions.findIndex(s => String(s.id) === String(id));

        if (subIndex !== -1) {
            submissions[subIndex].rating = rating;
            localStorage.setItem('exam_submissions', JSON.stringify(submissions));
            loadSubmissions(); // Re-render to show binary/feedback
        }
    } catch (e) {
        console.error("Rating error:", e);
        alert("Qiymətləndirmə zamanı xəta baş verdi!");
    }
}

function loadAllUsers() {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '<div style="color:white;">Loading users...</div>';

    try {
        allUsers = JSON.parse(localStorage.getItem('holberton_users') || '[]');
        usersList.innerHTML = '';

        // Add admin user card (static visual representation)
        const adminCard = createUserCard({
            name: 'Admin',
            username: 'admin',
            role: 'admin',
            isSystemUser: true
        });
        usersList.appendChild(adminCard);

        // Add all registered users
        allUsers.forEach((user) => {
            // Skip showing the admin account itself if it was fetched
            if (user.username === 'admin') return;

            const userCard = createUserCard(user);
            usersList.appendChild(userCard);
        });

    } catch (e) {
        usersList.innerHTML = '<div style="color:red;">Failed to load users</div>';
    }
}

function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card-item';
    card.dataset.id = user.id;
    card.style.cssText = 'background: #1e293b; padding: 20px; border-radius: 16px; margin-bottom: 16px; border: 1px solid #334155;';

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 16px; align-items: center; flex: 1;">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${user.role === 'admin' ? 'e11d48' : '38bdf8'}&color=fff&size=64" 
                     style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid ${user.role === 'admin' ? '#e11d48' : '#38bdf8'};">
                <div>
                    <h3 style="color: white; margin: 0 0 4px 0;">${user.name}</h3>
                    <p style="color: #94a3b8; margin: 0; font-size: 14px;">@${user.username}</p>
                    ${user.discord ? `<p style="color: #5865F2; margin: 4px 0 0 0; font-size: 13px;"><i class="fab fa-discord"></i> ${user.discord}</p>` : ''}
                    ${user.gender ? `<p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;"><i class="fas fa-venus-mars"></i> ${user.gender === 'Male' ? 'Kişi' : 'Qadın'}</p>` : ''}
                    <span style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: ${user.role === 'admin' ? 'rgba(225, 29, 72, 0.2)' : 'rgba(56, 189, 248, 0.2)'}; 
                                 color: ${user.role === 'admin' ? '#e11d48' : '#38bdf8'}; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${user.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                </div>
            </div>
            <div style="display: flex; gap: 12px;">
                ${!user.isSystemUser ? `
                    <button onclick="editUser('${user.id}')" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteUser('${user.id}')" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : '<span style="color: #94a3b8; font-size: 12px;">System User</span>'}
            </div>
        </div>
    `;

    return card;
}

let currentEditId = null;

function editUser(id) {
    currentEditId = id;
    const user = allUsers.find(u => u.id == id);
    if (!user) return;

    // Populate modal fields
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-password').value = '';
    document.getElementById('edit-discord').value = user.discord || '';
    document.getElementById('edit-gender').value = user.gender || 'Male';

    // Show modal
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditId = null;
}

function editOwnProfile() {
    // Open modal for student to edit their own profile
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-username').value = currentUser.username;
    document.getElementById('edit-password').value = '';
    document.getElementById('edit-discord').value = currentUser.discord || '';
    document.getElementById('edit-gender').value = currentUser.gender || 'Male';

    // Set a flag to indicate self-edit
    currentEditId = 'SELF';

    document.getElementById('edit-modal').style.display = 'flex';
}

function saveUserEdit() {
    const newName = document.getElementById('edit-name').value.trim();
    const newUsername = document.getElementById('edit-username').value.trim();
    const newPassword = document.getElementById('edit-password').value;
    const newDiscord = document.getElementById('edit-discord').value.trim();
    const newGender = document.getElementById('edit-gender').value;

    if (!newName || !newUsername) {
        alert('Name and Username are required!');
        return;
    }

    try {
        if (currentEditId === 'SELF') {
            // Student updating their own profile
            currentUser.name = newName;
            currentUser.username = newUsername;
            currentUser.discord = newDiscord || '';
            currentUser.gender = newGender;
            if (newPassword) currentUser.password = newPassword;

            // Update in localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update in users list too
            const users = JSON.parse(localStorage.getItem('holberton_users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('holberton_users', JSON.stringify(users));
            }

            showStudentProfile();
            alert('Profile updated successfully!');
        } else {
            // Admin updating another user
            const users = JSON.parse(localStorage.getItem('holberton_users') || '[]');
            const userIndex = users.findIndex(u => u.id == currentEditId);

            if (userIndex !== -1) {
                users[userIndex].name = newName;
                users[userIndex].username = newUsername;
                users[userIndex].discord = newDiscord || '';
                users[userIndex].gender = newGender;
                if (newPassword) users[userIndex].password = newPassword;

                localStorage.setItem('holberton_users', JSON.stringify(users));
                loadAllUsers();
                alert('User updated successfully!');
            }
        }
        closeEditModal();
    } catch (e) {
        console.error(e);
        alert("Update failed!");
    }
}

function deleteUser(id) {
    if (confirm('Bu istifadəçini silməyə əminsiniz? Bütün əlaqəli məlumatlar (imtahan pozuntuları və s.) həmişəlik təmizlənəcək.')) {
        try {
            let users = JSON.parse(localStorage.getItem('holberton_users') || '[]');
            let violations = JSON.parse(localStorage.getItem('exam_violations') || '[]');

            const userToDelete = users.find(u => String(u.id) === String(id));

            if (userToDelete) {
                const card = document.querySelector(`.user-card-item[data-id="${id}"]`);
                if (card) card.classList.add('user-card-deleted');

                setTimeout(() => {
                    const username = userToDelete.username;
                    users = users.filter(u => String(u.id) !== String(id));
                    localStorage.setItem('holberton_users', JSON.stringify(users));

                    const updatedViolations = violations.filter(v => v.user !== username);
                    localStorage.setItem('exam_violations', JSON.stringify(updatedViolations));

                    loadAllUsers();
                }, 400);
            } else {
                alert("İstifadəçi tapılmadı!");
            }
        } catch (e) {
            console.error(e);
            alert("Silinmə zamanı xəta baş verdi!");
        }
    }
}
