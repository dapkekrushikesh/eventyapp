const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendTicketEmail = async (userId, qrCode) => {
  const user = await User.findById(userId);
  if (!user) return;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Your Event Ticket',
    html: `<h2>Your Ticket</h2><img src="${qrCode}" alt="QR Code" />`
  });
};
