const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://eventyapp-frontend.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Eventy Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check for database
app.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      success: true,
      database: {
        status: states[dbState],
        connected: dbState === 1
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// Email ticket sending endpoint (from the frontend server)
app.post('/api/send-ticket', async (req, res) => {
  try {
    console.log('Received /api/send-ticket request');
    const { email, subject, text, ticketDataUrl, qrUrl } = req.body;
    
    if (!email || !ticketDataUrl) {
      return res.status(400).json({ error: 'Missing required fields: email, ticketDataUrl' });
    }

    // Parse data URL
    const matches = ticketDataUrl.match(/^data:(image\/png);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid ticket data URL format' });
    }
    
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Create temp directory if it doesn't exist
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Write temp file
    const filename = `ticket_${Date.now()}.png`;
    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Create transporter
    let transporter;
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.log('Using Ethereal test account for ticket email');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransporter({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        tls: { rejectUnauthorized: false }
      });
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0078d4;">🎟️ Your Event Ticket</h2>
        <p>Thank you for booking <strong>${escapeHtml(subject || 'your event')}</strong>.</p>
        <p>${escapeHtml(text || '')}</p>
        ${qrUrl ? `<div style="margin: 20px 0;"><img src="${escapeHtml(qrUrl)}" alt="QR Code" style="max-width: 200px;"/></div>` : ''}
        <p>Your ticket is attached as a PNG file.</p>
        <p>Present this ticket at the event entrance.</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@eventy.com',
      to: email,
      subject: subject || 'Your Event Ticket',
      text: text || 'Here is your event ticket',
      html: htmlBody,
      attachments: [{ filename, path: filePath }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Ticket email sent successfully:', info.messageId);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview URL:', previewUrl);
    }

    // Cleanup temp file after delay
    setTimeout(() => {
      try { 
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); 
        }
      } catch (e) {
        console.error('Error cleaning up temp file:', e);
      }
    }, 60000);

    res.json({
      success: true,
      message: 'Ticket sent successfully',
      messageId: info.messageId,
      previewUrl: previewUrl
    });

  } catch (error) {
    console.error('Send ticket error:', error);
    res.status(500).json({ 
      error: 'Failed to send ticket email',
      details: error.message 
    });
  }
});

// Utility function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Debug-only endpoint to fetch a user by email (development only)
if (process.env.NODE_ENV !== 'production') {
  const User = require('./models/User');
  app.get('/__debug_user', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ msg: 'email query required' });
    
    try {
      const user = await User.findOne({ email }).select('-password');
      if (!user) return res.status(404).json({ msg: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/tickets', require('./routes/tickets'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Eventy Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📧 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:4200'}`);
});
