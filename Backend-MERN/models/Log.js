import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true, default: Date.now },
  level: { 
    type: String, 
    required: true, 
    uppercase: true,
    enum: ["INFO", "WARNING", "WARN", "ERROR", "ERKOR", "CRITICAL", "DEBUG"] // added ERKOR + DEBUG so insert never fails
  },
  message: { type: String, required: true },
  source: { type: String, default: "upload" },
  // FIX: These were missing - causing 0 results
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
}, { 
  timestamps: true,
  strict: false // allow any extra field so old data doesn't break
});

export default mongoose.model("Log", logSchema);