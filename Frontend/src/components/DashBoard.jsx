import { uploadLogFile } from "../services/api";

function Dashboard({ logs = [], onUploadComplete }) {
  const errorCount = logs.filter(l => l.level === 'ERROR').length;
  const criticalCount = logs.filter(l => l.level === 'CRITICAL').length;
  const warningCount = logs.filter(l => l.level === 'WARNING').length;
  const totalIssues = errorCount + criticalCount;

  // Health calc: start at 100, -10 per critical, -5 per error
  const health = logs.length > 0 ? Math.max(0, 100 - (criticalCount * 10) - (errorCount * 5)) : 98;
  
  const handleTestAlert = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/alerts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({level: 'CRITICAL', message: 'Test Alert From Dashboard', timestamp: new Date().toISOString()})
      });
      if(res.ok) alert("Test alert sent! Check backend logs.");
      else alert("Failed to send alert");
    } catch (err) {
      console.error(err);
      alert("Backend not running");
    }
  }

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadLogFile(formData);
      alert(res.data.message);
      if(onUploadComplete) onUploadComplete(); // call parent to refetch logs
    } catch(err) {
      alert("Upload failed");
      console.error(err);
    }
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-red-600 p-4 rounded">Critical: {criticalCount}</div>
        <div className="bg-orange-600 p-4 rounded">Errors: {errorCount}</div>
        <div className="bg-yellow-600 p-4 rounded">Warnings: {warningCount}</div>
        <div className={`p-4 rounded-lg ${health > 80 ? 'bg-green-600' : health > 50 ? 'bg-yellow-600' : 'bg-red-600'}`}>
          Health: {health}%
        </div>
      </div>
      
      <button onClick={handleTestAlert} className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded hover:bg-yellow-400 transition">
        Test Critical Alert
      </button>
    </div>
  );
}
export default Dashboard;