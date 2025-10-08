const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../config/auth');
const {
  bookTicket,
  getTickets,
  getTicket,
  cancelTicket,
  verifyTicket,
  getEventTicketStats
} = require('../controllers/ticketController');

// Validation middleware for ticket booking
const bookTicketValidation = [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('ticketCount').isInt({ min: 1 }).withMessage('Ticket count must be at least 1'),
  body('userEmail').isEmail().withMessage('Valid email is required')
];

const verifyTicketValidation = [
  body().custom((value, { req }) => {
    if (!req.body.ticketId && !req.body.qrData) {
      throw new Error('Either ticketId or qrData is required');
    }
    return true;
  })
];

// Public routes (no auth required for booking - supports guest booking)
router.post('/book', bookTicketValidation, bookTicket);        // Book ticket
router.post('/verify', verifyTicketValidation, verifyTicket);  // Verify ticket for check-in

// Routes that can work with or without auth
router.get('/', getTickets);                                   // Get user tickets (auth optional, email param alternative)
router.get('/:id', getTicket);                                // Get single ticket

// Protected routes (require authentication)
router.put('/:id/cancel', auth, cancelTicket);               // Cancel ticket
router.get('/stats/:eventId', auth, getEventTicketStats);    // Get ticket stats for event

module.exports = router;
