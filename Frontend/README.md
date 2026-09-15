# LogGuard AI - Frontend

React + Vite Dashboard - LIVE at https://logguardai.vercel.app

**Backend APIs:**
- MERN: https://logguard-mern-api.vercel.app/api

- Java: https://logguard-backend.onrender.com/api

## Features - 100% LIVE Day 46 (12 Sep 2026)
- Dashboard: Critical 9, Total 20, Health 13%, 30s auto-refresh Pause/Refresh Now
- File Upload: Drag & Drop, Supports.log/.txt, Toast "Uploaded 20 logs", POST https://logguard-mern-api.vercel.app/api/upload
- Live Log Stream: TIME LEVEL MESSAGE, Color-coded, Filter ALL LEVELS, GET /api/logs/latest
- AI Insight Card: Root Cause DB Connection Lost, Fix Restart DB pool, Confidence 92%, POST /api/ai/analyze
- Analytics: KPI, Error Timeline 7 Days, Response Time Trend, Level Distribution Pie (Recharts)
- Alerts: Real-time cards, Acknowledge, Bell 11 unread, Fallback for empty /api/alerts
- Admin Panel: AdminUsersTable role dropdown + delete

## Tech Stack
- React 18 + Vite, Tailwind, Recharts, Axios, Socket.io-client, React-Toastify

## Setup
```bash
cd Frontend
npm install
```

### .env - Production
```ENV
VITE_API_URL_MERN = https://logguard-mern-api.vercel.app/api
VITE_API_URL_JAVA = https://logguard-backend.onrender.com/api
VITE_API_URL = https://logguard-mern-api.vercel.app/api
```

### .env - Local
```ENV
VITE_API_URL_MERN = http://localhost:5000/api
VITE_API_URL_JAVA = http://localhost:8080/api
VITE_API_URL = http://localhost:5000/api
```

## BASH
```bash
npm run dev
```

**App:** http://localhost:5173

**Live:** https://logguardai.vercel.app

## API Integration
| Method | Endpoint | Live URL |
| --- | --- | --- |
| POST | /api/upload | https://logguard-mern-api.vercel.app/api/upload |
| GET | /api/logs/latest | https://logguard-mern-api.vercel.app/api/logs/latest |
| GET | /api/stats | https://logguard-mern-api.vercel.app/api/stats |
| GET | /api/analytics | https://logguard-mern-api.vercel.app/api/analytics |
| POST | /api/ai/analyze | https://logguard-mern-api.vercel.app/api/ai/analyze  |
| GET | /api/health | https://logguard-backend.onrender.com/api/health |


## Folder Sturcture
```
LOGGUARD_AI/
├── .vercel/
├── Backend-Java/
├── Backend-MERN/
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
