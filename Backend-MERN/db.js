import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export const initDB = async () => {
  if (cached.conn) return cached.conn;

  // Support all 3 names - your Vercel has MONGODB_URI
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!rawUri) throw new Error("MONGODB_URI not set in Vercel ENV");

  let mongoUri = rawUri.trim().replace(/^["']|["']$/g, "");
  mongoUri = mongoUri.replace(/ssl=true/gi, "tls=true");

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      dbName: "logguard", // SINGLE DB - lowercase always
    }).then((m) => {
      console.log(`✅ MongoDB Connected: ${m.connection.host} / ${m.connection.name}`);
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

export const db = mongoose.connection;
export default mongoose;