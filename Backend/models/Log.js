import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: { type: String, enum: ['INFO', 'WARN', 'ERROR', 'CRITICAL'], default: 'INFO' },
  message: { type: String, required: true },
  source: { type: String, default: 'system' }
});

export default mongoose.model('Log', logSchema);