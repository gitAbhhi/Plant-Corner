const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant', required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true,
  },
}, { timestamps: true });

// One room per buyer + plant combination
chatRoomSchema.index({ plant: 1, buyer: 1 }, { unique: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
