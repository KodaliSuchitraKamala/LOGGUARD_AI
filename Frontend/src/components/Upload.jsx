import { uploadLog } from '../services/api';
import { toast } from 'react-toastify';
import { useState } from 'react';

const [uploading, setUploading] = useState(false);
const handleUpload = async (file) => {
    try {
        setUploading(true);
        await uploadLog(file);
        toast.success("Uploaded! Refreshing..");
        window.location.reload(); // reload page to get new logs
    } catch (err) {
        toast.error("Upload failed");
        console.log(err)
    } finally {
        setUploading(false);
    }
};