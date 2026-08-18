import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now }, // <- only 1 time
  level: { type: String, required: true, enum: ['INFO', 'WARN', 'ERROR', 'CRITICAL'], default: 'INFO' },
  message: { type: String, required: true },
  source: { type: String, default: 'system' },
});

export default mongoose.model('Log', logSchema);