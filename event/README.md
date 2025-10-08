# Eventy Backend API

A comprehensive Node.js backend for the Eventy Event Management System with MongoDB integration.

## 🚀 Features

### Authentication & User Management
- User registration and login with JWT authentication
- Password reset functionality with email verification
- User profile management
- Account deactivation

### Event Management
- CRUD operations for events
- Event filtering by category, search, and pagination
- Event image upload support
- Real-time seat availability tracking

### Ticket Management
- Ticket booking with payment integration
- QR code generation for tickets
- Email ticket delivery
- Ticket verification and check-in
- Booking statistics and analytics

## 🛠️ Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer
- **QR Code Generation**: qrcode
- **Validation**: express-validator

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventy
JWT_SECRET=your_super_secret_jwt_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:4200
```

### 3. Seed Database (Optional)
```bash
npm run seed
```

### 4. Start the Server
```bash
npm run dev  # Development mode
npm start    # Production mode
```

## 📚 API Endpoints

### Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (Protected)
- `PUT /auth/profile` - Update user profile (Protected)

### Events
- `GET /events` - Get all events (with filtering)
- `GET /events/:id` - Get single event
- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Tickets
- `POST /tickets/book` - Book tickets
- `GET /tickets` - Get user tickets
- `POST /tickets/verify` - Verify ticket for check-in

**Login Credentials (after seeding):**
- Email: `john@example.com` | Password: `password123`
- Email: `admin@eventy.com` | Password: `admin123`
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
