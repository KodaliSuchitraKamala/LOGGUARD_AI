import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  logId: { type: mongoose.Schema.Types.ObjectId, ref: 'Log' },
  message: String,
  sentAt: { type: Date, default: Date.now },
  status: { type: String, default: 'sent' }
});

export default mongoose.model('Alert', alertSchema);