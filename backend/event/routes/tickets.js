const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const { bookTicket, getTickets } = require('../controllers/ticketController');

router.post('/book', auth, bookTicket);
router.get('/', auth, getTickets);

module.exports = router;
