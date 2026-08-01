import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud } from 'lucide-react';

function FileUpload({ onLogsLoaded }) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file); // must be 'file'

    try {
      console.log("Uploading to: http://localhost:5000/api/upload") // debug
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      
      const newLogs = res.data.logs || []; // don't crash if logs missing
      onLogsLoaded(newLogs);
      alert(`✅ Loaded ${res.data.logsAdded} logs`);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("❌ Upload failed: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragOut = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleDrop = async (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0]);
  };

  return (
    <div 
      className={`border-2 border-dashed p-10 text-center rounded-lg ${dragActive ? 'border-blue-500 bg-gray-800' : 'border-gray-600'}`}
      onDragEnter={handleDragIn} onDragLeave={handleDragOut}
      onDragOver={handleDrag} onDrop={handleDrop}
    >
      <UploadCloud className="mx-auto mb-4 w-12 h-12 text-gray-400" />
      <h2 className="text-3xl font-bold mb-6">Upload File</h2>
      <p className="text-white">Drag & Drop Log File Here</p>
      <button onClick={() => inputRef.current.click()} disabled={loading} 
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 mt-4 rounded disabled:bg-gray-500">
        {loading ? 'Uploading...' : 'Choose File'}
      </button>
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept=".log,.txt" />
    </div>
  );
}

export default FileUpload;