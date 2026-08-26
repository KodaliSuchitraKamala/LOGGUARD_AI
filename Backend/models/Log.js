import mongoose from "mongoose";
const logSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  level: { type: String, required: true, enum: ["INFO", "WARNING", "WARN", "ERROR", "CRITICAL"] },
  message: { type: String, required: true },
  source: { type: String },
}, { timestamps: true });
export default mongoose.model("Log", logSchema);