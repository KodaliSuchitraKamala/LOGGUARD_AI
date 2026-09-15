# LogGuard AI - Backend-Java (Spring Boot)

Core Backend for LogGuard AI - Deployed on Render.

**Live Java API:** https://logguard-backend.onrender.com/api

**Frontend Live:** https://logguardai.vercel.app

**MERN API:** https://logguard-mern-api.vercel.app/api

## Tech Stack
- Java 21 + Spring Boot 3.5.0
- Spring Security + JWT + CorsConfig
- MongoDB Atlas + Spring Data MongoDB
- Spring Mail (Gmail SMTP), Maven, Lombok

## Setup & Run Locally
```bash
cd Backend-Java
./mvnw spring-boot:run
```

**Server:** http://localhost:8080

**Live Health:** htpps://logguard-backend.onrender.com/api/health

## API Endpoints - Verified
- POST /api/upload - Upload.log (FormData: file) -> Parse + Save + Alert
- GET /api/logs/latest - Top 20 for Live Log Stream
- GET /api/logs/search?level=ERROR&search=keyword - Filter + Search
- GET /api/stats, /api/logs/stats, /api/dashboard/stats - { criticals, errors, warnings, totalLogs, health }
- GET /api/analytics - { totalLogs, criticals, avgResponseTime, levelDistribution, errorTrend, responseTrend }
- GET /api/alerts/active, PUT /api/alerts/{id}/resolve
- GET /api/notifications, PUT /api/notifications/read-all
- GET /api/users, PUT /api/users/:id/role, DELETE /api/users/:id
- POST /api/ai/analyze - AI Root Cause: DB Connection Lost 92%
- GET /api/debug/mongo - Atlas verification

## CORS Fix
```JAVA
// CorsConfig.java
.allowedOrigins("https://logguardai.vercel.app", "https://logguard-mern-api.vercel.app", "http://localhost:5173")
```

## Folder Structure
```
LOGGUARD_AI/
├── .vercel/
├── Backend-MERN/
├── Frontend/
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
