# Serva - Campus Maintenance Management System

Serva is a comprehensive campus maintenance and facility management platform designed to streamline issue reporting, task scheduling, automated priority ranking, and multi-portal operations for university and enterprise environments.

---

## 🏗 System Architecture

The project is structured into three main layers:

### 1. Web Application (`Web application/`)
- **Backend API (`backend/`)**: Node.js & Express RESTful API with MySQL connectivity, JWT authentication, email notifications (Brevo / Nodemailer), and task assignment management.
- **Database (`database/`)**: MySQL relational schema initialized via `init.sql`.
- **Unified Frontend (`frontend/`)**: Modern React + Vite application integrating all user portals:
  - **Requester Portal**: Report maintenance issues, attach photos, track request status.
  - **Maintenance Officer Portal**: Review requests, assign jobs to labour teams, track inventory, and view analytics.
  - **Director Portal**: High-level KPIs, budget tracking, performance metrics, and audit reports.
  - **Admin Portal**: User management, system configuration, access control.
- **Portals UI (`Serva_UI/`)**: Standalone portal source components and modular interfaces.

### 2. Mobile Applications (`Mobile application/`)
- **Labour Mobile (`Labour Mobile/Labour_Mobile/`)**: React Native / Expo application for field technicians to view assigned tasks, update job progress, capture photo evidence, and log work slips.
- **Maintenance Officer Mobile (`Maintaince officer mobile/`)**: Mobile dashboard for maintenance officers on the move to review urgent requests and dispatch teams.

### 3. Maintenance Priority Algorithm (`maintenance-algorithm/`)
- Intelligent multi-factor ranking algorithm prioritizing incoming maintenance requests based on severity, location criticality, user impact, and safety risks.

---

## 🚀 Quick Start with Docker

You can launch the entire ecosystem (Database, Backend, Frontend, and Mobile Web Portals) using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/Sahansamuditha/Serva-project.git
cd Serva-project

# Configure environment variables
cp "Web application/.env.example" "Web application/.env"

# Launch all services
docker compose up --build -d
```

### Services & Ports

| Service | Port | Description |
|---|---|---|
| **MySQL Database** | `3306` | Relational database preloaded with `init.sql` |
| **Backend API** | `5000` | Express REST API server |
| **Web Frontend** | `3000` | Unified Web Portal (Admin, Director, Officer, Requester) |
| **Labour Mobile Web** | `3001` | Field technician web-accessible portal |
| **Officer Mobile Web** | `8081` | Maintenance officer mobile web application |

---

## 🛠 Manual Setup

### Backend
```bash
cd "Web application/backend"
npm install
npm run dev
```

### Unified Frontend
```bash
cd "Web application/frontend"
npm install
npm run dev
```

### Maintenance Officer Mobile
```bash
cd "Mobile application/Maintaince officer mobile"
npm install
npx expo start
```

### Labour Mobile
```bash
cd "Mobile application/Labour Mobile/Labour_Mobile"
npm install
npm run dev
```

---

## 📄 License
This project is licensed under the terms specified by the development team.
