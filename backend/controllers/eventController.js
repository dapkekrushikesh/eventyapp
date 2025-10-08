const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      date,
      time,
      location,
      price,
      capacity,
      imageUrl,
      category
    } = req.body;

    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      price: parseFloat(price),
      capacity: parseInt(capacity),
      availableSeats: parseInt(capacity), // Initially all seats are available
      imageUrl: imageUrl || 'images/default-event.jpg',
      category,
      createdBy: req.user ? req.user.id : null
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Create Event Error:', err);
    res.status(500).json({ error: 'Server error while creating event' });
  }
};

// Get all events with optional filtering and pagination
exports.getEvents = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10, sortBy = 'date' } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category.toLowerCase() !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { location: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.price = 1;
    } else if (sortBy === 'date') {
      sortOptions.date = 1;
    } else {
      sortOptions.createdAt = -1;
    }

    console.log('Fetching events with query:', query);
    
    const events = await Event.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email');

    console.log(`Found ${events.length} events`);

    const total = await Event.countDocuments(query);

    // Transform events to match frontend expectations
    const transformedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      price: event.price,
      capacity: event.capacity,
      availableSeats: event.availableSeats,
      imageUrl: event.imageUrl,
      category: event.category,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    res.json({
      events: transformedEvents,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Get Events Error:', err);
    res.status(500).json({ error: 'Server error while fetching events' });
  }
};

// Get single event by ID
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error('Get Event Error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).json({ error: 'Server error while fetching event' });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if user owns the event (optional - remove if any user can edit)
    if (req.user && event.createdBy && event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this event' });
    }

    const {
      title,
      description,
      date,
      time,
      location,
      price,
      capacity,
      imageUrl,
      category
    } = req.body;

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (price !== undefined) event.price = parseFloat(price);
    if (capacity !== undefined) {
      const newCapacity = parseInt(capacity);
      const seatDifference = newCapacity - event.capacity;
      event.capacity = newCapacity;
      event.availableSeats = Math.max(0, event.availableSeats + seatDifference);
    }
    if (imageUrl) event.imageUrl = imageUrl;
    if (category) event.category = category;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error('Update Event Error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).json({ error: 'Server error while updating event' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if user owns the event (optional - remove if any user can delete)
    if (req.user && event.createdBy && event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Event removed successfully' });
  } catch (err) {
    console.error('Delete Event Error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).json({ error: 'Server error while deleting event' });
  }
};

// Get events by category
exports.getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const events = await Event.find({
      category: { $regex: new RegExp(category, 'i') }
    }).populate('createdBy', 'name email');
    
    res.json(events);
  } catch (err) {
    console.error('Get Events by Category Error:', err);
    res.status(500).json({ error: 'Server error while fetching events by category' });
  }
};
