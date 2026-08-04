import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud } from 'lucide-react'; // or use any icon library

function FileUpload({ onLogsLoaded }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onLogsLoaded(res.data.logs); // backend must return {logs: [...]}
      alert("File uploaded successfully!");
    } catch(err) {
      console.error(err);
      alert("Upload failed. Is backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  return (
    <div 
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed p-10 text-center rounded-lg transition ${dragActive? 'border-blue-500 bg-gray-800' : 'border-gray-600 bg-gray-900'}`}>
      
      <UploadCloud className="mx-auto mb-4 w-12 h-12 text-gray-400" />
      <h2 className="text-3xl font-bold mb-2">Upload File</h2>
      <p className="text-gray-400 mb-4">Drag & Drop Log File Here</p>
      
      <button 
        onClick={() => inputRef.current.click()} 
        disabled={loading} 
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-500">
        {loading? 'Uploading...' : 'Choose File'}
      </button>

      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        onChange={(e) => handleFile(e.target.files[0])} 
        accept=".log,.txt" 
      />
    </div>
  )
}
export default FileUpload;