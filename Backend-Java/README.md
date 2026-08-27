# LogGuard AI - Backend

Backend server with Java for LogGuard AI. Handles log file uploads, parsing, filtering and API endpoints.

---

## Setup & Run Locally

1. **Start Server**
```bash
node server.js
```
Server runs on http://localhost:8080

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
cd LOGGUARD_AI/Backend-Java
```

---

## Folder Structure
```

LOGGUARD_AI/
├── Backend-MERN/
├── Frontend/
├── Backend-Java/
│ ├── mvn/wrapper/
│ │ ├── maven-wrapper.properties
│ ├── src/main/
│ │ ├── java/com/logguard/
│ │ │ ├── config/
│ │ │ │ ├── CorsConfig.java
│ │ │ ├── controller/
│ │ │ │ ├── LogController.java
│ │ │ ├── model/
│ │ │ │ ├── Log.java
│ │ │ ├── repository/
│ │ │ │ ├── LogRepository.java
│ │ │ ├── service/
│ │ │ │ ├── AiService.java
│ │ │ │ ├── LogParserService.java
│ │ │ ├── LogguardApplication.java
│ │ ├── resources/
│ │ │ ├── application.properties
│ ├── target/
│ │ ├── classes/
│ │ │ ├── com/logguard/
│ │ │ │ ├── config/
│ │ │ │ │ ├── CorsConfig.class
│ │ │ │ ├── controller/
│ │ │ │ │ ├── LogController.class
│ │ │ │ ├── model/
│ │ │ │ │ ├── Log.class
│ │ │ │ ├── respository/
│ │ │ │ │ ├── LogRepository.class
│ │ │ │ ├── service/
│ │ │ │ │ ├── AiService.class
│ │ │ │ │ ├── LogParserService.class
│ │ │ │ ├── LogguardApplication.class
│ │ │ ├── application.properties
│ │ ├── generated-sources/annotations
│ │ ├── maven-status/maven-compiler-plugin/compile/default-compile/
│ │ │ ├── createdFiles.lst
│ │ │ ├── inputFiles.lst
│ ├── .gitattributes
│ ├── .gitignore
│ ├── HELP.md
│ ├── mvnw
│ ├── mvnw.cmd
│ ├── pom.xml
│ └── README.md
├──.gitignore
├── LICENSE
├── README.md
├── sample.log
└── test.log # Sample log file for testing
```

---

## Socket Events
- newLog: Emit {id: timestamp, level, message, isAnomal}