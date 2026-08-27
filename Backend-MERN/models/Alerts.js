import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  logId: { type: mongoose.Schema.Types.ObjectId, ref: "Log" },
  message: String,
  level: { type: String, default: "critical" },
  acknowledged: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Alert", alertSchema);