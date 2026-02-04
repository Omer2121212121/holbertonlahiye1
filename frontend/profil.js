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
// Refresh currentUser data from API to ensure fresh data
async function initProfile() {
    // If student, refresh own data
    if (isStudent && currentUser.id) {
        const freshData = await api.getUser(currentUser.id);
        if (freshData) {
            currentUser = freshData;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }

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
}

async function loadAllUsers() {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '<div style="color:white;">Loading users...</div>';

    try {
        allUsers = await api.getUsers();
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

async function saveUserEdit() {
    const newName = document.getElementById('edit-name').value.trim();
    const newUsername = document.getElementById('edit-username').value.trim();
    const newPassword = document.getElementById('edit-password').value;
    const newDiscord = document.getElementById('edit-discord').value.trim();
    const newGender = document.getElementById('edit-gender').value;

    if (!newName || !newUsername) {
        alert('Name and Username are required!');
        return;
    }

    const updates = {
        name: newName,
        username: newUsername,
        discord: newDiscord || undefined,
        gender: newGender
    };
    if (newPassword) updates.password = newPassword;

    try {
        if (currentEditId === 'SELF') {
            // Student updating their own profile
            if (currentUser.id) {
                const updatedUser = await api.updateUser(currentUser.id, updates);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                currentUser = updatedUser; // Update local state
                showStudentProfile();
                alert('Profile updated successfully!');
            } else {
                alert("Cannot update profile: User ID missing (Migration issue?)");
            }
        } else {
            // Admin updating another user
            await api.updateUser(currentEditId, updates);
            loadAllUsers();
            alert('User updated successfully!');
        }
        closeEditModal();
    } catch (e) {
        console.error(e);
        alert("Update failed!");
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await api.deleteUser(id);
            loadAllUsers();
            alert('User deleted successfully!');
        } catch (e) {
            console.error(e);
            alert("Delete failed!");
        }
    }
}
