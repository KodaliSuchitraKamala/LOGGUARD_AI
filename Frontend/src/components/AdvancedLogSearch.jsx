import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Download, Search, RotateCcw } from "lucide-react";

export default function AdvancedLogSearch({ onResults }) {
    const [filters, setFilters] = useState({
        keyword: "",
        level: "ALL",
        startDate: "",
        endDate: ""
    });
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    const api = axios.create({
        baseURL: "/api",
        headers: { Authorization: token? `Bearer ${token}` : "" }
    });

    const handleSearch = useCallback(async () => {
        if (!token) {
            console.error("No token found. Please login again.");
            return;
        }
        setLoading(true);
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v!== "" && v!== "ALL")
            );
            // keep level if not ALL
            if (filters.level!== "ALL") cleanFilters.level = filters.level;

            const params = new URLSearchParams(cleanFilters);
            const res = await api.get(`/logs/search?${params}`);
            onResults(res.data.logs || res.data || []);
        } catch (err) {
            console.error("Search failed: ", err);
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
            onResults([]);
        }
        setLoading(false);
    }, [filters, token, onResults]);

    // Auto search when level changes - without infinite loop
    useEffect(() => {
        if(token) handleSearch();
    }, [filters.level]); // eslint-disable-line

    const handleExport = async () => {
        if (!token) return;
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v!== "" && v!== "ALL")
            );
            if (filters.level!== "ALL") cleanFilters.level = filters.level;
            const params = new URLSearchParams({...cleanFilters, exportCSV: true });

            const res = await api.get(`/logs/search?${params}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `logs-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch(e) {
            console.error("Export failed", e);
        }
    };

    const handleClear = () => {
        const reset = { keyword: "", level: "ALL", startDate: "", endDate: "" };
        setFilters(reset);
        onResults([]);
    };

    const handleInputChange = (field, value) => {
        setFilters(prev => ({...prev, [field]: value }));
    };

    const levels = ["ALL", "INFO", "WARNING", "ERROR", "CRITICAL"];

    return (
        <div className="bg-gray-800 p-3 md:p-4 rounded-lg shadow-md mb-4 border border-gray-700 w-full overflow-hidden">
            <h3 className="font-bold text-base md:text-lg mb-3 flex items-center gap-2 text-white">
                <Search size={18} className="text-blue-400" /> Advanced Search
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
                {levels.map(l => (
                    <button
                        key={l}
                        onClick={() => handleInputChange("level", l)}
                        className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition ${
                            filters.level === l
                               ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                        {l}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    type="text"
                    placeholder="Search keyword..."
                    value={filters.keyword}
                    onChange={e => handleInputChange("keyword", e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="w-full border border-gray-600 p-2.5 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={e => handleInputChange("startDate", e.target.value)}
                    className="w-full border border-gray-600 p-2.5 rounded bg-gray-900 text-white [color-scheme:dark] text-sm"
                />
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={e => handleInputChange("endDate", e.target.value)}
                    className="w-full border border-gray-600 p-2.5 rounded bg-gray-900 text-white [color-scheme:dark] text-sm"
                />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold transition text-sm"
                >
                    {loading? "Searching..." : "Search"}
                </button>
                <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold transition text-sm"
                >
                    <Download size={16} /> Export
                </button>
                <button
                    onClick={handleClear}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold transition text-sm"
                >
                    <RotateCcw size={16} /> Clear
                </button>
            </div>
        </div>
    );
}