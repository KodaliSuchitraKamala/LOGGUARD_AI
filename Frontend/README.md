# LOGGUARD AI - Frontend Folder
### Detective for Server Logs - Find root in 10 seconds

LogGuard AI Frontend is a React + Vite based dashboard UI to upload, filter, search, and visualize server logs. This folder contains only the client-side application.

## ✨ Features Completed

**Dashboard Overview**
- Critical Errors count
- Average Response Time
- System Health percentage

**Log Upload**
- Drag & Drop or Click to upload
- Supports `.log`, `.txt`, `.zip` files up to 50GB

**Log Analysis Table**
- Colums: Time, Level, Message
- Color-coded levels: ERROR, WARN, INFO
- Auto "ROOT CAUSE" badge on critical error

**Controls**
- Filters logs by level: ALL, ERROR, WARN, INFO
- Search logs by keyword
- Clear Filters button
- Download filtered logs as CSV

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS / Custom CSS
- **State Management**: React useState, useEffect

## 🚀 Getting Started

1. Clone the repo
    ```bash
    git clone https://github.com/KodaliSuchitraKamala/LOGGUARD_AI
    cd LOGGUARD_AI