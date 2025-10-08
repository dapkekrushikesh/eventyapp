const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const { createEvent, getEvents, getEvent } = require('../controllers/eventController');

router.post('/', auth, createEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);

module.exports = router;
