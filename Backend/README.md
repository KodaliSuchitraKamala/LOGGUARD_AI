# LogGuard AI - Backend

Backend server for LogGuard AI. Handles log file uploads, parsing, filtering and API endpoints.

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
    cd LOGGUARD_AI/Backend
    ```

---

## Folder Structure
```
LOGGUARD AI/
├── Frontend/
├── Backend/
│   ├── node_modules/
│   ├── uploads/                    # Uploaded log files stored here
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js                   # Express + Socket.io server
│   └── README.md
├── .gitignore
├── Daily Report of Project.docx
├── LICENSE
├── README.md
├── sample.log
└── test.log
```

---

## Socket Events
- newLog: Emit {id: timestamp, level, message, isAnomal}