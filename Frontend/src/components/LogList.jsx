function LogList({ logs }) {
  return (
    <div className="bg-gray-800 p-4 mt-6 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Live Logs</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.map(log => (
          <div key={log.id} className="text-sm font-mono">
            <span className="text-gray-400">{log.timestamp}</span> 
            <span className={`ml-2 font-bold ${log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARNING' ? 'text-yellow-500' : 'text-green-500'}`}>
              [{log.level}]
            </span>
            <span className="ml-2">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default LogList;