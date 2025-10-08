const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const { sendTicketEmail } = require('../utils/email');

exports.bookTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.body.eventId);
    if (!event || event.ticketsAvailable < 1) return res.status(400).json({ msg: 'No tickets available' });
    // Dummy payment logic
    // ...
    const qrData = `${req.user.id}-${event.id}-${Date.now()}`;
    const qrCode = await QRCode.toDataURL(qrData);
    const ticket = new Ticket({ event: event.id, user: req.user.id, qrCode });
    await ticket.save();
    event.ticketsAvailable -= 1;
    await event.save();
    await sendTicketEmail(req.user.id, qrCode);
    res.json(ticket);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).populate('event');
    res.json(tickets);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
