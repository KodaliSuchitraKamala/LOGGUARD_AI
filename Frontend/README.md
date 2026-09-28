# LogGuard AI - Frontend

React + Vite Dashboard - LIVE at https://log-guard-ai.vercel.app

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

**Live:** https://log-guard-ai.vercel.app

## API Integration
| Method | Endpoint | Live URL |
| --- | --- | --- |
| POST | /api/upload | https://logguard-mern-api.vercel.app/api/upload |
| GET | /api/logs/latest | https://logguard-mern-api.vercel.app/api/logs/latest |
| GET | /api/stats | https://logguard-mern-api.vercel.app/api/stats |
| GET | /api/analytics | https://logguard-mern-api.vercel.app/api/analytics |
| POST | /api/ai/analyze | https://logguard-mern-api.vercel.app/api/ai/analyze  |
| GET | /api/health | https://logguard-backend.onrender.com/api/health |
