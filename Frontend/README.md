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
- **Real-time**: Socket.io-clien

---

## Folder Sturcture
```
LOGGUARD_AI/
├── Backend/
├── Frontend/
│ ├── node_modules/
│ ├── public/
│ │ ├── alarm.mp3
│ ├── src/
│ │ ├── components/
| │ | ├── Alerts.jsx # Alerts dashoboard
| │ | ├── AlertsToast.jsx
│ │ │ ├── Analytics.jsx # Analytics dashboard with charts
│ │ │ ├── Dashboard.jsx # Health cards + Test Alert button
│ │ │ ├── FileUpload.jsx # Drag & Drop log upload
│ │ │ ├── LogTable.jsx # Filterable log table
| │ | ├── LogList.jsx
│ │ │ ├── ErrorTrendChart.jsx # Line chart: Errors per day
│ │ │ ├── ResponseTimeChart.jsx# Bar chart: Avg response time
│ │ │ ├── LogLevelPie.jsx # Pie chart: Log level distribution
| │ | ├── Upload.jsx 
│ │ │ └── Login.jsx # Auth page
│ │ ├── services/
│ │ │ ├── api.js # All axios API calls
│ │ │ ├── auth.js # Auth helpers
│ │ │ └── socket.js # Socket.io client for real-time alerts
│ │ ├── App.jsx # Main app with Dashboard/Analytics tabs
│ │ ├── App.css
│ │ ├── index.css
│ │ ├── main.jsx
│ │ └── socket.js
│ ├──.env
│ ├──.gitignore
│ ├──.eslintrc.json
│ ├── Dockerfile
│ ├── index.html
│ ├── package.json
│ ├── package-lock.json
│ ├── postcss.config.js
│ ├── README.md
│ ├── tailwind.config.js
│ └── vite.config.js
├──.gitignore
├── LICENSE
├── README.md
├── sample.log
└── test.log # Sample log file for testing
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
npm install socket.io-client axios
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
```

---

### **What I fixed**
1. **Port mismatch**: Backend was 3001 in code but 5000 in docs. Set everything to 5000.
2. **API paths**: Made them consistent: `/api/upload`, `/api/logs`, `/api/stats`
3. **Day 8 status**: Marked current features as done, Day 9 as next
4. **Typos**: Fixed "Sturcture", "Colums", "oxlintrc" etc
 
---