import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { uploadLogFile } from '../services/api';
import { UploadCloud, FileText } from 'lucide-react';

export default function FileUpload({ onLogsLoaded }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large (max 20MB)");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    // Backend uses upload.any() - so any key works. Use 'file' to match your backend log
    formData.append('file', file);

    try {
      toast.loading('Uploading & parsing...');
      const res = await uploadLogFile(formData);
      toast.dismiss();
      toast.success(res.data.message || `Uploaded ${res.data.count} logs ✅`, { duration: 4000 });

      // FIX: Reset input + Delay refresh for Mongo commit (Vercel serverless is cold)
      if (fileInputRef.current) fileInputRef.current.value = "";

      // This was the bug in your video - you called onLogsLoaded instantly
      // DB didn't commit yet, so fetch returned 0
      setTimeout(() => {
        if (onLogsLoaded) onLogsLoaded();
      }, 1000);

    } catch(err) {
      toast.dismiss();
      console.error("UPLOAD ERROR FULL:", err, err.response?.data);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#151a2b] border border-gray-700/50 p-6 rounded-xl mb-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FileText size={18}/> Upload Log File
      </h2>

      <div
        onClick={() =>!uploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
          ${dragOver? 'border-blue-500 bg-blue-500/10 scale-[1.01]' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'}
          ${uploading? 'opacity-60 pointer-events-none' : ''}`}
      >
        <UploadCloud className={`mx-auto mb-3 ${uploading? 'animate-bounce text-blue-400' : 'text-gray-400'}`} size={36} />
        <p className="text-md font-semibold">{uploading? "Parsing logs... Uploading to MongoDB..." : "Drag & Drop Log File Here"}</p>
        <p className="text-gray-400 text-sm mt-1">or click to choose (.log,.txt,.csv)</p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
          accept=".log,.txt,.csv,.json"
        />
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        type="button"
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-semibold disabled:bg-gray-700 disabled:cursor-not-allowed transition"
      >
        {uploading? "Uploading..." : "Choose File"}
      </button>
    </div>
  );
}