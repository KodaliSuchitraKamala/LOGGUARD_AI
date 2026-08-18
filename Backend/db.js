import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export const initDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// For backward compatibility with old routes
export const db = mongoose.connection;
export default mongoose;