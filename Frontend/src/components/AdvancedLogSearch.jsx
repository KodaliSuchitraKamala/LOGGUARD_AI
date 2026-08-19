import { useState } from "react";
import axios from "axios";
import { Download, Search, RotateCcw } from "lucide-react"; // added RotateCcw

export default function AdvancedLogSearch({ onResults }) {
    const [filters, setFilters] = useState({
        keyword: "",
        level: "ALL",
        startDate: "",
        endDate: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await axios.get(`/api/logs/search?${params}`);
            onResults(res.data.logs);
        } catch (err) {
            console.error("Search failed: ", err);
        }
        setLoading(false);
    };

    const handleExport = () => {
        const params = new URLSearchParams({...filters, exportCSV: true });
        window.open(`/api/logs/search?${params}`, "_blank");
    };

    const handleClear = () => {
        const reset = {keyword: "", level: "ALL", startDate: "", endDate: ""};
        setFilters(reset);
        handleSearch(); // reload all logs
    }

    const levels = ["ALL", "INFO", "WARNING", "ERROR", "CRITICAL"];

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4 border border-gray-700">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-white">
                <Search size={18} className="text-blue-400"/> Advanced Search
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
                {levels.map(l => (
                    <button 
                        key={l} 
                        onClick={() => setFilters({...filters, level: l})} 
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
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
                    onChange={e => setFilters({...filters, keyword: e.target.value})} 
                    className="border border-gray-600 p-2 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600" 
                />
                <input 
                    type="date" 
                    value={filters.startDate} 
                    onChange={e => setFilters({...filters, startDate: e.target.value})} 
                    className="border border-gray-600 p-2 rounded bg-gray-900 text-white [color-scheme:dark]" 
                />
                <input 
                    type="date" 
                    value={filters.endDate} 
                    onChange={e => setFilters({...filters, endDate: e.target.value})} 
                    className="border border-gray-600 p-2 rounded bg-gray-900 text-white [color-scheme:dark]" 
                />
            </div>

            <div className="flex gap-2 mt-4">
                <button 
                    onClick={handleSearch} 
                    disabled={loading} 
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold transition"
                >
                    {loading? "Searching..." : "Search"}
                </button>
                <button 
                    onClick={handleExport} 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold transition"
                >
                    <Download size={16}/> Export CSV
                </button>
                <button 
                    onClick={handleClear} 
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold transition"
                >
                    <RotateCcw size={16}/> Clear
                </button>
            </div>
        </div>
    );
}