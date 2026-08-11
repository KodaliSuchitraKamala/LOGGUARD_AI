import { useEffect, useState } from 'react';
import { getAnalyticsSummary, getAnalyticsTrends, getLatestLogs } from '../services/api';
import ErrorTrendChart from './ErrorTrendChart';
import ResponseTimeChart from './ResponseTimeChart';
import LogLevelPie from './LogLevelPie';

export default function Analytics() {
  const [summary, setSummary] = useState({totalLogs: 0, errors: 0, avgResponse: 0, health: 0}); // default values
  const [trends, setTrends] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalyticsSummary(),
      getAnalyticsTrends(),
      getLatestLogs()
    ]).then(([sumRes, trendRes, logsRes]) => {
      setSummary(sumRes.data);
      setTrends(trendRes.data);
      setLogs(logsRes.data);
      setLoading(false);
    }).catch(err => {
      console.error("Analytics fetch error:", err);
      setLoading(false);
    })
  }, []);

  if(loading) return <p className="p-6">Loading Analytics...</p>

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded">Total Logs: <b>{summary.totalLogs}</b></div>
            <div className="bg-red-800 p-4 rounded">Errors: <b>{summary.errors}</b></div>
            <div className="bg-blue-800 p-4 rounded">Avg Response: <b>{summary.avgResponse}ms</b></div>
            <div className={`p-4 rounded ${summary.health > 80? 'bg-green-800' : 'bg-yellow-800'}`}>Health: <b>{summary.health}%</b></div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded">
                <h2 className="text-xl mb-2">Error Trend - 7 Days</h2>
                <ErrorTrendChart data={trends} />
            </div>
            <div className="bg-gray-800 p-4 rounded">
                <h2 className="text-xl mb-2">Response Time</h2>
                <ResponseTimeChart data={trends} />
            </div>
        </div>

        <div className="bg-gray-800 p-4 rounded mt-6 w-1/2">
            <h2 className="text-xl mb-2">Log Level Distribution</h2>
            <LogLevelPie logs={logs} />
        </div>
    </div>
  );
}