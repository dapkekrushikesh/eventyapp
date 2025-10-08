# Event Management Server (email sending)

This small Express server accepts a POST to `/api/send-ticket` with JSON containing:

- `email` (string): recipient email
- `subject` (string): email subject
- `text` (string): plain-text body
- `ticketDataUrl` (string): PNG data URL (data:image/png;base64,...)
- `qrUrl` (string): optional QR image URL

It will decode the ticket image, attach it to the email, and send via SMTP. If no SMTP configuration is provided, it falls back to Nodemailer's Ethereal test account and returns a preview URL.

Setup

1. Install dependencies:

```powershell
cd server
npm install
```

2. (Optional) Configure SMTP via environment variables. Create a `.env` file in `server/` with these values:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

If you do not provide SMTP env vars, the server will use Ethereal and return an Ethereal preview URL in the response.

3. Start the server:

```powershell
npm start
```

The server listens on port 3000 by default.

Usage from frontend

The frontend will POST to `http://localhost:3000/api/send-ticket` with the JSON payload described above. The server responds with `{ ok: true, previewUrl }` (previewUrl may be provided when using Ethereal).

SendGrid (optional)
--------------------
If you'd prefer to use SendGrid instead of SMTP or Ethereal, set the environment variable `SENDGRID_API_KEY` in `server/.env` and the server will attempt to use SendGrid's API to send the message. Example `.env` addition:

```
SENDGRID_API_KEY=SG.xxxxxxx
```

When `SENDGRID_API_KEY` is present the server will use SendGrid to send the email with the ticket attached. Otherwise it falls back to SMTP or Ethereal as described above.
