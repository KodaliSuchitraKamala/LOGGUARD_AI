import axios from 'axios';

const API = import.meta.env.VITE_API_URL; // http://localhost:5000

export const uploadLog = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${API}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const getLogs = async ({ level = 'ALL', search ='', page = 1 }) => {
    const { data } = await axios.get(`${API}/api/logs`, {
        params: { level, search, page }
    });
    return data;
};

export const getStats = async () => {
    const { data } = await axios.get(`${API}/api/stats`);
    return data;
};