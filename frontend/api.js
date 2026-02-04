/**
 * API Service for interacting with MockAPI
 * 
 * INSTRUCTIONS FOR USER:
 * 1. Go to https://mockapi.io
 * 2. Create a new project (e.g., "Holberton Project")
 * 3. Create two resources:
 *    - "users" (schema: name, username, password, discord, role, gender)
 *    - "tasks" (schema: text, completed, createdBy, createdAt)
 * 4. Copy your project URL (looks like https://63f4...mockapi.io/)
 * 5. Paste it below in the API_URL variable.
 */

const API_URL = "YOUR_MOCKAPI_URL_HERE"; // <--- PASTE YOUR URL HERE

const api = {
    // --- USERS ---

    // Get all users
    getUsers: async () => {
        try {
            const res = await fetch(`${API_URL}/users`);
            if (!res.ok) throw new Error('Failed to fetch users');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    // Get single user by ID
    getUser: async (id) => {
        try {
            const res = await fetch(`${API_URL}/users/${id}`);
            return await res.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    // Register new user
    createUser: async (userData) => {
        try {
            // Set default role if not present
            if (!userData.role) userData.role = 'student';

            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await res.json();
        } catch (e) {
            console.error("Error creating user:", e);
            throw e;
        }
    },

    // Update user
    updateUser: async (id, updates) => {
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await res.json();
        } catch (e) {
            console.error("Error updating user:", e);
            throw e;
        }
    },

    // Delete user
    deleteUser: async (id) => {
        try {
            await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    // --- TASKS ---

    // Get all tasks
    getTasks: async () => {
        try {
            const res = await fetch(`${API_URL}/tasks`);
            if (!res.ok) throw new Error('Failed to fetch tasks');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    // Create task
    createTask: async (taskData) => {
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            return await res.json();
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    // Update task (toggle complete or editing text)
    updateTask: async (id, updates) => {
        try {
            const res = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await res.json();
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    // Delete task
    deleteTask: async (id) => {
        try {
            await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
};

// Expose to window for global access
window.api = api;
