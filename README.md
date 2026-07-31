# LogGuard AI

### An Intelligent Log Analysis and Monitoring Platform

---

## Abstract
LogGuard AI is a full-stack web application designed to help developers and admins upload, parse, filter, and visualize server/application logs in real-time. It provides a clean dashboard to monitor errors, trends, and download filtered results, making log debugging faster and easier.

---

## Introduction
Managing large log files manually is time-consuming and error-prone. LogGuard AI solves this by providing a centralized platform where users can upload log files, search by keywords/levels, and visualize error trends with charts. The project is built with a React + Vite frontend and Node.js + Express backend.

---

## Overview
The system has 2 main parts:
1. **Backend**: Handles file uploads, log parsing, filtering, and serves REST APIs + WebSocket for real-time logs.
2. **Frontend**: Interactive UI to upload files, view logs in a table, apply filters, see charts, and download CSV.

---

## Motivation
- Reduce manual effort in searching through GBs of log files
- Give developers instant visibility into ERROR/WARN/INFO trends
- Provide a single dashboard for teams to monitor application health

---

## Tech Stack

**Frontend**
- React + Vite
- Axios for API calls
- Recharts/Chart.js for data visualization
- CSS for styling

**Backend**
- Node.js + Express
- Multer for file uploads
- CORS
- Socket.io for real-time logs

**Other**
- Git & GitHub for version control
- Docker for deployment prep

---

## Features
- [x] Upload log files via `POST /api/upload`
- [x] Fetch and filter logs: `GET /api/logs?level=ERROR&search=keyword`
- [x] Loading spinners + Toast error notifications
- [x] Pagination for large log files
- [x] Error Trends Chart
- [x] Download filtered results as CSV
- [x] JWT Authentication
- [x] Real-time log streaming 
- [x] Dark mode toggle
- [x] **Live Dashboard**: Dark theme UI with Tailwind CSS + React
- [x] **Real-time Log Streaming**: Socket.io pushes logs instantly
- [x] **Anomaly Highlighting**: ERROR/WARN/INFO color-coded + "ROOT CAUSE" badge
- [x] **Stat Cards**: Critical Errors, Avg Response Time, System Health %
- [x] **File Upload UI**: Drag & Drop ready
- [ ] **Log Filtering + Search**: Coming in Day 9
- [ ] **CSV Export + Charts**: Coming in Day 10

---

## Folder Structure
```
LOGGUARD_AI
├── Backend
|   ├── node_modules/            # Installed packages
|   ├── uploads/                 # Uploaded log files
|   ├── server.js                # Main server file
|   ├── package.json             # Dependencies
|   └── README.md                # This file for Backend
├── Frontend
|   ├── node_modules/            # Installed packages
|   ├── public/                  # Static files
|   ├── src/                     # React components, pages, services
|   |   ├── components/          # Dashboard, LogTable, Upload, Charts
|   |   ├── pages/               # DashboardPage.jsx
|   |   ├── services/            # api.js - all axios calls
|   |   ├── hooks/               # custom hooks
|   |   ├── App.jsx
|   |   └── main.jsx
|   ├── .oxlintrc.json           # Linter config for OxLint
|   ├── .gitignore
|   ├── index.html
|   ├── package-lock.json
|   ├── package.json             # Dependencies
|   ├── README.md                # This file for Frontend
|   └── vite.config.js
```

---

## Workflow
1. **User** uploads a log file from Frontend
2. **Frontend** sends file to `POST /api/upload` using FormData
3. **Backend** parses and stores logs
4. **Frontend** fetches logs with filters via `GET /api/logs`
5. Data is displayed in table + charts. User can paginate or download CSV
6. Real-time logs pushed via WebSocket

---

## Getting Started

### 1. Clone the repo
    ```bash
    git clone https://github.com/your-username/LogGuard-AI.git
    cd LOGGUARD-AI
    ```

### 2. Backend Setup
    ```bash
    cd Backend
    npm install
    node server.js
    ```
    Server runs on http://localhost:5000

### 3. Frontend Setup
    ```bash
    cd Frontend
    npm install
    npm run dev
    ```
    Frontend runs on http://localhost:5173

### 4. Environment Variables
    Create .env in Frontend:
    ```
    VITE_API_URL=http://localhost:5000
    ```
    Open http://localhost:5173 to see the dashboard.

---

## Daily Work Progress

| Day | Title | Key Tasks Completed | Tech Used | Outcome / Deliverables |
| --- | --- | --- | --- | --- |
| **Day 1** | **Project Init & Repo Setup** | 1. Created GitHub repo `LogGuard-AI` <br> 2. Initialized project folders: `Frontend/`, `Backend/` <br> 3. Defined scope: Log upload, parsing, filtering, visualization <br> 4. Decided Tech Stack: React + Vite + Node + Express | Git, Node.js, Vite | Repo structure + documentation base ready |
| **Day 2** | **Frontend: File Upload UI Logic** | 1. Replaced "Select File" button with `<input type="file">` <br> 2. Show upload loader/spinner for 2-3s to simulate processing <br> 3. Parse and display selected file name in upload box after upload <br> 4. Add 3-5 fake log entries with random ERROR/WARN/INFO after upload <br> 5. Update dashboard stats: increase `errorCount` based on new ERROR rows | React, Vite, CSS, JavaScript | UI can now pick a file, show loader, display filename, and add dummy logs to table |
| **Day 3** | **Frontend: Filter + Search** | 1. Filter Dropdown: ALL/ERROR/WARN/INFO above table <br> 2. On change, loop through table rows and show only selected level <br> 3. Search Box: `oninput` + `includes()` to filter log messages <br> 4. Type "database" → only matching rows visible | React, JavaScript, DOM | Table can be filtered by level and searched by keyword |
| **Day 4** | **Frontend: CSV Export + Root Cause + UI** | 1. Setup: `npm create vite@latest Frontend --template react` <br> 2. Export to CSV: Convert `filteredLogs` → CSV string → Blob → Download <br> 3. Auto Root Cause Highlight: Find first `ERROR`, store `rootCauseId`, add red bg + badge <br> 4. Clear Filters Button: reset filter to `ALL` and search to `""` <br> 5. UI Components: Stats Cards, Color-coded rows, Upload Box, Filter+Search <br> 6. Testing: CSV export, Root Cause, Clear Filters <br> 7. Deliverable: 3 screenshots for report | React, Vite, JavaScript, CSS | Working React app locally. Export, highlight, filter all working |
| **Day 5** | **Backend: APIs + Postman Testing** | 1. Start backend server locally <br> 2. Test APIs with Postman: `POST /api/upload` and `GET /api/logs/` | Node.js, Express, Multer | Backend running. APIs ready for frontend connection |
| **Day 6** | **Frontend + Backend Integration** | 1. Replace dummy data with `fetch/axios` calls <br> 2. Implement file upload: `POST /api/upload` with `FormData` <br> 3. Fetch and display logs: `GET /api/logs?level=ERROR&search=keyword` <br> 4. Add loading spinner while fetching <br> 5. Add error handling + toast notifications <br> 6. Make filter + search work with backend query params <br> 7. Add pagination for large log files <br> 8. Add "Error Trends" chart using Recharts/Chart.js <br> 9. Enable "Download CSV" on filtered API results <br> 10. Update README with API endpoints | React, Axios, Express, Recharts | Full E2E: Upload → Parse → Filter → Chart → Download with real APIs |
| **Day 7** | **Auth + Real-time + Deployment** | 1. Authentication: JWT `/api/auth/login` and `/api/auth/register` <br> 2. Protect API routes with middleware <br> 3. Add Logout + store token in `localStorage` <br> 4. Real-time Logs: WebSocket/Socket.io for live streaming <br> 5. Auto-refresh table + "New logs: 5" badge <br> 6. Dashboard: User-specific logs, Date range picker `start/end` <br> 7. Dark mode toggle <br> 8. Deployment: `.env` for `API_URL`, `JWT_SECRET` + `Dockerfile` for FE/BE <br> 9. Test production build <br> 10. Update README with Auth + WebSocket info | Node.js, JWT, Socket.io, Docker, React | Target: Secure, multi-user, real-time, deployable LogGuard |
| **Day 8** | **Live Dashboard + Tailwind UI** | 1. Fixed Tailwind CSS setup with Vite + PostCSS <br> 2. Built dark theme dashboard: Header, 3 Stat Cards, Upload Box, Live Log Table <br> 3. Integrated Socket.io-client to receive logs in real-time <br> 4. Implemented color-coded logs: ERROR=Red, WARN=Yellow, INFO=Blue <br> 5. Added "ROOT CAUSE" badge and red border for anomaly logs <br> 6. Updated stats cards to react to live incoming logs <br> 7. Tested E2E: Backend emits → Frontend renders instantly <br> 8. Updated all 3 README files with current setup | React, Vite, Tailwind CSS, Socket.io, Node.js, Express | Deliverable: Fully working live dashboard. Real-time logs streaming with professional dark UI. Ready for Day 9 file upload. |

---

## Advantages
1. Centralized log viewing instead of SSH + grep
2. Real-time updates and visual trends
3. Easy filtering and CSV export for reporting
4. Scalable React + Node architecture
5. AI-powered anomaly detection, Email/Slack alerts, JSON/Syslog support, Docker deployment

---

## Disadvantages
1. Large file uploads may take time without streaming
2. Currently supports text-based logs only
3. No bulit-in alerting system yet

---

## Future Scope
- AI-powered anomaly detection in logs
- Email/Slack alerts for critical ERROR spikes
- Support for JSON, Syslog, and CloudWatch logs
- Role-based access control for teams
- Deploy to AWS/GCP with Docker + CI/CD

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Conclusion
LogGuard AI streamlines log monitoring for developers by combining a fast React frontend with a robust Node backend. With Day 6 integration complete and Day 7 adding auth + real-time, the platform is ready to scale into a production log monitoring tool.