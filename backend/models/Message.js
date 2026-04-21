const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  content: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
