import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { uploadLogFile } from '../services/api';
import { UploadCloud, FileText } from 'lucide-react';

const isGarbageLine = (line) => {
  const t = line.trim();
  if(t.length < 15) return true;
  if(/^0+\s*n+\s*$/i.test(t)) return true;
  if(/^0{4,}/.test(t.replace(/\s/g,''))) return true;
  if(/^(.)\1{5,}$/.test(t.replace(/\s/g,''))) return true;
  if(!/\d{4}-\d{2}-\d{2}/.test(t)) return true;
  return false;
};

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

    // FRONTEND VALIDATION
    const text = await file.text();
    const lines = text.split('\n').filter(l=>l.trim().length>0);
    if(lines.length === 0){
      toast.error("Empty file!");
      return;
    }
    const validLines = lines.filter(l =>!isGarbageLine(l));
    const garbageCount = lines.length - validLines.length;

    if(validLines.length === 0){
      toast.error(`Garbage file! Rejected ${lines.length} lines. Expected format: YYYY-MM-DD HH:MM:SS LEVEL Message`, {duration:5000});
      return;
    }
    if(garbageCount > validLines.length){
      toast.error(`File is ${Math.round(garbageCount/lines.length*100)}% garbage (${garbageCount}/${lines.length}). Only ${validLines.length} valid logs found.`, {duration:5000});
      return;
    }

    if(garbageCount>0) toast(`Filtered ${garbageCount} garbage lines, uploading ${validLines.length} valid logs...`, {icon:'⚠️'});

    setUploading(true);
    const formData = new FormData();
    // Send only cleaned content
    const cleanedBlob = new Blob([validLines.join('\n')], { type: 'text/plain' });
    formData.append('file', cleanedBlob, file.name);

    try {
      toast.loading('Uploading & parsing...');
      const res = await uploadLogFile(formData);
      toast.dismiss();
      toast.success(res.data.message || `Uploaded ${res.data.count || validLines.length} logs ✅`, { duration: 4000 });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => onLogsLoaded?.(), 1000);
    } catch(err) {
      toast.dismiss();
      console.error("UPLOAD ERROR:", err.response?.data);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#151a2b] border border-gray-700/50 p-6 rounded-xl mb-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText size={18}/> Upload Log File</h2>
      <div
        onClick={() =>!uploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'} ${uploading? 'opacity-60 pointer-events-none' : ''}`}
      >
        <UploadCloud className={`mx-auto mb-3 ${uploading? 'animate-bounce text-blue-400' : 'text-gray-400'}`} size={36} />
        <p className="text-md font-semibold">{uploading? "Parsing logs..." : "Drag & Drop Log File Here"}</p>
        <p className="text-gray-400 text-sm mt-1">or click to choose (.log,.txt,.csv)</p>
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFile(e.target.files[0])} accept=".log,.txt,.csv,.json" />
      </div>
      <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-semibold disabled:bg-gray-700">
        {uploading? "Uploading..." : "Choose File"}
      </button>
    </div>
  );
}