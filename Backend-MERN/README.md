# LogGuard AI - Backend-MERN (Node.js)

Production Backend on Vercel - Handles Auth, Upload, Analytics, AI Fallback, Alerts, Notifications.

**Live MERN API:** https://logguard-mern-api.vercel.app/api

**Live Java API:** https://logguard-backend.onrender.com/api

**Frontend:** https://logguardai.vercel.app

## Tech Stack
- Node.js + Express + Mongoose + MongoDB Atlas
- Multer, Socket.io, JWT, Nodemailer, node-cron, CORS

## Setup
```bash
cd Backend-MERN
npm install
node server.js
```

**Local:** http://localhost:5000

**Live:** https://logguard-mern-api.vercel.app/api/health

## API Endpoints - Production Verified
- POST /api/upload - Upload file, parse, bulk insert with userId, emit socket new_log
- GET /api/logs?level=ERROR&search=db - User-scoped logs
- GET /api/logs/latest - Latest 20 for Live Stream
- GET /api/analytics - Regex /^WARN/i /^ERROR$/i /^CRITICAL$/i, Health: 100 - (critical_10 + error_5 + warn*2)
- POST /api/ai/analyze - FIXED Day 46 typo analze->analyze, Hybrid Fallback: Try https://logguard-backend.onrender.com/api/ai/analyze -> fallback aiService.js -> Returns DB Connection Lost 92%
- GET /api/alerts, POST /api/alerts/acknowledge
- GET /api/notifications - 3-level fallback
- GET /api/users - Admin only

## CORS Fix
```JS
// api/index.js
app.use(cors({ origin: ["https://logguardai.vercel.app", "https://logguard-backend.onrender.com", "http://localhost:5173"] }))
```

## Folder Structure
```
LOGGUARD_AI/
├── .vercel/
├── Frontend/
├── Backend-Java/
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
│ └── server.js 
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
