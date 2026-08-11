import { useState } from 'react';
import { AlertTriangle, Info, XCircle, ShieldCheck, Filter } from 'lucide-react';

function LogTable({ logs = [] }) {
  const [filter, setFilter] = useState('ALL');

  const safeLogs = Array.isArray(logs) ? logs : []; // ADD THIS LINE

  if(safeLogs.length === 0) {
    return <p className="text-gray-400 mt-4 text-center">No logs yet. Upload a file.</p>
  }

  const filteredLogs = filter === 'ALL' ? safeLogs : safeLogs.filter(l => l.level === filter); // use safeLogs

  const getLevelBadge = (level) => {
    const styles = {
      CRITICAL: "bg-red-600 text-white",
      ERROR: "bg-red-500 text-white", 
      WARNING: "bg-yellow-500 text-black",
      INFO: "bg-blue-500 text-white",
      SUCCESS: "bg-green-500 text-white"
    };
    const icons = {
      CRITICAL: <XCircle size={16} />,
      ERROR: <AlertTriangle size={16} />,
      WARNING: <AlertTriangle size={16} />,
      INFO: <Info size={16} />,
      SUCCESS: <ShieldCheck size={16} />
    };
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${styles[level] || 'bg-gray-500'}`}>
        {icons[level]} {level}
      </span>
    );
  };

  return (
    <div>
      <div className="flex gap-2 mb-3 p-4 items-center">
        <Filter size={16} className="text-gray-400" />
        {['ALL','INFO','WARNING','ERROR','CRITICAL'].map(lvl => (
          <button 
            key={lvl} 
            onClick={() => setFilter(lvl)}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${filter===lvl ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {lvl}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="p-3 text-left font-semibold">Time</th>
              <th className="p-3 text-left font-semibold w-32">Level</th>
              <th className="p-3 text-left font-semibold">Message</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {filteredLogs.map((log, index) => (
              <tr 
                key={log.id || index} 
                className={`hover:bg-gray-800 transition-colors duration-150 
                  ${log.level === 'CRITICAL' ? 'bg-red-950/30' : ''}
                  ${log.level === 'ERROR' ? 'bg-red-900/20' : ''}`}
              >
                <td className="p-3 text-gray-400 font-mono text-xs">{log.timestamp}</td>
                <td className="p-3">{getLevelBadge(log.level)}</td>
                <td className="p-3 text-gray-200">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LogTable;