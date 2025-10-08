# Event Management System Backend

A Node.js backend for managing events, users, RSVPs, ticket booking, QR code passes, and email confirmations.

## Features
- User registration and authentication (JWT)
- Event creation, listing, and management
- RSVP and ticket booking
- Dummy payment integration
- QR code pass generation
- Email confirmation (nodemailer)

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for authentication
- Nodemailer for emails
- qrcode for QR code generation

## Setup
1. Clone the repository or copy the project files.
2. Run `npm install` to install dependencies.
3. Create a `.env` file (see `.env.example`).
4. Start MongoDB locally or use a cloud provider.
5. Run `npm start` to start the server.

## Folder Structure
- `/models` - Mongoose models
- `/controllers` - Route controllers
- `/routes` - Express routes
- `/config` - Configuration files
- `/utils` - Utility functions (QR, email, etc.)
- `server.js` - Entry point

## API Endpoints
- `/api/auth` - User registration/login
- `/api/events` - Event CRUD
- `/api/tickets` - Ticket booking, RSVP

## License
MIT
