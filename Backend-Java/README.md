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
.allowedOrigins("https://log-guard-ai.vercel.app", "https://logguard-mern-api.vercel.app", "http://localhost:5173")
```
