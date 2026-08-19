import { useState, useEffect } from "react";
import AdvancedLogSearch from "./AdvancedLogSearch";
import api from "../services/api";

export default function LogTable() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({keyword: "", level: "ALL", startDate: "", endDate: ""});
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (pageNum = 1, newFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({...newFilters, page: pageNum, limit: 20});
      const res = await api.get(`/logs/search?${params}`);
      setLogs(res.data.logs);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch(err) {
      console.error("Fetch logs error", err)
    }
    setLoading(false);
  }

  const handleSearch = (results) => {
    setLogs(results); // instant results from AdvancedLogSearch
    setTotalPages(1);
    setPage(1);
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchLogs(1, newFilters);
  }

  useEffect(() => { fetchLogs(1) }, [])

  const getLevelColor = (level) => {
    if(level === 'CRITICAL') return 'bg-red-500';
    if(level === 'ERROR') return 'bg-orange-500';
    if(level === 'WARNING') return 'bg-yellow-500 text-black';
    return 'bg-blue-500';
  }

  return (
    <div className="mt-6">
      <AdvancedLogSearch onResults={handleSearch} />
      
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-xs uppercase text-gray-300">
            <tr>
              <th className="p-3 text-left">TIME</th>
              <th className="p-3 text-left">LEVEL</th>
              <th className="p-3 text-left">MESSAGE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="p-4 text-center text-gray-400">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="3" className="p-4 text-center text-gray-400">No logs found</td></tr>
            ) : logs.map((log, i) => (
              <tr key={log._id || i} className={`border-t border-gray-700 ${log.level === 'CRITICAL' ? 'bg-red-900/20' : log.level === 'ERROR' ? 'bg-orange-900/10' : ''}`}>
                <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                </td>
                <td className="p-3 text-white">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3">
          <button 
            disabled={page <= 1}
            onClick={() => fetchLogs(page - 1)}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Prev
          </button>
          <span className="text-gray-400">Page {page} of {totalPages}</span>
          <button 
            disabled={page >= totalPages}
            onClick={() => fetchLogs(page + 1)}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}