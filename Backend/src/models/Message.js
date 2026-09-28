const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom', required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true,
  },
  content: {
    type: String, required: true, trim: true, maxlength: 5000,
  },
}, { timestamps: true });

messageSchema.index({ chatRoom: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
