import { useState, useEffect, useRef } from "react";
import './App.css';

export default function App() {
  const [logs, setLogs] = useState([
    { id: 1, time: "10:32:11", level: "ERROR", message: "Database connecttion failed" },
    { id: 2, time: "10:31:45", level: "WARN", message: "High memory usage detected" },
    { id: 3, time: "10:30:02", level: "ERROR", message: "API timeout on /user/login" },
  ]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [rootCauseId, setRootCauseId] = useState(null);
  const fileRef = useRef(null);
  const [stats, setStats] = useState({ errors: 23, response: 342, health: 98 });
  // Filtered logs - used for table and CSV export
  const filteredLogs = logs.filter(log => {
    const levelMatch = filter === "ALL" || log.level === filter;
    const searchMatch = log.message.toLowerCase().includes(search.toLowerCase());
    return levelMatch && searchMatch;
  });
  // Auto Root Cause Highlight
  useEffect(() => {
    const firstError = logs.find(log => log.level === "ERROR");
    setRootCauseId(firstError? firstError.id: null);
  }, [logs]);
  // Random stats on load
  useEffect(() => {
    setStats({
      errors: Math.floor(Math.random() * 41) + 10,
      response: Math.floor(Math.random() * 200) + 200,
      health: Math.floor(Math.random() * 5) + 95,
    });
  }, []);
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      const newLogs = [
        { id: Date.now(), time: "Just Now", level: "INFO", message: `File ${file.name} uploaded successfully` },
        { id: Date.now() + 1, time: "Just Now", level: "WARN", message: `High memory usage detected in ${file.name}` },
        { id: Date.now() + 2, time: "Just Now", level: "ERROR", message: `Failed to parse line 42 in ${file.name}` },
      ];
      setLog(prev => [...newLogs,...prev]);
      setStats(prev => ({...prev, errors: prev.errors + 1, health: Math.max(90, prev.health - 1) }));
      setLoading(false);
      e.target.value = null; // reset file input
    }, 2000);
  };
  //  Export to CSV - only visible logs
  const downloadCSV = () => {
    const headers = "Time,Level,Message\n";
    const rows = filteredLogs.map(log => `${log.time},${log.level}, "${log.message}`).join("\n");
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv; charset = utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "LogGuard_Export.csv");
    document.body.appendChild(link); // needed for some browsers
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Clear Filters
  const clearFilters = () => {
    setFilter("ALL");
    setSearch("");
  };
  return (
    <div className="container">
      <h1>LOGGUARD AI</h1>
      <p className="tagline">Detective for Server Logs - Find root cause in 10 seconds</p>
      {/* STATS */}
      <div className="stats">
        <div className="card"><h3>Critical Errors</h3><p className="red">{stats.errors}</p></div>
        <div className="card"><h3>Avg Response Time</h3><p className="yellow">{stats.response}ms</p></div>
        <div className="card"><h3>System Health</h3><p className="green">{stats.health}%</p></div>
      </div>
      {/* UPLOAD */}
      <input type="file" ref={fileRef} style={{display: 'none'}} onChange={handleFileUpload} />
      <div className="upload-box">
        <h2>Upload Log File</h2>
        <p>Drag & Drop or click to select .log, .txt, .zip files up to 50GB</p>
        <button className="btn" onClick={() => fileRef.current.click()}>Select File</button>
      </div>
      {loading && <div className="loader">Processing file... ⌛ Analyzing logs</div>}
      {/* CONTROLS */}
      <div className="controls">
        <div>
          <label><b>Filter:</b></label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">ALL</option>
            <option value="ERROR">ERROR</option>
            <option value="WARN">WARN</option>
            <option value="INFO">INFO</option>
          </select>
        </div>
        <div>
          <label><b>Search:</b></label>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." />
        </div>
        <button className="btn secondary" onClick={clearFilters}>Clear Filters</button>
        <button className="btn green" onClick={downloadCSV}>Download CSV</button>
      </div>
      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Level</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map(log => (
            <tr key={log.id} className={log.id === rootCauseId? 'root-cause' : ''}>
              <td>{log.time}</td>
              <td className={log.level}>
                {log.level}
                {log.id === rootCauseId && <span className="badge">ROOT CAUSE</span>}
              </td>
              <td>{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}