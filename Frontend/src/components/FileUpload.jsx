import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud } from 'lucide-react'; // optional icon. if error, remove this line

function FileUpload({ onLogsLoaded }) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('logfile', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      onLogsLoaded(res.data.logs);
      alert(`✅ Loaded ${res.data.totalLogs} logs`);
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragOut = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => inputRef.current.click();
  const handleChange = (e) => handleUpload(e.target.files[0]);

  return (
    <div 
      className={`p-10 border-2 border-dashed rounded-lg text-center transition-all
        ${dragActive ? 'border-green-500 bg-slate-700' : 'border-gray-600 bg-slate-800 hover:border-blue-500'}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <UploadCloud className="mx-auto h-12 w-12 text-blue-400" /> {/* remove if lucide not installed */}
      <h2 className="text-2xl font-bold text-white mt-4">Upload Log File</h2>
      <p className="text-gray-400 mt-2 mb-6">Drag & Drop Log File Here or Click Button Below</p>
      
      {/* THE BUTTON */}
      <button 
        onClick={handleClick}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition"
      >
        {loading ? "Uploading..." : "Choose File"}
      </button>

      <input 
        ref={inputRef}
        type="file" 
        accept=".log,.txt" 
        onChange={handleChange} 
        className="hidden" 
      />
      {loading && <p className="text-yellow-400 mt-4">Parsing file...</p>}
    </div>
  );
}

export default FileUpload;