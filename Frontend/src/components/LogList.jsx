import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

export default function LogList() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 1. Load existing logs
    api.get("/logs").then(res => setLogs(res.data.logs));

    // 2. Connect to live socket
    const socket = io("http://localhost:5000");
    
    socket.on("newLog", (log) => {
      setLogs((prev) => [log, ...prev].slice(0, 50)); // keep last 50
    });

    return () => socket.disconnect();
  }, []);

  const color = (level) => 
    level === "ERROR" ? "text-red-500" : 
    level === "WARN" ? "text-yellow-500" : "text-green-500";

  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h2 className="text-lg mb-2">Live Logs</h2>
      <div className="h-96 overflow-y-auto font-mono text-sm">
        {logs.length === 0 && <p>No logs yet...</p>}
        {logs.map(log => (
          <div key={log.id} className="mb-1">
            <span className="text-gray-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={`ml-2 font-bold ${color(log.level)}`}>{log.level}</span>
            <span className="ml-2">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}