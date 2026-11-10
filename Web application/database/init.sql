-- =======================================================
-- SERVA - Maintenance Monitoring & Management Platform
-- Institute of Technology, University of Moratuwa (ITUM)
-- Single Consolidated Database Initialization Script
-- =======================================================

CREATE DATABASE IF NOT EXISTS serva_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE serva_db;

-- 1. USERS TABLE
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS labourers;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    username VARCHAR(100) NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'requester',
    designation VARCHAR(150) DEFAULT 'Staff Member',
    department VARCHAR(150) DEFAULT 'ITUM Central',
    phone VARCHAR(50) DEFAULT '+94 77 123 4567',
    avatar LONGTEXT DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    must_change_password TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TEAMS TABLE
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    `lead` VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    contact VARCHAR(50) DEFAULT '+94 77 555 1234',
    members_count INT DEFAULT 4,
    status ENUM('Active', 'On Leave', 'Busy') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. REQUESTS TABLE
CREATE TABLE requests (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100) NULL,
    location VARCHAR(255) NOT NULL,
    zone VARCHAR(50) DEFAULT NULL,
    building VARCHAR(150) DEFAULT NULL,
    room VARCHAR(150) DEFAULT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending',
    requester_id INT NULL,
    requester_name VARCHAR(150) NOT NULL,
    requester_email VARCHAR(191) NOT NULL,
    requester_phone VARCHAR(50) DEFAULT NULL,
    requester_dept VARCHAR(150) DEFAULT 'General',
    assigned_team_id INT NULL,
    assigned_team_name VARCHAR(150) DEFAULT NULL,
    assigned_officer VARCHAR(150) DEFAULT NULL,
    scheduled_date DATE DEFAULT NULL,
    completion_date DATE DEFAULT NULL,
    rating INT DEFAULT NULL,
    rating_comment TEXT DEFAULT NULL,
    images JSON DEFAULT NULL,
    priority_score DECIMAL(5,2) DEFAULT NULL,
    priority_formula VARCHAR(255) DEFAULT NULL,
    peoples INT DEFAULT NULL,
    affected_people VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_team_id) REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. JOBS TABLE
CREATE TABLE jobs (
    id VARCHAR(50) PRIMARY KEY,
    request_id VARCHAR(50) NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'In Progress',
    team_id INT NULL,
    team_name VARCHAR(150) DEFAULT NULL,
    lead_person VARCHAR(150) DEFAULT NULL,
    labourers_assigned INT DEFAULT 2,
    location VARCHAR(255) NOT NULL,
    start_date DATE DEFAULT NULL,
    due_date DATE DEFAULT NULL,
    progress INT DEFAULT 0,
    notes TEXT DEFAULT NULL,
    proof_photo LONGTEXT DEFAULT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. LABOURERS TABLE
CREATE TABLE labourers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    trade VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status ENUM('Available', 'Assigned', 'On Leave') DEFAULT 'Available',
    phone VARCHAR(50) DEFAULT '+94 71 234 5678',
    rating DECIMAL(3, 1) DEFAULT 4.8,
    assigned_job_id VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_job_id) REFERENCES jobs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    role VARCHAR(50) DEFAULT 'all',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error', 'system') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ACTIVITY LOGS TABLE
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    user_name VARCHAR(150) NOT NULL,
    action VARCHAR(150) NOT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. USER SETTINGS TABLE
CREATE TABLE user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    sms_alerts BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    weekly_digest BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. SESSIONS TABLE
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    device VARCHAR(150) DEFAULT 'Chrome on Windows 11',
    location VARCHAR(150) DEFAULT 'Colombo, Sri Lanka',
    is_current BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =======================================================
-- SEED DATA
-- Default password for System Administrator is: password123
-- (Bcrypt hash: $2a$10$w86H04mN38nFzF1iA28aVOXl9rI8NfZiI2n8l2yJ6k9u7O6R7b1O6)
-- =======================================================

-- Seed System Administrator (Only Active Account)
INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, designation, department, phone, status) VALUES
(1, 'admin@itum.mrt.ac.lk', 'admin', '$2a$10$CIUiXYs0tld/y0W0zOAA7eCqSrmxmiY69CFpZfr5F4kZEU8d8cPtO', 'System', 'Administrator', 'Admin', 'System Administrator', 'ITUM Central Administration', '+94 77 123 4567', 'active');

-- Seed User Settings for Admin
INSERT INTO user_settings (user_id, email_alerts, sms_alerts, push_notifications, weekly_digest) VALUES
(1, TRUE, TRUE, TRUE, TRUE);

