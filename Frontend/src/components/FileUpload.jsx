import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { uploadLogFile } from '../services/api';
import { UploadCloud } from 'lucide-react';

export default function FileUpload({ onLogsLoaded }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file); // <- CHANGED: was 'logfile', now 'file'

    try {
      const res = await uploadLogFile(formData);
      toast.success(res.data.message);
      onLogsLoaded(); // refresh table + analytics
      fileInputRef.current.value = "";
    } catch(err) {
      console.error("UPLOAD ERROR:", err.response);
      toast.error(err.response?.data?.message || 'Upload failed'); // use.message
    }
    setUploading(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Upload Log File</h2>
      <div
        onClick={() => fileInputRef.current.click()}
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer"
      >
        <UploadCloud className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-lg font-bold">Drag & Drop Log File Here</p>
        <p className="text-gray-400 text-sm">or click to choose</p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".log,.txt"
        />
      </div>
      <button
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
        type="button"
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold disabled:bg-gray-600"
      >
        {uploading? "Uploading..." : "Choose File"}
      </button>
    </div>
  );
}