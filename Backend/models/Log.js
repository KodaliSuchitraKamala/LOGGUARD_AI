import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: { type: String, enum: ["INFO", "WARNING", "ERROR", "CRITICAL"], required: true },
  message: { type: String, required: true },
  source: { type: String, default: "system" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Log", logSchema);