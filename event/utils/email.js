const nodemailer = require('nodemailer');
const User = require('../models/User');

// Create transporter based on environment
const createTransporter = async () => {
  // Check if production email settings are available
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });
  } else {
    // Use Ethereal for testing
    console.log('Using Ethereal test account for emails');
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransporter({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
};

// Send ticket confirmation email
exports.sendTicketEmail = async (userEmail, ticketData) => {
  try {
    const transporter = await createTransporter();
    const { event, ticket, qrCode } = ticketData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@eventy.com',
      to: userEmail,
      subject: `Ticket Confirmation - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0078d4; margin: 0;">🎟️ Eventy</h1>
            <h2 style="color: #333; margin: 10px 0;">Ticket Confirmation</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #0078d4; margin-top: 0;">Event Details</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Category:</strong> ${event.category}</p>
          </div>

          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #0078d4; margin-top: 0;">Booking Details</h3>
            <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
            <p><strong>Number of Tickets:</strong> ${ticket.ticketCount}</p>
            <p><strong>Total Amount:</strong> ₹${ticket.totalPrice}</p>
            <p><strong>Payment Method:</strong> ${ticket.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Booking Date:</strong> ${new Date(ticket.bookingDate).toLocaleDateString()}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #0078d4;">Your QR Code</h3>
            <p style="margin-bottom: 15px;">Present this QR code at the event entrance:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px solid #0078d4;">
              <img src="${qrCode}" alt="Ticket QR Code" style="max-width: 200px; height: auto;" />
            </div>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">Important Notes:</h4>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Please arrive 30 minutes before the event start time</li>
              <li>Carry a valid ID proof along with this ticket</li>
              <li>Screenshots of QR codes are accepted</li>
              <li>Tickets are non-transferable and non-refundable</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              Thank you for choosing Eventy! <br>
              For support, contact us at support@eventy.com
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Ticket email sent successfully:', info.messageId);
    
    // If using Ethereal, log the preview URL
    if (!process.env.EMAIL_HOST) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending ticket email:', error);
    throw error;
  }
};

// Send password reset email
exports.sendResetEmail = async (email, resetUrl) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@eventy.com',
      to: email,
      subject: 'Password Reset Request - Eventy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0078d4; margin: 0;">🎟️ Eventy</h1>
            <h2 style="color: #333; margin: 10px 0;">Password Reset Request</h2>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Hello,</p>
            <p>You have requested to reset your password for your Eventy account. Click the button below to reset your password:</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #0078d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0;"><strong>Security Note:</strong></p>
            <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
              <li>This link is valid for 1 hour only</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>

          <div style="margin-top: 30px;">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${resetUrl}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              The Eventy Team<br>
              support@eventy.com
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    
    // If using Ethereal, log the preview URL
    if (!process.env.EMAIL_HOST) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
};
