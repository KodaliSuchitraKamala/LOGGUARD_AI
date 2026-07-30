# LOGGUARD AI - Frontend Folder
**Detective for Server Logs - Find root in 10 seconds**

LogGuard AI Frontend is a React-based dashbboard UI to upload, filter, search, and visualize server logs.
This folder contains only the client-side application. The backend API handles parsing and storage.

---

## ✨ Features 

### Dashboard Overview
- **Critical Errors count** - Live count of ERROR level logs
- **Average Response Time** - Calculated from log timestamps
- **System Health percentage** - Based on ERROR/WARN ratio

### Log Upload
- **Drag & Drop or Click to upload**
- **Supports**: `.log`, `.txt`, `.zip` files up to 50GB
- Uploads directly to backend via `POST /api/upload`

### Log Analysis Table
- **Colums:** Time, Level, Message
- **Color-coded levels:** `ERROR` = Red, `WARN` = Yellow, `INFO` = Blue
- **Auto "ROOT CAUSE" badge** on critical error patterns

### Controls
- **Filters logs by level:** `ALL`, `ERROR`, `WARN`, `INFO`
- **Search logs by keyword** - Real-time search
- **Clear Filters button**
- **Download filtered logs as CSV**

---

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: React hooks `useState`, `useEffect`
- **HTTP Client**: Axios
- **Charts**: ReCharts
- **Notifications**: React-Toastify

---

## Folder Sturcture
```
LOGGUARD_AI
└── Frontend
    ├── node_modules/ # Installed packages
    ├── public/ # Static files
    ├── src/ # React components, pages, services
    |   ├── components/ # Dashboard, LogTable, Upload, Charts
    |   ├── pages/ # DashboardPage.jsx
    |   ├── services/ # api.js - all axios calls
    |   ├── hooks/ # custom hooks
    |   ├── App.jsx
    |   └── main.jsx
    ├── .oxlintrc.json # Linter config for OxLint
    ├── .gitignore
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── vite.config.js
```

----

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Backend server running on `http://localhost:5000`

### 1. Install Dependencies
Install all required packages:
```bash
npm install
```
### 2. Setup Environment Variables
Create a .env file inside the /Frontend folder:
```bash
VITE_API_URL=https://localhost:5000
```
This tells the frontend where your backend API is running
### 3. Run Development Server
Start the app:
```bash 
npm run dev
```
App will run on http://localhost:5173
### 4. API Integration 
The Frontend connects to the backend using Axios. Base URL comes from .env.
| Method | EndPoint | Purpose |
| --- | --- | ---|
| `POST` | `/api/upload` | Upload log file. FormDate key: `file` |
| `GET` | `/api/logs/` | Fetch logs. Query: `level`, `search`, `page` |
| `GET` | `/api/stats` | Fetch dashboard stats |
**Example:**
```
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

// Upload log
const formData = new FormData();
formData.append("file", file);
await axios.post(`${API}/api/upload`, formData);

// Get logs
const res = await axios.get(`${API}/api/logs?level=ERROR`);
```
### 5. Clone the repository
```bash
git clone https://github.com/KodaliSuchitraKamala/LOGGUARD_AI.git
cd LOGGUARD_AI/Frontend