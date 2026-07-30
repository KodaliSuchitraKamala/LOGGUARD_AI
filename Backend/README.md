# LogGuard AI - Backend

Backend server for LogGuard AI. Handles log file uploads, parsing, filtering and API endpoints.

--- 

## Tech Stack
- **Node.js + Express**
- **File Upload**: Multer
- **CORS** for frontend connection

---

## Setup & Run Locally

1. **Install dependencies**
    ```bash
    npm install
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

2. **Get Logs**
    GET /api/logs?level=ERROR&search=keyword
    - Fetch logs with filters
    - Query Params:
        * level: INFO, WARN, ERROR
        * search: keyword to search in log message
### 5. Clone the repository
    ```bash
    git clone https://github.com/KodaliSuchitraKamala/LOGGUARD_AI.git
    cd LOGGUARD_AI/Backend
    ```

---

## Folder Structure
```
LOGGUARD_AI
├── Frontend
└── Backend
    ├── node_modules/            # Installed packages
    ├── uploads/                 # Uploaded log files
    ├── server.js                # Main server file
    ├── package.json             # Dependencies
    └── README.md                # This file for Backend
```
