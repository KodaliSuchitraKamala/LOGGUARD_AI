import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export const initDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: process.env.DB_NAME
        });
        console.log(`MongoDB Connected: ${mongoose.connection.host} ✅`);
        console.log(`Database: ${process.env.DB_NAME}`);
    } catch (error) {
        console.error(`DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// For backward compatibility with old routes
export const db = mongoose.connection;
export default mongoose;