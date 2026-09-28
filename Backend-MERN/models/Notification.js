import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  message: { type: String, required: true },
  level: { type: String, default: 'CRITICAL' },
  type: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);