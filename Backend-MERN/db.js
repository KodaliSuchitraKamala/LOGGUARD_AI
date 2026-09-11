import mongoose from "mongoose";

let isConnected = false;

export const initDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  const rawUri = process.env.MONGO_URI || process.env.MONGO_URL;
  if (!rawUri) throw new Error("MONGO_URI not set in Vercel ENV");

  let mongoUri = rawUri.trim().replace(/^["']|["']$/g, "");
  mongoUri = mongoUri.replace(/ssl=true/gi, "tls=true").replace(/ssl=false/gi, "tls=false");

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      dbName: "LogGuardAI"
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.error(`❌ DB Error: ${err.message}`);
    throw err;
  }
};

export const db = mongoose.connection;
export default mongoose;