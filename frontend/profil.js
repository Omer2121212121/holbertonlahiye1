// Get current user
let currentUser = null;
try {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
} catch (e) {
    console.warn('Could not load user:', e);
    window.location.href = 'login.html';
}

if (!currentUser) {
    window.location.href = 'login.html';
}

const isAdmin = currentUser.role === 'admin';
const isStudent = currentUser.role === 'student';

// Show role badge
const badge = document.getElementById('role-badge');
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

// Display appropriate view
if (isStudent) {
    showStudentProfile();
} else if (isAdmin) {
    showAdminPanel();
}

function showStudentProfile() {
    document.getElementById('student-view').style.display = 'block';
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
    document.getElementById('admin-view').style.display = 'block';
    loadAllUsers();
}

function loadAllUsers() {
    const users = JSON.parse(localStorage.getItem('holberton_users')) || [];
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';

    // Add admin user card
    const adminCard = createUserCard({
        name: 'Admin',
        username: 'admin',
        role: 'admin',
        isSystemUser: true
    });
    usersList.appendChild(adminCard);

    // Add all registered users
    users.forEach((user, index) => {
        const userCard = createUserCard(user, index);
        usersList.appendChild(userCard);
    });
}

function createUserCard(user, index) {
    const card = document.createElement('div');
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
                    <button onclick="editUser(${index})" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteUser(${index})" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : '<span style="color: #94a3b8; font-size: 12px;">System User</span>'}
            </div>
        </div>
    `;

    return card;
}

let currentEditIndex = null;

function editUser(index) {
    currentEditIndex = index;
    const users = JSON.parse(localStorage.getItem('holberton_users')) || [];
    const user = users[index];

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
    currentEditIndex = null;
}

function editOwnProfile() {
    // Open modal for student to edit their own profile
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-username').value = currentUser.username;
    document.getElementById('edit-password').value = '';
    document.getElementById('edit-discord').value = currentUser.discord || '';
    document.getElementById('edit-gender').value = currentUser.gender || 'Male';

    // Set a flag to indicate self-edit
    currentEditIndex = -1; // Special value for self-edit

    document.getElementById('edit-modal').style.display = 'flex';
}

function saveOwnProfile() {
    const newName = document.getElementById('edit-name').value.trim();
    const newUsername = document.getElementById('edit-username').value.trim();
    const newPassword = document.getElementById('edit-password').value;
    const newDiscord = document.getElementById('edit-discord').value.trim();
    const newGender = document.getElementById('edit-gender').value;

    if (!newName || !newUsername) {
        alert('Name and Username are required!');
        return;
    }

    // Find and update user in holberton_users
    const users = JSON.parse(localStorage.getItem('holberton_users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);

    if (userIndex !== -1) {
        users[userIndex].name = newName;
        users[userIndex].username = newUsername;

        if (newPassword) {
            users[userIndex].password = newPassword;
        }

        users[userIndex].discord = newDiscord || undefined;
        users[userIndex].gender = newGender;

        localStorage.setItem('holberton_users', JSON.stringify(users));

        // Update currentUser in localStorage
        currentUser.name = newName;
        currentUser.username = newUsername;
        currentUser.discord = newDiscord || undefined;
        currentUser.gender = newGender;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    closeEditModal();
    showStudentProfile();
    alert('Profile updated successfully!');
}

function saveUserEdit() {
    if (currentEditIndex === -1) {
        // Self-edit mode
        saveOwnProfile();
    } else if (currentEditIndex !== null) {
        // Admin editing another user
        const users = JSON.parse(localStorage.getItem('holberton_users')) || [];
        const user = users[currentEditIndex];

        const newName = document.getElementById('edit-name').value.trim();
        const newUsername = document.getElementById('edit-username').value.trim();
        const newPassword = document.getElementById('edit-password').value;
        const newDiscord = document.getElementById('edit-discord').value.trim();
        const newGender = document.getElementById('edit-gender').value;

        if (!newName || !newUsername) {
            alert('Name and Username are required!');
            return;
        }

        user.name = newName;
        user.username = newUsername;

        if (newPassword) {
            user.password = newPassword;
        }

        user.discord = newDiscord || undefined;
        user.gender = newGender;

        users[currentEditIndex] = user;
        localStorage.setItem('holberton_users', JSON.stringify(users));

        closeEditModal();
        loadAllUsers();
        alert('User updated successfully!');
    }
}

function deleteUser(index) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('holberton_users')) || [];
        users.splice(index, 1);
        localStorage.setItem('holberton_users', JSON.stringify(users));
        loadAllUsers();
        alert('User deleted successfully!');
    }
}
