const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../config/auth');
const role = require('../middleware/role');
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventsByCategory
} = require('../controllers/eventController');

// Validation middleware for event creation/update
const eventValidation = [
  body('title').notEmpty().withMessage('Event title is required'),
  body('description').notEmpty().withMessage('Event description is required'),
  body('date').notEmpty().withMessage('Event date is required'),
  body('time').notEmpty().withMessage('Event time is required'),
  body('location').notEmpty().withMessage('Event location is required'),
  body('price').isNumeric().withMessage('Price must be a valid number'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('category').notEmpty().withMessage('Event category is required')
];

// Public routes
router.get('/', getEvents);                          // Get all events with filtering
router.get('/category/:category', getEventsByCategory); // Get events by category
router.get('/:id', getEvent);                        // Get single event

// Protected routes (admin only)
router.post('/', auth, role('admin'), eventValidation, createEvent);      // Create event
router.put('/:id', auth, role('admin'), eventValidation, updateEvent);    // Update event  
router.delete('/:id', auth, role('admin'), deleteEvent);                  // Delete event

module.exports = router;
