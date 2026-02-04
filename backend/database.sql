-- Database Schema for Holberton Dashboard
-- Dialect: Standard SQL (Compatible with PostgreSQL/MySQL)

-- 1. Users Table
-- Replaces localStorage 'holberton_users'
-- Added 'id' for primary key and 'created_at' for auditing
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Should store hashed passwords
    discord VARCHAR(50),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student')),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PLD Topics Table
-- New table to replace hardcoded topics in frontend/holberton1.js
-- Allows dynamic updates of topics without changing code
CREATE TABLE pld_topics (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    week_order INTEGER NOT NULL, -- To determine the rotation order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tasks Table
-- Replaces localStorage 'myTasks'
-- 'created_by' links to the admin who created the task
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Auditing: who created this task
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. User Settings Table (Optional but recommended)
-- Replaces localStorage 'theme_*'
CREATE TABLE user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme_preference VARCHAR(10) DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data Seeding (Optional)

-- Default Admin (Password should be hashed in production)
INSERT INTO users (name, username, password, role) 
VALUES ('System Admin', 'admin', 'admin', 'admin');

-- Seed PLD Topics
INSERT INTO pld_topics (topic, week_order) VALUES 
('Mastering C Programming: Pointers and Memory Management', 1),
('Data Structures: Linked Lists, Stacks, and Queues', 2),
('Algorithm Design: Sorting and Searching Techniques', 3),
('System Programming: Processes and Threads', 4),
('Web Development: Building Dynamic Applications', 5),
('Database Design: SQL and Relational Databases', 6),
('Version Control: Advanced Git Workflows', 7),
('Problem Solving: Algorithmic Thinking Strategies', 8);
