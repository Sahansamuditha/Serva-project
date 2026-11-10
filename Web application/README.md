# SERVA - Maintenance Monitoring & Management Platform
### Institute of Technology, University of Moratuwa (ITUM)

A unified maintenance platform connecting **Admin**, **Director**, **Maintenance Officer**, and **Requester** user interfaces with a single centralized Node.js/Express backend, a single MySQL database schema, and complete Docker containerization.

---

## 🏛️ System Architecture

- **Frontend (`frontend/`)**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Chart.js.
  - **Pixel-Perfect Login Screen**: Directly implements `screen.png` with official University of Moratuwa branding (`logo.png`).
  - **4 Connected User Portals**:
    - 🛡️ **Admin Portal**: User management, system-wide analytics, job oversight, logs, team assignments.
    - 📋 **Director Portal**: Institutional KPIs, maintenance requests review, high-level reports.
    - 🛠️ **Maintenance Officer Portal**: Request assignment, task review, job scheduling, labourers allocation.
    - 🎓 **Requester Portal**: New maintenance request submission, status tracking, rating & feedback.
  - **Serva Top Role Bar**: Allows instant 1-click switching between personas for effortless demonstration and testing, plus global Sign Out.
- **Backend (`backend/server.js`)**: Single consolidated Node.js/Express backend file handling:
  - JWT Authentication & bcrypt password verification.
  - Role-based permissions & audit logging.
  - Complete REST endpoints for Requests, Jobs, Teams, Labourers, Users, Reports, Notifications, Settings, and Multipart File Uploads.
  - Automatic MySQL reconnection retry logic for reliable Docker startup.
- **Database (`database/init.sql`)**: Single consolidated MySQL script containing table definitions, foreign keys, and pre-seeded sample data.

---

## 🔑 Default Login Credentials

All accounts are pre-seeded with the password: **`password123`**

| Role | Email | Name | Department |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@itum.mrt.ac.lk` | Anura Perera | ITUM Central Admin |
| **Director** | `director@itum.mrt.ac.lk` | Prof. Ranjith Dissanayake | Directorate Office |
| **Maintenance Officer** | `officer@itum.mrt.ac.lk` | Chaminda Bandara | Works & Maintenance Division |
| **Requester** | `requester@itum.mrt.ac.lk` | Dr. Kamal Silva | Division of Electrical & Computer Eng |

> **Quick Demo Login**: On the Login screen, click any of the 4 quick demo buttons to instantly autofill and sign in!

---

## 🚀 Running with Docker (Recommended)

Make sure Docker and Docker Compose are installed and running.

### 1. Build and Start All Services
```bash
docker compose up --build
```

### 2. Access the Application
- **Unified Frontend**: [http://localhost:3000](http://localhost:3000)
- **Central Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MySQL Database**: `localhost:3306` (Database: `serva_db`, User: `serva_user`, Pass: `serva_secret`)

### 3. Stop Containers
```bash
docker compose down
```

---

## 💻 Running Locally (Without Docker)

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### 1. Setup MySQL Database
Import the single database file into your local MySQL instance:
```bash
mysql -u root -p < database/init.sql
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on http://localhost:5000*

### 3. Start Frontend App
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on http://localhost:3000*

---

## 📁 Repository Structure

```
intergrate/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js            # <-- Single Backend File
├── database/
│   └── init.sql             # <-- Single Database File (MySQL)
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx          # Role-based Portal Switcher & Session State
│   │   ├── pages/Login.jsx  # Pixel-perfect screen.png Login page
│   │   ├── components/ServaRoleBar.jsx # Quick Demo Switcher & Sign Out
│   │   └── portals/         # The 4 Connected User Portals
│   │       ├── Admin/
│   │       ├── Director/
│   │       ├── MaintainOfficer/
│   │       └── Requester/
├── Serva_UI/                # Original UI assets & reference
│   ├── logo.png
│   └── screen.png
├── docker-compose.yml       # Docker Compose setup
├── .env.example
└── README.md
```
