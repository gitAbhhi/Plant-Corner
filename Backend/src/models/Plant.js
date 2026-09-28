const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true,
  },
  title: {
    type: String, required: true, trim: true, maxlength: 150,
  },
  description: {
    type: String, trim: true, maxlength: 2000,
  },
  price: {
    type: Number, required: true, min: 0,
  },
  latitude: {
    type: Number, required: true, min: -90, max: 90,
  },
  longitude: {
    type: Number, required: true, min: -180, max: 180,
  },
  imageUrl: {
    type: String, default: null,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SOLD', 'REMOVED'],
    default: 'ACTIVE',
  },
}, { timestamps: true });

plantSchema.index({ latitude: 1, longitude: 1 });
plantSchema.index({ status: 1 });
plantSchema.index({ user: 1 });
plantSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Plant', plantSchema);
