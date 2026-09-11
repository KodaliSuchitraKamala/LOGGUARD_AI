# LogGuard AI - Backend

Backend server with MERN for LogGuard AI. Handles log file uploads, parsing, filtering and API endpoints.

--- 

## Tech Stack
- **Node.js + Express**
- **File Upload**: Multer
- **Real-time**: Socket.io
- **CORS** for frontend connection

---

## Setup & Run Locally

1. **Install dependencies**
```bash
npm install
npm install express socket.io cors multer
```

2. **Start Server**
```bash
node server.js
```
Server runs on http://localhost:5000

---

## API Endpoints

1. **Upload Log File**
    POST /api/upload
    - Uploads a log file using FormData
    - Body: file: <logfile.txt>
    - Parses file and emits logs via Socket.io

2. **Get Logs**
    GET /api/logs?level=ERROR&search=keyword
    - Fetch logs with filters
    - Query Params:
        * level: INFO, WARN, ERROR
        * search: keyword to search in log message

3. **Get Stats**
    GET /api/stats
    - Returns {criticalErrors, avgResponseTime, systemHealth}

4. **Clone the repository**
```bash
git clone https://github.com/KodaliSuchitraKamala/LOGGUARD_AI.git
cd LOGGUARD_AI/Backend-MERN
```

---

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
│ └── server.js # Express API + Anomaly Detection
├── .gitignore
├── docker-compose.yml
├── package.json
├── file.log
├── start.sh
├── vercel.json
├── LICENSE
├── README.md
├── sample.log
└── test.log 
```

---

## Socket Events
- newLog: Emit {id: timestamp, level, message, isAnomal}