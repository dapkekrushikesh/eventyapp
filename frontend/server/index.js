const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

require('dotenv').config();
const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/api/send-ticket', async (req, res) => {
  try {
    console.log('Received /api/send-ticket request');
    const { email, subject, text, ticketDataUrl, qrUrl } = req.body;
    if (!email || !ticketDataUrl) return res.status(400).send('missing-fields');

    // dataurl -> buffer
    const matches = ticketDataUrl.match(/^data:(image\/png);base64,(.+)$/);
    if (!matches) return res.status(400).send('invalid-dataurl');
    const mime = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // write temp file
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const filename = `ticket_${Date.now()}.png`;
    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, buffer);

    let transporter;
    // If SMTP env vars are provided, use them. Otherwise create Ethereal test account.
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('Using SMTP from env');
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      console.log('No SMTP env provided, creating Ethereal test account');
      const testAccount = await nodemailer.createTestAccount();
      console.log('Ethereal account created:', testAccount.user);
      // Accept self-signed certs for local Ethereal SMTP in dev environments
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        tls: {
          // Allow self-signed certs (Ethereal uses a dev certificate)
          rejectUnauthorized: false
        }
      });
      console.log('Transporter created using Ethereal (tls.rejectUnauthorized=false)');
    }

    const htmlBody = `
      <div style="font-family:Arial, sans-serif; color:#333;">
        <h2>Booking Confirmation</h2>
        <p>Thank you for booking <strong>${escapeHtml(subject || 'your event')}</strong>.</p>
        <p>${escapeHtml(text || '')}</p>
        <p><strong>Event:</strong> ${escapeHtml(subject || '')}</p>
        <p><strong>Tickets:</strong> ${escapeHtml(String(req.body.tickets || '1'))}</p>
        ${qrUrl ? `<p><strong>QR Code:</strong><br/><img src="${escapeHtml(qrUrl)}" alt="QR" width="200"/></p>` : ''}
        <p>Attached is your ticket PNG.</p>
      </div>
    `;

    const mailOpts = {
      from: 'no-reply@example.com',
      to: email,
      subject: subject || 'Your Ticket',
      text: text || 'Here is your ticket',
      html: htmlBody,
      attachments: [
        { filename, path: filePath }
      ]
    };

    console.log('Sending email to', email);
    const info = await transporter.sendMail(mailOpts);
    console.log('Mail sent info:', info && info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL:', previewUrl);

    // cleanup temp file after a short delay
    setTimeout(() => {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }, 60 * 1000);

    res.json({ ok: true, previewUrl });
  } catch (err) {
    console.error('send-ticket error', err);
    res.status(500).send('server-error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server listening on', port));

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
