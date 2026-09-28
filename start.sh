#!/bin/bash
# Start Java Backend in background
cd Backend-Java && ./mvnw spring-boot:run &
cd ..

# Start MERN Backend in background  
cd Backend-MERN && npm install && node server.js &
cd ..

# Start Frontend (serve it)
cd Frontend && npm install && npm run build
npx serve -s dist -l 8000