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
LOGGUARD_AI/
├── Backend/
│ ├── node_modules/
│ ├── middleware/
│ │ ├── adminMiddleware.js
│ │ ├── auth.js
│ │ ├── authMiddleware.js
│ │ ├── roleMiddleware.js
│ ├── models/
│ │ ├── Alerts.js
│ │ ├── Log.js
│ │ ├── User.js
│ ├── routes/
│ │ ├── alerts.js
│ │ ├── analytics.js
│ │ ├── auth.js
│ │ ├── logRoutes.js
│ │ ├── logs.js
│ │ ├── upload.js
│ │ ├── users.js
│ ├── uploads/ # Temp files from multer
│ ├── utils/
│ │ ├── logParser.js
│ ├── .env
│ ├── db.js
│ ├── db.json
│ ├── emailService.js
│ ├── Dockerfile
│ ├── package.json
│ ├── package-lock.json
│ ├── README.md
│ ├── server.js # Express API + Anomaly Detection
│ └── users.json 
├── Frontend/
│ ├── node_modules/
│ ├── public/
│ │ ├── alarm.mp3
│ ├── src/
│ │ ├── components/
| │ | ├── admin/
| | │ | ├── AdminStats.jsx
| │ | ├── AdminUsersTable.jsx
| │ | ├── Alerts.jsx # Alerts dashoboard
| │ | ├── AlertsToast.jsx
│ │ │ ├── Analytics.jsx # Analytics dashboard with charts
│ │ │ ├── Dashboard.jsx # Health cards + Test Alert button
│ │ │ ├── FileUpload.jsx # Drag & Drop log upload
│ │ │ ├── LogTable.jsx # Filterable log table
| │ | ├── LogList.jsx
| │ | ├── Navbar.jsx
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
```bash
VITE_API_URL=http://localhost:5000
```
Open http://localhost:5173 to see the dashboard.

---

## Daily Work Progress

| Day | Title | Key Tasks Completed | Tech Used | Outcome / Deliverables |
| --- | --- | --- | --- | --- |
| **Day 1** | **Project Init & Repo Setup** | 1. Created GitHub repo `LogGuard-AI` <br> 2. Initialized project folders: `Frontend/`, `Backend/` <br> 3. Defined scope: Log upload, parsing, filtering, visualization <br> 4. Decided Tech Stack: React + Vite + Node + Express | Git, Node.js, Vite | **Deliverable:**<br>Repo structure + documentation base ready |
| **Day 2** | **Frontend: File Upload UI Logic** | 1. Replaced "Select File" button with `<input type="file">` <br> 2. Show upload loader/spinner for 2-3s to simulate processing <br> 3. Parse and display selected file name in upload box after upload <br> 4. Add 3-5 fake log entries with random ERROR/WARN/INFO after upload <br> 5. Update dashboard stats: increase `errorCount` based on new ERROR rows | React, Vite, CSS, JavaScript | **Deliverable:**<br>UI can now pick a file, show loader, display filename, and add dummy logs to table |
| **Day 3** | **Frontend: Filter + Search** | 1. Filter Dropdown: ALL/ERROR/WARN/INFO above table <br> 2. On change, loop through table rows and show only selected level <br> 3. Search Box: `oninput` + `includes()` to filter log messages <br> 4. Type "database" → only matching rows visible | React, JavaScript, DOM | **Deliverable:**<br>Table can be filtered by level and searched by keyword |
| **Day 4** | **Frontend: CSV Export + Root Cause + UI** | 1. Setup: `npm create vite@latest Frontend --template react` <br> 2. Export to CSV: Convert `filteredLogs` → CSV string → Blob → Download <br> 3. Auto Root Cause Highlight: Find first `ERROR`, store `rootCauseId`, add red bg + badge <br> 4. Clear Filters Button: reset filter to `ALL` and search to `""` <br> 5. UI Components: Stats Cards, Color-coded rows, Upload Box, Filter+Search <br> 6. Testing: CSV export, Root Cause, Clear Filters <br> 7. Deliverable: 3 screenshots for report | React, Vite, JavaScript, CSS | **Deliverable:**<br>Working React app locally. Export, highlight, filter all working |
| **Day 5** | **Backend: APIs + Postman Testing** | 1. Start backend server locally <br> 2. Test APIs with Postman: `POST /api/upload` and `GET /api/logs/` | Node.js, Express, Multer | **Deliverable:**<br>Backend running. APIs ready for frontend connection |
| **Day 6** | **Frontend + Backend Integration** | 1. Replace dummy data with `fetch/axios` calls <br> 2. Implement file upload: `POST /api/upload` with `FormData` <br> 3. Fetch and display logs: `GET /api/logs?level=ERROR&search=keyword` <br> 4. Add loading spinner while fetching <br> 5. Add error handling + toast notifications <br> 6. Make filter + search work with backend query params <br> 7. Add pagination for large log files <br> 8. Add "Error Trends" chart using Recharts/Chart.js <br> 9. Enable "Download CSV" on filtered API results <br> 10. Update README with API endpoints | React, Axios, Express, Recharts | **Deliverable:**<br>Full E2E: Upload → Parse → Filter → Chart → Download with real APIs |
| **Day 7** | **Auth + Real-time + Deployment** | 1. Authentication: JWT `/api/auth/login` and `/api/auth/register` <br> 2. Protect API routes with middleware <br> 3. Add Logout + store token in `localStorage` <br> 4. Real-time Logs: WebSocket/Socket.io for live streaming <br> 5. Auto-refresh table + "New logs: 5" badge <br> 6. Dashboard: User-specific logs, Date range picker `start/end` <br> 7. Dark mode toggle <br> 8. Deployment: `.env` for `API_URL`, `JWT_SECRET` + `Dockerfile` for FE/BE <br> 9. Test production build <br> 10. Update README with Auth + WebSocket info | Node.js, JWT, Socket.io, Docker, React | **Deliverable:**<br>Target: Secure, multi-user, real-time, deployable LogGuard |
| **Day 8** | **Live Dashboard + Tailwind UI** | 1. Fixed Tailwind CSS setup with Vite + PostCSS <br> 2. Built dark theme dashboard: Header, 3 Stat Cards, Upload Box, Live Log Table <br> 3. Integrated Socket.io-client to receive logs in real-time <br> 4. Implemented color-coded logs: ERROR=Red, WARN=Yellow, INFO=Blue <br> 5. Added "ROOT CAUSE" badge and red border for anomaly logs <br> 6. Updated stats cards to react to live incoming logs <br> 7. Tested E2E: Backend emits → Frontend renders instantly <br> 8. Updated all 3 README files with current setup | React, Vite, Tailwind CSS, Socket.io, Node.js, Express | **Deliverable:**<br>Fully working live dashboard. Real-time logs streaming with professional dark UI. Ready for Day 9 file upload. |
| **Day 9** | **File Upload + Parse + Display** | 1. Backend: Created /api/upload with Multer to accept .log/.txt files <br> 2. Backend: Parse each line timestamp/LEVEL/message and append to allLogs array <br> 3. Backend: /api/logs returns full log list as JSON <br> 4. Frontend: Built FileUpload.jsx with drag-drop + "Choose File" button <br> 5. Frontend: Used axios to POST file and GET logs <br> 6. Frontend: Connected upload to state → LogList.jsx updates instantly <br> 7. Tested E2E: Upload file → Backend parses → Dashboard shows logs without refresh <br> 8. Fixed bug: Changed allLogs = newLogs to allLogs = [...allLogs, ...newLogs] for appending | Node.js, Express, Multer, React, Axios, Vite, Tailwind | **Deliverable:**<br>Working file upload pipeline. Users can upload logs and see them parsed + displayed in the dashboard. Backend + Frontend fully connected. |
| **Day 10** | **Real-Time Logs + UI Polish** | 1. Backend: Emit newLog event via Socket.io on file upload and test alert <br> 2. Frontend: Integrated socket.io-client to listen for live logs and prepend to table <br> 3. UI: Designed attractive LogTable with color badges, icons, hover effects, and row highlighting <br> 4. Added filter buttons: ALL, INFO, WARNING, ERROR, CRITICAL with active state <br> 5. Dashboard stats now auto-update on new incoming logs <br> 6. Converted timestamps to relative time format "2s ago" <br> 7. Added auto-scroll to newest log for live streaming feel <br> 8. Fixed CORS and 404 issues for /api/upload route | React, Vite, Tailwind CSS, Socket.io, Lucide-react, Node.js, Express | **Deliverable:**<br>Fully live dashboard like Datadog. Logs stream instantly. Professional UI with filters and real-time stats. Ready for Day 11 AI Anomaly Detection. |
| **Day 11** | **Persistence + Analytics Fix ✅** | 1. Save uploaded logs to `logs.json`<br>2. Created `/api/logs/latest` to read from file<br>3. Fixed "No Log Data" bug in Analytics<br>4. Added 4-color pie chart for log levels<br>5. Data persists across tab switches | Node.js, Express, React, Chart.js | **Deliverable:**<br>Upload → Save → View Analytics. Data persists |
| **Day 12** | **Anomaly Detection + Alerts System** | 1. Backend: Created `alerts.json` to store anomalies<br>2. Backend: Added `detectAnomalies()` function to detect `ERROR`, `CRITICAL`, `FATAL`, `FAILED` keywords<br>3. Backend: Updated `/api/upload` route to trigger detection and save alerts<br>4. Backend: Created `/api/alerts` `GET` route to fetch all alerts,<br>5. Frontend: Created `Alerts.jsx` component to display alerts<br>6. Frontend: Added "Alerts" tab in navbar<br>7. Frontend: Updated Dashboard cards to show CRITICAL and ERROR counts<br>8. Testing: Uploaded log with CRITICAL and verified email alerts | Node.js, Express, React, Vite, JavaScript, JSON | **Deliverable:**<br>1. System can now detect anomalies automatically<br>2. Alerts tab shows severity, timestamp, and message<br>3. Dashboard reflectd real-time error counts<br>4. Backend API `/api/alerts` working and returns JSON |
| **Day 13** | **Real-time Alerts, toast notifications, alarm sound, and live updating dashboard** | 1. Integrated WebSocket for live anomaly push from backend to frontend<br>2. Added Toast notifications for ERROR/CRITICAL logs<br>3. Implemented Alarm sound for CRITICAL/FATAL alerts<br>4. Created GET /api/alerts API and live updating Alerts tab<br>5. Dashboard metrics update in real-time without refresh |React, Node.js, Socket.io, Tailwind CSS | **Deliverable:**<br>Real-time monitoring working. Alerts shown on UI with sound + toast. |
| **Day 14** | **Alert Management & Acknowledge Feature to alarms and Mark CRITICAL/FATAL alerts** | 1. Added "Acknowledge" button for each CRITICAL/Fatal alerts<br>2. Created POST /api/alerts/acknowledge API to stop alarm and mark alert as handled<br>3. Prevented repeated notifications for same acknowledged alert<br>4. Updated Alerts tab to show acknowledged status with timestamp<br>5. Improved and UX- users can now silence alarms after review | React, Node.js, Express, Socket.io, Tailwind CSS |  **Deliverable:**<br>Alert workflow complete. Users can acknowledge alerts and stop alarm sound. |
| **Day 15** | **Automated Email Notifications using Nodemailer to notify admins of CRITICAL/FATAL anomalies** | 1. Integrated Nodemailer to send email alerts for CRITICAL/FATAL anomalies<br>2. Email triggers automatically on log upload when severity is High<br>3. Email includes severity, timestamp, and exact log message<br>4. Tested email delivery with demo log containing "Server crash"<br>5. End-to-end alerting complete: UI toast + Alarm + Email | Node.js, Express, Nodemailer, React, Socket.io |  **Deliverable:**<br>Automated email alerts working. Admins notified even when not on dashboard. |
| **Day 16** | **Auth + Alerts Without DB ✅** | 1. Replaced MongoDB with dummy user + JWT auth<br>2. Created `auth.js` middleware for token verification<br>3. Added Axios interceptor to send token from frontend<br>4. Implemented in-memory alerts store with GET + Acknowledge API<br>5. Updated Upload route to push sample alerts<br>6. Connected Dashboard + Alerts UI to live data<br>7. Enabled CORS and fixed 500/401 errors | Node.js, Express, Reat, Axios, JWT, bcryptjs, CORS | **Deliverable:**<br>Full flow working: Register → Login → Upload → Alerts → Acknowledge. No DB required for demo |
| **Day 17** | **Real Log Parsing + Email Alerts + Lowdb Persistence** | 1. Set up `nodemailer` and created `emailService.js` to send alerts<br>2. Connected email alerts to `upload.js` → trigger emails for `ERROR` and `CRITICAL` logs<br>3. Implemented real `.log` file parsing and verified parsing works correctly<br>4. Verified Lowdb persistence → logs saved to `logs.json`, users saved to `users.json`<br>5. Debugged parser issues where it returned `Array(0)` / empty results<br>6. Tested end-to-end flow: Register → Login → Upload Log → Dashboard + Analytics + Alerts + Emails | Node.js, Express, Multer, Lowdb, Nodemailer, JavaScript | **Deliverable:**<br>Real log upload with parsing, database persistence, and automated email alerts for critical errors working |
| **Day 18** | **Analytics Tab Update + Daily Summary** | 1. Integrated `node-cron` job for daily summary email at 9 AM IST<br>2. Added severity levels to alerts and limited instant emails to ERROR/CRITICAL only<br>3. Updated Analytics tab with daily summary stats: total logs, ERROR/CRITICAL counts, top 3 errors<br>4. Added charts: logs severity distribution pie chart + response time line graph<br> 5. Created Alerts History section in Analytics with timestamp, severity, and message<br> 6. Added Settings controls in Analytics: "Enable Daily Summary" toggle + "Preferred summary time"<br>7. Tested summary email content and cron timing test logs | React, VIte, Node.js, Express, node-cron, Chart.js | **Deliverable:**<br>Analytics tab now central hub for summaries, visualizations, and alert history + automated daily email reports |
| **Day 19** | **Real-Time Dashboard Updates with Socket.IO** | 1. Initialized Socket.IO server in `server.js` and exported `io` instance<br>2. Emitted `new_log` event from `upload.js` after DB write<br>3. Created `socket.js` client service<br>4. Added `socket.on('new_log')` listener in `App.js` to auto refetch logs + analytics<br>5. Tested live KPI, Pie, and Trend chart updates | Node.js, Express, Socket.IO, React, Vite | **Deliverable:**<br>Dashboard now updates KPI cards and all charts instantly within 1 second of new log upload. No manual refresh required. |
| **Day 20** | **Real-Time Alerts + Email Notifications** | 1. Socket.IO integration for live alerts <br> 2. Instant email on CRITICAL logs <br> 3. Threshold alert for failed logins <br> 4. Daily 9PM IST summary email cron <br> 5. AlertToast UI for real-time popups | Node.js, Express, Socket.IO, Nodemailer, node-cron, React, Tailwind | **Deliverable:**<br>Live dashboard toasts + Email sent to suchitrakamalakodali@gmail.com + Daily summary report |
| **Day 21** | **User Roles + Admin Panel** | 1. Added role field + lastLogin to User model<br>2. Created authMiddleware + adminMiddleware<br>3. Built /api/users GET, PUT, DELETE routes<br>4. Built AdminUsersTable UI with role dropdown<br>5. Fixed Invalid Date bug + scoped APIs by role | Node.js, Express, MongoDB, Mongoose, React, JWT, TailwindCSS | **Deliverable:**<br>Admin can view/manage all users. Role-based access enforced. Last login tracked. |
| **Day 22** | **File Upload + Log Ingestion** | 1. Integrated multer for .log/.txt/.json uploads<br>2. Built log parser to extract timestamp, level, message, source<br>3. Created LogUploader.jsx with drag-drop + file validation<br>4. Bulk insert parsed logs to MongoDB<br>5. Auto-refresh Analytics after upload + E2E test | Node.js, Express, Multer, MongoDB, Mongoose, React, TailwindCSS, Axios | **Deliverable:**<br>Bulk log ingestion live. Uploaded logs reflect in KPI, Pie, and Trend charts instantly. |

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