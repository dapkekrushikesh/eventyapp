const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true }, // Store email for quick access
  ticketCount: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'], 
    default: 'completed' 
  },
  qrCode: String,
  ticketId: { type: String, unique: true }, // Unique ticket identifier
  status: { type: String, enum: ['booked', 'cancelled', 'used'], default: 'booked' },
  bookingDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Generate unique ticket ID before saving
ticketSchema.pre('save', function(next) {
  if (!this.ticketId) {
    this.ticketId = 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);