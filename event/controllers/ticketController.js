const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const QRCode = require('qrcode');
const { validationResult } = require('express-validator');
const { sendTicketEmail } = require('../utils/email');

// Book tickets for an event
exports.bookTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      eventId, 
      ticketCount, 
      userEmail, 
      paymentMethod = 'card_credit' 
    } = req.body;

    // Validate input
    if (!eventId || !ticketCount || !userEmail) {
      return res.status(400).json({ msg: 'Missing required fields: eventId, ticketCount, userEmail' });
    }

    const numTickets = parseInt(ticketCount);
    if (numTickets < 1) {
      return res.status(400).json({ msg: 'Ticket count must be at least 1' });
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check ticket availability
    if (event.availableSeats < numTickets) {
      return res.status(400).json({ 
        msg: `Only ${event.availableSeats} tickets available, requested ${numTickets}` 
      });
    }

    // Find or create user by email
    let user = await User.findOne({ email: userEmail });
    if (!user && req.user) {
      user = await User.findById(req.user.id);
    }

    if (!user) {
      // Create a basic user entry for guest booking
      user = new User({
        name: userEmail.split('@')[0],
        email: userEmail,
        password: 'guest_user' // This should be handled better in production
      });
      await user.save();
    }

    // Calculate total price
    const totalPrice = event.price * numTickets;

    // Generate QR code data
    const qrData = JSON.stringify({
      eventId: event._id,
      eventTitle: event.title,
      userEmail: userEmail,
      ticketCount: numTickets,
      bookingDate: new Date().toISOString(),
      ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    });

    const qrCode = await QRCode.toDataURL(qrData);

    // Create ticket booking
    const ticket = new Ticket({
      event: event._id,
      user: user._id,
      userEmail: userEmail,
      ticketCount: numTickets,
      totalPrice: totalPrice,
      paymentMethod: paymentMethod,
      paymentStatus: 'completed', // Assuming payment is processed
      qrCode: qrCode
    });

    await ticket.save();

    // Update event available seats
    event.availableSeats = event.availableSeats - numTickets;
    await event.save();

    // Send confirmation email
    try {
      await sendTicketEmail(userEmail, {
        event: event,
        ticket: ticket,
        qrCode: qrCode
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('event', 'title description date time location price category')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully',
      ticket: populatedTicket,
      qrCode: qrCode
    });

  } catch (err) {
    console.error('Book Ticket Error:', err);
    res.status(500).json({ error: 'Server error while booking ticket' });
  }
};

// Get all tickets for a user
exports.getTickets = async (req, res) => {
  try {
    let query = {};
    
    if (req.user) {
      query.user = req.user.id;
    } else if (req.query.email) {
      query.userEmail = req.query.email;
    } else {
      return res.status(400).json({ msg: 'User authentication required or email parameter needed' });
    }

    const tickets = await Ticket.find(query)
      .populate('event', 'title description date time location price category imageUrl')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets: tickets
    });
  } catch (err) {
    console.error('Get Tickets Error:', err);
    res.status(500).json({ error: 'Server error while fetching tickets' });
  }
};

// Get single ticket by ID
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event', 'title description date time location price category imageUrl')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Check if user owns the ticket (optional security check)
    if (req.user && ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view this ticket' });
    }

    res.json({
      success: true,
      ticket: ticket
    });
  } catch (err) {
    console.error('Get Ticket Error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ error: 'Server error while fetching ticket' });
  }
};

// Cancel a ticket
exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Check if user owns the ticket
    if (req.user && ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to cancel this ticket' });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({ msg: 'Ticket is already cancelled' });
    }

    // Update ticket status
    ticket.status = 'cancelled';
    ticket.paymentStatus = 'cancelled';
    await ticket.save();

    // Return seats to event
    const event = ticket.event;
    event.availableSeats += ticket.ticketCount;
    await event.save();

    res.json({
      success: true,
      message: 'Ticket cancelled successfully',
      ticket: ticket
    });
  } catch (err) {
    console.error('Cancel Ticket Error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ error: 'Server error while cancelling ticket' });
  }
};

// Verify ticket (for event check-in)
exports.verifyTicket = async (req, res) => {
  try {
    const { ticketId, qrData } = req.body;

    let ticket;
    
    if (ticketId) {
      ticket = await Ticket.findOne({ ticketId: ticketId }).populate('event user');
    } else if (qrData) {
      // Parse QR data and find ticket
      try {
        const parsedData = JSON.parse(qrData);
        ticket = await Ticket.findOne({ 
          'event': parsedData.eventId,
          'userEmail': parsedData.userEmail,
          'ticketId': parsedData.ticketId
        }).populate('event user');
      } catch (parseError) {
        return res.status(400).json({ msg: 'Invalid QR code format' });
      }
    }

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({ msg: 'Ticket has been cancelled' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ 
        msg: 'Ticket has already been used',
        ticket: ticket
      });
    }

    // Mark ticket as used
    ticket.status = 'used';
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket verified successfully',
      ticket: ticket,
      event: ticket.event,
      user: ticket.user
    });
  } catch (err) {
    console.error('Verify Ticket Error:', err);
    res.status(500).json({ error: 'Server error while verifying ticket' });
  }
};

// Get ticket statistics for an event
exports.getEventTicketStats = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const eventId = req.params.eventId;
    
    const stats = await Ticket.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: '$ticketCount' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const totalStats = await Ticket.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: '$ticketCount' },
          totalRevenue: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats,
      totals: totalStats[0] || { totalTickets: 0, totalRevenue: 0, totalBookings: 0 }
    });
  } catch (err) {
    console.error('Get Event Ticket Stats Error:', err);
    res.status(500).json({ error: 'Server error while fetching ticket statistics' });
  }
};
