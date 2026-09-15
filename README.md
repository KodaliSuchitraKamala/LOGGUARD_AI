# LogGuard AI - Intelligent Log Analysis & Monitoring Platform

**🚀 LIVE Project:** https://logguardai.vercel.app

**📦 MERN Backend API:** https://logguard-mern-api.vercel.app/api

**☕ Java Backend API:** https://logguard-backend.onrender.com/api

**💻 GitHub:** https://github.com/KodaliSuchitraKamala/LOGGUARD_AI

## Abstract
LogGuard AI is a full-stack hybrid (MERN + Java Spring Boot) platform to upload, parse, filter, visualize logs in real-time with AI Root Cause Analysis (92% confidence), real-time Socket.IO alerts, and automated email notifications. 100% LIVE as of Day 46 (12 Sep 2026).

## Architecture - Hybrid LIVE
```
            Frontend (Vercel) https://logguardai.vercel.app
                            ↓ Axios + Socket.IO
    MERN Backend (Vercel) https://logguard-mern-api.vercel.app/api 
    - Auth, Upload, Analytics, AI Fallback, Alerts, Notifications
                            ↓ REST + Fallback
 Java Backend (Render Docker) https://logguard-backend.onrender.com/api 
                - Log Parsing, Stats, AI Analysis, Email
                            ↓
    MongoDB Atlas (4 collections: logs, users, alerts, notifications)
```


## Tech Stack
Frontend: React 18 + Vite + Tailwind + Recharts + Axios + Socket.io-client
Backend-MERN: Node.js + Express + Mongoose + Multer + JWT + Nodemailer + node-cron + Socket.IO + Vercel
Backend-Java: Java 21 + Spring Boot 3.5.0 + Spring Security + MongoDB Atlas + Spring Mail + Maven + Render Docker

## Features - 100% Working Day 46 LIVE
- [x] Upload: Drag & Drop.log/.txt - Verified 20 logs toast at https://logguardai.vercel.app
- [x] Dashboard: Critical 9, Errors 2, Warnings 3, Total 20, Health 13%, 30s auto-refresh Pause/Refresh Now - GET /api/stats
- [x] Live Log Stream: 20 logs, TIME LEVEL MESSAGE, Color-coded, ALL LEVELS filter - GET https://logguard-mern-api.vercel.app/api/logs/latest
- [x] AI Insight: Root Cause DB Connection Lost, Fix Restart DB pool, Confidence 92% - POST https://logguard-mern-api.vercel.app/api/ai/analyze (Fallback to https://logguard-backend.onrender.com/api/ai/analyze)
- [x] Analytics: Total Logs, Error Trend 7 Days, Response Time, Level Pie - GET /api/analytics
- [x] Alerts: 11 unread, Acknowledge, Toast + Alarm.mp3 - GET /api/alerts
- [x] Notifications: Bell, unread badge 10s polling, mark-all-read - GET /api/notifications
- [x] Email: Instant CRITICAL + Daily 9PM IST cron via Nodemailer
- [x] RBAC + Admin Panel: Role dropdown, delete, per-user stats
- [x] JWT Auth + Socket.IO + CORS Fixed for 3 LIVE domains

## Folder Structure
```
LOGGUARD_AI/
├── .vercel/
│ ├── project.json
│ ├── README.txt
├── Backend-Java/
│ ├── mvn/wrapper/
│ │ ├── maven-wrapper.properties
│ ├── src/main/
│ │ ├── java/com/logguard/
│ │ │ ├── config/
│ │ │ │ ├── CorsConfig.java
│ │ │ │ ├── RateLimitFilter.java
│ │ │ │ ├── SecurityConfig.java
│ │ │ │ ├── SecurityHeaderFilter.java
│ │ │ │ ├── WebConfig.java
│ │ │ ├── controller/
│ │ │ │ ├── AiController.java
│ │ │ │ ├── AlertController.java
│ │ │ │ ├── AuthController.java
│ │ │ │ ├── LogController.java
│ │ │ │ ├── NotificationController.java
│ │ │ │ ├── UserController.java
│ │ │ ├── model/
│ │ │ │ ├── Alert.java
│ │ │ │ ├── Log.java
│ │ │ │ ├── Notification.java
│ │ │ │ ├── User.java
│ │ │ ├── repository/mongo/
│ │ │ │ ├── AlertMongoRepository.java
│ │ │ │ ├── LogRepository.java
│ │ │ │ ├── NotificationRepository.java
│ │ │ │ ├── UserRepository.java
│ │ │ ├── service/
│ │ │ │ ├── AiService.java
│ │ │ │ ├── AlertService.java
│ │ │ │ ├── EmailService.java
│ │ │ │ ├── LogParserService.java
│ │ │ │ ├── NotificationCleanupService.java
│ │ │ ├── LogguardApplication.java
│ │ ├── resources/
│ │ │ ├── application.properties
│ ├── target/
│ │ ├── classes/
│ │ │ ├── com/logguard/
│ │ │ │ ├── config/
│ │ │ │ │ ├── CorsConfig.class
│ │ │ │ │ ├── RateLimitFilter.class
│ │ │ │ │ ├── SecurityConfig.class
│ │ │ │ │ ├── SecurityHeaderFilter.class
│ │ │ │ │ ├── WebConfig.class
│ │ │ │ ├── controller/
│ │ │ │ │ ├── AiController.class
│ │ │ │ │ ├── AlertController.class
│ │ │ │ │ ├── AuthController.class
│ │ │ │ │ ├── LogController.class
│ │ │ │ │ ├── NotificationController.class
│ │ │ │ │ ├── UserController.class
│ │ │ │ ├── model/
│ │ │ │ │ ├── Alert.class
│ │ │ │ │ ├── Log.class
│ │ │ │ │ ├── Notification.class
│ │ │ │ │ ├── User.class
│ │ │ │ ├── respository/mongo/
│ │ │ │ │ ├── AlertMongoRepository.class
│ │ │ │ │ ├── LogRepository.class
│ │ │ │ │ ├── NotificationRepository.class
│ │ │ │ │ ├── UserRepository.class
│ │ │ │ ├── service/
│ │ │ │ │ ├── AiService.class
│ │ │ │ │ ├── AlertService.class
│ │ │ │ │ ├── EmailService.class
│ │ │ │ │ ├── LogParserService.class
│ │ │ │ │ ├── NotificationCleanupService.class
│ │ │ │ ├── LogguardApplication.class
│ │ │ ├── application.properties
│ │ ├── generated-sources/annotations
│ │ ├── maven-status/maven-compiler-plugin/compile/default-compile/
│ │ │ ├── createdFiles.lst
│ │ │ ├── inputFiles.lst
│ ├── .env
│ ├── .gitattributes
│ ├── .gitignore
│ ├── Dockerfile
│ ├── HELP.md
│ ├── mvnw
│ ├── mvnw.cmd
│ ├── pom.xml
│ └── README.md
├── Backend-MERN/
│ ├── .vercel/
│ │ ├── project.json
│ │ ├── README.txt
│ ├── api/
│ │ ├── index.js
│ ├── apimiddleware/
│ ├── apimodels/
│ ├── apiroutes/
│ ├── apisesrvices/
│ ├── middleware/
│ │ ├── adminMiddleware.js
│ │ ├── auth.js
│ │ ├── authMiddleware.js
│ │ ├── roleCheck.js
│ │ ├── roleMiddleware.js
│ ├── models/
│ │ ├── Alerts.js
│ │ ├── Log.js
│ │ ├── Notification.js
│ │ ├── User.js
│ ├── node_modules/
│ ├── routes/
│ │ ├── aiAnalysis.js
│ │ ├── alerts.js
│ │ ├── analytics.js
│ │ ├── auth.js
│ │ ├── logRoutes.js
│ │ ├── logs.js
│ │ ├── notification.js
│ │ ├── upload.js
│ │ ├── users.js
│ ├── services/
│ │ ├── aiService.js
│ │ ├── alertService.js
│ ├── uploads/ # Temp files from multer
│ ├── utils/
│ │ ├── logParser.js
│ ├── .env
│ ├── db.js
│ ├── emailService.js
│ ├── Dockerfile
│ ├── package.json
│ ├── package-lock.json
│ ├── README.md
│ ├── vercel.json
│ ├── server-minimal.js
│ └── server.js # Express API + Anomaly Detection
├── Frontend/
│ ├── .vercel/
│ │ ├── project.json
│ │ ├── README.txt
│ ├── dist/
│ │ ├── assets/
| │ | ├── index-DufBVQMF.css
| │ | ├── index-eYx7h8pX.js
│ │ ├── alarm.mp3
│ │ ├── index.html
│ ├── node_modules/
│ ├── public/
│ │ ├── alarm.mp3
│ ├── src/
│ │ ├── components/
| │ | ├── admin/
| | │ | ├── AdminStats.jsx
| │ | ├── AdminUsersTable.jsx
| │ | ├── AdvancedLogSearch.jsx
| │ | ├── AIInsightCard.jsx
| │ | ├── Alerts.jsx # Alerts dashoboard
| │ | ├── AlertsToast.jsx
│ │ │ ├── Analytics.jsx # Analytics dashboard with charts
| │ | ├── AuthContext.jsx
│ │ │ ├── Dashboard.jsx # Health cards + Test Alert button
| │ | ├── EmptyState.jsx
| │ | ├── ErrorTrenChart.jsx
│ │ │ ├── FileUpload.jsx # Drag & Drop log upload
| │ | ├── Login.jsx
| │ | ├── LogLevelPie.jsx
| │ | ├── LogList.jsx
│ │ │ ├── LogTable.jsx # Filterable log table
| │ | ├── Navbar.jsx
| │ | ├── NotificationBell.jsx
│ │ │ ├── ResponseTimeChart.jsx# Bar chart: Avg response time
| │ | ├── SocketContext.jsx
│ │ │ └── Upload.jsx 
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
│ ├──.oxlintrc.json
│ ├── Dockerfile
│ ├── index.html
│ ├── nginx.conf
│ ├── package.json
│ ├── package-lock.json
│ ├── postcss.config.js
│ ├── README.md
│ ├── tailwind.config.js
│ └── vite.config.js
├── render/
│ ├── CHANGELOG.md
│ ├── LICENSE
│ ├── README.md
│ └── render.exe
├── .env
├── .gitignore
├── docker-compose.yml
├── package.json
├── file.log
├── start.sh
├── vercel.json
├── LICENSE
├── render.exe
├── render.yaml
├── render.zip
├── README.md
├── sample.log
└── test.log 
```

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
| **Day 23** | **Live Analytics, Alerts & Email Notifications** | 1. Fixed Analytics API to return real 7-day Error Trend + Response Time data<br>2. Added Live Auto-Refresh every 5s for Dashboard, Analytics, Alerts<br>3. Implemented CRITICAL Alert creation in MongoDB on log upload<br>4. Added Real-time Socket alerts + Sound notification<br>5. Integrated Email alerts for CRITICAL logs using Nodemailer | Node.js, Express, MongoDB, Mongoose, Socket.io, React, TailwindCSS, Recharts, Nodemailer, react-hot-toast | **Deliverable:**<br>Fully working LogGuard AI Dashboard with live updating cards, charts, alerts tab, and email notifications. All components sync in real-time. |
| **Day 24** | **Advanced Search + Filter + Export CSV + Dark UI** | 1. Built global search with debounce<br>2. Added multi-column filters + date range<br>3. Implemented CSV export with PapaParse<br>4. Integrated dark/light theme toggle with persistence | React, Tailwind, Shadcn UI, PapaParse, Zustand | **Deliverable:**<br>Users can search/filter data, export reports to CSV, and switch to dark mode|
| **Day 25** | **Instant File Upload + Auto Cleanup** | 1. Built /api/upload route with Multer for .log file upload<br>2. Parsed logs and bulk inserted into MongoDB<br>3. Created CRITICAL alerts and triggered socket events<br>4. Moved email + stats aggregation to background to prevent UI hang<br>5. Added auto-delete of temp files from uploads/ folder<br>6. Normalized log levels for dashboard consistency | Node.js, Express, Multer, MongoDB, Socket.io, Nodemailer, React, Axios | **Deliverable:**<br>Uploaded files are processed instantly. Uploading... clears in <1s. Temp files auto-delete. Logs & alerts reflect in dashboard. Emails sent in background for CRITICAL logs. |
| **Day 26** | **RBAC + Admin Panel + User Management + Stats Bug Fix** | 1. Updated authMiddleware.js with protect, admin, authorize(...roles) middlewares<br>2. Added role field in User.js model with enum ['user','admin']<br>3. Built GET /api/users admin-only API with per-user stats aggregation<br>4. Fixed stats 0-count bug by using regex /WARN/i for WARN/WARNING levels<br>5. Added orphan logs fallback logic for logs without userId and mongosh migration fix<br>6. Created PUT /api/users/:id/role API for role update<br>7. Created DELETE /api/users/:id API with self-delete check and cascade log deletion<br>8. Fixed upload.js to save userId: req.user._id for every log and emit socket events<br>9. Built AdminUsersTable.jsx with email, role dropdown, total logs, critical count, delete button<br>10. Added conditional Admin Panel tab in App.jsx and live socket updates for dashboard counts | Node.js, Express, MongoDB, Mongoose, JWT, Socket.io, React, Axios, Tailwind CSS | **Deliverable:**<br>RBAC working, Admin Panel shows Total Logs: 3 Critical: 1 matching Dashboard, Role management and user deletion functional, Analytics filtering by role implemented |
| **Day 27** | **Analytics Dashboard + Health Monitoring | 1. Build new backend API GET /api/analytics with role-based filter and parallel counts<br>2. Fix level regex to /^WARN/i, /^ERROR$/i, /^CRITICAL$/i for correct distribution<br>3. Implement Health formula: 100 - (critical_10 + error_5 + warn*2) = 83%<br>4. Create 7-day aggregation pipeline for Error Trend with $dateToString grouping<br>5. Install recharts and create Analytics.jsx with KPI cards: Total Logs 3, Errors 2, Avg 87ms, Health 83%<br>6. Build Error Trend - 7 Days line chart (0 from 08-14 to 08-19, spike to 2 on 08-20)<br>7. Build Response Time Trend line chart (50ms to 200ms peak)<br>8. Build Log Level Distribution Pie Chart with colors - WARN:1, ERROR:1, CRITICAL:1, INFO:0<br>9. Integrate Analytics tab in App.jsx and test live at localhost:5173 | Node.js, Express, MongoDB Aggregation, Mongoose countDocuments, Recharts (LineChart, PieChart, ResponsiveContainer), Socket.io, React, Tailwind CSS | **Deliverable:**<br>Analytics Overview fully live at localhost:5173 with live KPI cards matching backend, both trend charts rendering correctly, pie distribution accurate, dark UI consistent |
| **Day 28** | **Real-time Notification System & Navbar UI Fix** | 1. Created Notification model<br>2. Auto-create Notification on CRITICAL/ERROR logs<br>3. Emitted newNotification via Socket.io<br>4. Built NotificationBell with unread badge & dropdown<br>5. Created Notifications page with filter, mark-all-read, delete<br>6. Fixed App.jsx routing to pages/Notifications.jsx<br>7. Centered Navbar links using left-1/2 -translate-x-1/2 | Node.js, Express, MongoDB, Socket.io, React, Tailwind CSS, Nodemailer | **Deliverable:**<br>Live notification bell with real-time count, full notification center page, email alerts, centered navbar UI |
| **Day 29** | **Critical Bug Fixes, Email Alert System & UI Enhancement** | 1. Fixed 404 /api/upload error by reordering routes in server.js<br>2. Fixed Multer Unexpected field error using upload.any()<br>3. Implemented Instant Email Alert on critical log upload<br>4. Configured Nodemailer with Gmail App Password and added transporter verification<br>5. Created Daily Cron job (9 PM IST) for critical alerts summary<br>6. Redesigned Live Log Stream table with color-coded badges and premium UI<br>7. Fixed React AlertToast key prop warning and Invalid Date issue<br>8. Tested end-to-end flow: Upload → DB → Socket → Alert → Email | React, Node.js, Express, Multer, Socket.IO, MongoDB, Nodemailer, Node-cron, Tailwind CSS | **Deliverable:**<br>Achieved 100% working upload with instant critical email alerts, premium log table UI, and zero console errors for a production-ready LogGuard system. |
| **Da 30** | **Final Integration & Notification System** | 1. Fixed upload.js to detect CRITICAL/ERROR logs and save to notifications collection<br>2. Created Notification.js model with message, level, type, isRead, timestamp<br>3. Updated alertService.js to save to both Alert and Notification collections<br>4. Implemented 3-level fallback in notification.js route: notifications -> alerts -> logs<br>5. Resolved route conflict - kept only notification.js (singular) and removed notifications.js (plural)<br>6. Connected Socket.IO emits (newNotification, new_log) for real-time bell updates<br>7. Added read-all API to update isRead: true in MongoDB<br>8. Verified data in MongoDB Atlas - test > notifications now shows documents<br>9. Tested end-to-end: Upload -> MongoDB -> Dashboard counts -> Bell -> Mark all read | Node.js, Express, MongoDB Atlas, Mongoose, Socket.IO, Multer, JWT Auth | **Deliverable:**<br>Notifications collection populating in Atlas, Bell icon shows unread count, Mark all read updates DB, Email + Dashboard + Live Log Stream all working in production |
| **Day 31** | **Final Auth & Pre-Java Validation** | 1. Tested complete Register -> Login flow with JWT<br>2. Validated Upload -> AI Analysis -> Email ALert flow<br>3. Fixed CORS & token expiry bugs<br>4. Captured dashboard & AI root cause (94% confidence)<br>5. Prepared project for Spring Boot migration | Node.js, Express, JWT, React, Postman, Nodemailer | **Deliverable:**<br>Stable MERN buld ready, Project ready for Full Stack Java (Spring Boot) conversion |
| **Day 32** | **LogGuard AI - Analytics & Health Fix** | 1. Fixed Map.of() limit compilation error (12 entries > 10 limit) using HashMap<br>2. Fixed NaN% Health bug by returning health as int 100 not String 100%<br>3. Fixed Analytics API to return totalLogs, criticals, avgResponseTime, levelDistribution, errorTrend, responseTrend<br>4. Fixed Frontend Analytics.jsx NaN parsing with Number() & parseInt(String().replace('%',''))<br>5. Verified Analytics Dashboard: Total Logs 21, Errors 11, Avg 125ms, Health 100%, Charts & Pie working | Backend-Java (Spring Boot 3.5.0, Java 21), MongoDB Atlas, React + Recharts, Maven | **Deliverable:**<br>Analytics page 100% working, BUILD SUCCESS, all charts rendering, Day 32 Completed |
| **Day 33** | **Critical Email Alert System** | 1. Fixed duplicate dependencies in pom.xml (spring-boot-starter-mail, spring-dotenv)<br>2. Fixed Lombok compilation error in User.java by using manual getters/setters<br>3. Resolved ambiguous mapping error for /api/auth/me endpoint<br>4. Implemented EmailService & AlertService for CRITICAL log detection<br>5. Configured Gmail SMTP with App Password & dotenv<br>6. Tested upload -> 5 critical logs detected, email alerts sent & verified in Gmail | Java, Spring Boot, Spring Mail, Maven, MongoDB Atlas, Gmail SMTP, dotenv | **Deliverable:**<br>Spring Boot backend stable on :8080, Critical alert email system 100% working, Deliverable: Automated email with Level, Message, Time sent to admin |
| **Day 34** | **Notification & Admin Module Migration to Java + Frontend Dual Compatibility** | 1. Fixed LogController ambiguous mapping - removed duplicate /api/notifications endpoint<br>2. Migrated Notification model to Java - changed from empty list to per-CRITICAL-log creation<br>3. Updated LogService to generate notification on each CRITICAL log with format 🚨 CRITICAL: message<br>4. Implemented NotificationController - GET /api/notifications, PUT /api/notifications/read-all, PUT /api/notifications/mark-all-read<br>5. Created UserController.java - GET /api/users, PUT /api/users/:id/role, DELETE /api/users/:id for Admin Panel<br>6. Made frontend dual-compatible - updated api.js to auto-detect MERN (5000) vs JAVA (8080) and call /logs vs /logs/search<br>7. Fixed AdminUserTable.jsx to use unified API service with .env switch VITE_API_URL<br>8. Fixed NotificationBell.jsx polling (10s) and unread badge for Java backend<br>9. Fixed Alerts.jsx polling and acknowledge flow for Java backend<br>10. Tested E2E with .env switching - upload logs on localhost:5173 and verified bell, alerts, admin tabs on both backends | Spring Boot, React, MongoDB Atlas, REST API, Vite Env | **Deliverable:**<br>Java Notification system working, User management API functional, Frontend works on both MERN & Java backends | 
| **Day 35** | **Alerting & Notification Module + Security Hardening** | 1. Fixed SecurityConfig.java (CORS, CSRF disable, permitAll) for 403 Forbidden<br>2. Fixed path collision: Renamed LogController /api/alerts to /api/alerts-legacy to resolve Whitelabel 404<br>3. Created Alert model & AlertMongoRepository with findByResolvedFalseOrderByTimestampDesc()<br>4. Implemented AlertService.checkAndAlert() for auto-creation of CRITICAL/ERROR alerts to Atlas<br>5. Built 3 endpoints: GET /api/alerts/test, GET /api/alerts/active, PUT /api/alerts/{id}/resolve<br>6. Verified ALERT SAVED TO ATLAS logs and alerts collection in MongoDB Atlas<br>7. Verified browser JSON output and LogGuard AI dashboard integration (11 critical, 98% health) | Spring Boot, Spring Security, MongoDB Atlas, REST API | **Deliverable:**<br>Active alerts API working, Auto-alert generation functional, Resolve feature working, Verified in browser, terminal & Atlas dashboard |
| **Day 36** | **Dashboard Stats API & E2E Analytics Integration** | 1. Added countByLevel(), findTop20ByOrderByTimestampDesc() in LogRepository.java<br>2. Fixed double-save bug in LogParserService.java and optimized level detection (CRITICAL/ERROR/WARN)<br>3. Created new endpoints /api/stats, /api/logs/stats, /api/dashboard/stats returning { criticals, errors, warnings, totalLogs, health } matching DashBoard.jsx props<br>4. Implemented pagination /api/logs?page&size and search filter /api/logs/search?level<br>5. Fixed /alerts-egacy typo to /alerts-legacy and retained upload/analyze/notifications flow<br>6. Verified E2E on localhost:5173 showing 11 Critical, 23 Errors, 15 Warnings, 98% Health, 120 Total Logs and on 8080/api/analytics & /debug/mongo with Atlas DB proof | React, Spring Boot 3, MongoDB Atlas, MongoTemplate, REST APIs | **Deliverable:**<br>Java backend without frontend change, /api/stats returns exact props needed for DashBoard.jsx, Pagination & search working, 120 logs uploaded & counted correctly, No CORS/403 errors |
| **Day 37** | **Dashboard Final Verification & Live Stream Fix** | 1. Fixed /api/logs/latest 404 error by adding findTop20ByOrderByTimestampDesc() in LogRepository<br>2. Added getLatestLogs() endpoint in LogController<br>3. Rebuilt backend with mvn clean compile and restarted server<br>4. Verified dashboard at localhost:5173 showing 21 Critical, 11 Errors, 5 Warnings, 47% Health<br>5. Confirmed Live Log Stream renders 20 logs with badges and 4 columns<br>6. Validated Drag & Drop upload, ALL LEVELS filter, Admin Panel | Spring Boot, MongoDB Atlas, React.js, REST API | **Deliverable:**<br>Dashboard fully functional, Live Stream fixed, Final output |
| **Day 38** | **Backend API Verification & Dashboard Fix** | 1. Fixed and verified /api/stats, /api/dashboard/stats, /api/logs/stats returning 11 Critical, 98% Health, 120 totalLogs<br>2. Fixed /api/logs/latest 404 error for Live Log Stream with Top 20 logs (TIME, LEVEL, MESSAGE)<br>3. Tested /api/logs/search?level filter for ALL LEVELS dropdown, fixed WARN/WARNING bug<br>4. Validated /api/debug/mongo showing Atlas DB logguard with 4 collections and 120 logs<br>5. Verified auto-alert system with terminal log ALERT SAVED TO ATLAS | Spring Boot, MongoDB Atlas, React, REST API, Postman | **Deliverable:**<br>Backend APIs verified, Live Log Stream functional, Atlas sync confirmed with 11 Critical target achieved |
| **Day 39** | **Dashboard API** | 1. Created DashboardStatsDTO, RecentLogsDTO, AlertSummaryDTO<br>2. Built GET /api/dashboard/stats endpoints<br>3. Built GET /api/dashboard/recent-logs endpoints<br>4. Built GET /api/dashboard/chart-data?days=7 with aggregation<br>5. Built GET /api/dashboard/alerts-summary endpoint<br>6. Added MongoDB indexing on timestamp & level<br>7. Secured APIs with JWT + @PreAuthorize | Spring Boot, MongoDB Aggregation (MongoTemplate), Spring Security, JWT, DTO Pattern | **Deliverable:**<br>Dashboard APIs fully working, Stats & chart data returning correctly, Frontend Integrated |
| **Day 40** | **LogGuard AI Dashboard Fix & Final Testing** | 1. Fixed Whitelabel Method Not Allowed for /api/logs/clear (added GET + DELETE)<br>2. Fixed /api/logs/analyze endpoint (added GET + POST)<br>3. Cleared 49 old logs from database<br>4. Re-uploaded clean dataset (4 logs, 1 critical, 1 error)<br>5. Verified Live Log Stream, health cards, and AI Analysis button | Spring Boot, React, REST API, H2 DB | **Deliverable:**<br>98% system health achieved, dashboard fully functional, ready for final demo |
| **Day 41** | **LogGuard AI Dashboard Integration & Testing** | 1. Upload log file via drag & drop and file chooser<br>2. Live Log Stream with search, level filter & sort<br>3. Stats cards - Errors, Warnings, Info & Health 98%<br>4. AI Root Cause Analysis with Insight & Recommendation<br>5. Real-Time Alerts panel<br>6. Admin User Management panel | React, Vite, FastAPI, MongoDB, AI Module | **Deliverable:**<br>Core dashboard fully functional on localhost:5173 - Verified, 90% project done |
| **Day 42** | **Log Analytics, Alerts & Notifications Fix** | 1. Fixed log file upload for 4 logs with level detection<br>2. Fixed Analytics Dashboard (Error Over Time, Response Time, Level Distribution charts)<br>3. Implemented Real-time Alerts for CRITICAL logs<br>4. Fixed notification bell with unread count and mark-as-read<br>5. Verified Email Alert service with Gmail SMTP proof<br>6. Validated Admin Panel and Live Log Stream filters | React, Recharts, Spring Boot, MongoDB, Gmail SMTP, Render/Vercel (Local) | **Deliverable:**<br>Analytics charts working, Notifications working, Email alerts received |
| **Day 43** | **Full Stack Hybrid Deployment - Frontend + MERN + Java Docker** | 1. Deployed Backend-Java Docker to Railway & verified /api/health LIVE<br>2. Deployed Backend-MERN API to Vercel<br>3. Deployed Frontend on Vercel + Localhost:5173<br>4. Fixed WebSocket 404 (wss) error with dummy socket fallback<br>5. Implemented Hybrid Mode: REST polling to Java API for logs/analytics<br>6. Verified Dashboard data flow (Critical 11, Errors 5, Health 55%) | Java Spring Boot, Docker, Railway CLI, Node.js/Express, MongoDB Atlas, React+Vite, Vercel, Socket.IO (fallback), REST API | **Deliverable:**<br>Hybrid Architecture LIVE - 3 Services Running, Clean Console (Zero Errors), Dashboard with Real-time Logs & Drag & Drop Upload Working |
| **Day 44** | **LogGuard AI - Dashboard Live Features & AI Integration** | 1. Implement 30s auto-refresh polling with Pause / Refresh Now controls<br>2. Integrate AI Root Cause Analysis button + insight card after file upload<br>3. Wire Dashboard stats (Critical / Errors / Warnings / Health) to live backend data<br>4. Build Live Log Stream table with level filters and real-time socket updates<br>5. Test Drag & Drop upload -> AI Analysis -> Live Stream end-to-end flow | MERN Stack, Java (Spring Boot), React, Socket.IO, REST APIs | **Deliverable:**<br>Live Dashboard with Auto-Refresh, Real-time Log Stream, and AI Root Cause Analysis Feature |
| **Day 45** | **Final Integration & Alerts Bug Fix - End-to-End Verification** | 1. Fixed Alerts.jsx blank issue by passing logs prop from App.jsx and filtering CRITICAL/ERROR logs<br>2. Added fallback logic for empty /api/alerts API to prevent blank screen<br>3. Verified file upload flow with success toast and dashboard stats update<br>4. Tested Dashboard cards: Total Logs, Error Rate, Anomaly %<br>5. Validated Analytics charts: Error Timeline, Response Time Trend, Log Level Pie<br>6. Confirmed Alerts tab showing real-time critical alert cards with Acknowledge feature<br>7. Tested socket live update and auto-refresh 30s flow | React.js, Node.js, Express, MongoDB, Socket.io, Tailwind CSS, Chart.js | **Deliverable:**<br>complete LogGuard AI workflow working on localhost:5173, Day 45 marked as 100% complete and ready for deployment |
| **Day 46** | **LogGuard AI - Production Deployment & Critical Bug Fixing** | 1. Fixed CORS policy error in Backend-MERN/index.js for logguardai.vercel.app<br>2. Fixed totalLogs: 0 bug by adding userId filter in Log model & analytics routes<br>3. Fixed 404 /api/ai/analyze typo (analze → analyze) in server.js<br>4. Implemented Hybrid AI fallback (Java Railway → Node aiService.js) in aiAnalysis.js<br>5. Deployed backend to Vercel production with vercel --prod<br>6. Tested full flow: Upload 20 logs, Dashboard, Live Stream, AI Insight, Alerts | MERN Stack, Java Spring Boot (Railway), Node.js, MongoDB, Vercel, CORS, JWT, AI Root Cause Analysis | **Deliverable:**<br>Live site working at logguardai.vercel.app with Dashboard (Critical 9, Total 20, Health 13%), Live Log Stream (20 logs), AI Insight (DB Connection Lost - 92% confidence), Analytics Graphs & Real-time Alerts |


## Getting Started
```bash
git clone https://github.com/KodaliSuchitraKamala/LOGGUARD_AI.git
# Java
cd Backend-Java &&./mvnw spring-boot:run # :8080 or https://logguard-backend.onrender.com/api
# MERN
cd Backend-MERN && npm install && node server.js # :5000 or https://logguard-mern-api.vercel.app/api
# Frontend
cd Frontend && npm install && echo "VITE_API_URL=https://logguard-mern-api.vercel.app/api" >.env && npm run dev # :5173 or https://logguardai.vercel.app
```

## Advantages
- Centralized log viewing instead of SSH + grep
- Real-time updates and visual trends
- Easy filtering and CSV export for reporting
- Scalable React + Node architecture
- AI-powered anomaly detection, Email/Slack alerts, JSON/Syslog support, Docker deployment

## Disadvantages
- Large file uploads may take time without streaming
- Currently supports text-based logs only
- No bulit-in alerting system yet

## Future Scope
- AI-powered anomaly detection in logs
- Email/Slack alerts for critical ERROR spikes
- Support for JSON, Syslog, and CloudWatch logs
- Role-based access control for teams
- Deploy to AWS/GCP with Docker + CI/CD

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Conclusion
LogGuard AI streamlines log monitoring for developers by combining a fast React frontend with a robust Node backend. With Day 6 integration complete and Day 7 adding auth + real-time, the platform is ready to scale into a production log monitoring tool.