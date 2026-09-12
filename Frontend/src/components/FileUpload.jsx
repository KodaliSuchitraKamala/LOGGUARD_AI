import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { uploadLogFile } from '../services/api';
import { UploadCloud, FileText, X } from 'lucide-react';

export default function FileUpload({ onLogsLoaded }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    // Java reads any key via fileMap.values().next(), but use 'file' for standard
    formData.append('file', file);
    formData.append('logFile', file); // keep both for safety

    try {
      const res = await uploadLogFile(formData);
      toast.success(res.data.message || `Uploaded ${res.data.count} logs ✅`);
      if (onLogsLoaded) onLogsLoaded();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch(err) {
      console.error("UPLOAD ERROR FULL:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Upload failed - CORS or backend down';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="bg-[#151a2b] border border-gray-700/50 p-6 rounded-xl mb-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FileText size={18}/> Upload Log File
      </h2>

      <div
        onClick={() =>!uploading && fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
          ${dragOver? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'}
          ${uploading? 'opacity-50 pointer-events-none' : ''}`}
      >
        <UploadCloud className="mx-auto mb-3 text-gray-400" size={36} />
        <p className="text-md font-semibold">{uploading? "Parsing logs..." : "Drag & Drop Log File Here"}</p>
        <p className="text-gray-400 text-sm mt-1">or click to choose (.log,.txt)</p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".log,.txt,.csv"
        />
      </div>

      <button
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
        type="button"
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-semibold disabled:bg-gray-700 disabled:cursor-not-allowed transition"
      >
        {uploading? "Uploading..." : "Choose File"}
      </button>

      <p className="text-[11px] text-gray-500 mt-3 text-center">
        Java Backend: /api/upload → Auto creates alerts & notifications
      </p>
    </div>
  );
}