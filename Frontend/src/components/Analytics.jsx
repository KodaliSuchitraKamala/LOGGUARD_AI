import { useEffect, useState, useRef } from 'react';
import { getAnalyticsSummary, getAnalyticsTrends, getLatestLogs, uploadLogFile } from '../services/api';
import ErrorTrendChart from './ErrorTrendChart';
import ResponseTimeChart from './ResponseTimeChart';
import LogLevelPie from './LogLevelPie';

export default function Analytics() {
  const [summary, setSummary] = useState({});
  const [trends, setTrends] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getAnalyticsSummary().then(res => setSummary(res.data));
    getAnalyticsTrends().then(res => setTrends(res.data));
    getLatestLogs().then(res => setLogs(res.data));
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded">Total Logs: {summary.totalLogs}</div>
            <div className="bg-red-800 p-4 rounded">Errors: {summary.errors}</div>
            <div className="bg-blue-800 p-4 rounded">Avg Response: {summary.avgResponse}ms</div>
            <div className="bg-green-800 p-4 rounded">Health: {summary.health}%</div>
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
            <h2 className="text-xl">Log Level Distribution</h2>
            <LogLevelPie logs={logs} />
        </div>
    </div>
  );
}