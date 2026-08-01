function Dashboard({ logs = [] }) {
  const criticalCount = logs.filter(l => l.level === 'CRITICAL' || l.level === 'ERROR').length;
  const health = logs.length > 0 ? 100 - criticalCount : 98; // fake calc

  const handleTestAlert = async () => {
    await fetch('http://localhost:5000/api/alerts', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({level: 'CRITICAL', message: 'Test Alert', timestamp: new Date().toISOString()})
    });
    alert("Test alert sent!");
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-red-600 p-4 rounded">Critical Errors: {criticalCount}</div>
        <div className="bg-blue-600 p-4 rounded">Avg Response: 142ms</div>
        <div className="bg-green-600 p-4 rounded">System Health: {health}%</div>
      </div>
      <button onClick={handleTestAlert} className="bg-yellow-500 text-black px-4 py-2 rounded">
        Test Critical Alert
      </button>
    </div>
  );
}
export default Dashboard;