# Eventy Backend API Testing

## Backend Status: ✅ RUNNING

**Server URL:** http://localhost:5000
**Database:** MongoDB (eventy database)
**Status:** Connected and operational

---

## Available API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token

### 🎟️ Events
- `GET /api/events` - Get all events (with filtering)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/category/:category` - Get events by category

### 🎫 Tickets
- `POST /api/tickets/book` - Book tickets
- `GET /api/tickets` - Get user tickets
- `GET /api/tickets/:id` - Get single ticket
- `PUT /api/tickets/:id/cancel` - Cancel ticket (Protected)
- `POST /api/tickets/verify` - Verify ticket for check-in

### 📧 Utilities
- `POST /api/send-ticket` - Send ticket via email

---

## Sample Test Commands

### Test Health Check
```bash
curl http://localhost:5000/health
```

### Test Events API
```bash
curl http://localhost:5000/api/events
```

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "password123"
  }'
```

### Test Event Creation
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Event",
    "description": "A test event",
    "date": "2025-12-01",
    "time": "19:00",
    "location": "Test Venue",
    "price": 100,
    "capacity": 50,
    "category": "Test"
  }'
```

### Test Ticket Booking
```bash
curl -X POST http://localhost:5000/api/tickets/book \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "EVENT_ID_HERE",
    "ticketCount": 2,
    "userEmail": "user@example.com",
    "paymentMethod": "card_credit"
  }'
```

---

## Pre-seeded Test Data

### 👤 Test Users
- **Email:** john@example.com | **Password:** password123
- **Email:** jane@example.com | **Password:** password123
- **Email:** admin@eventy.com | **Password:** admin123

### 🎟️ Sample Events (8 total)
1. Pune Music & Arts Festival 2025 - ₹2,999
2. Tech Innovation Summit 2025 - ₹4,999
3. Maharashtra Food Festival - ₹1,499
4. Contemporary Art Exhibition - ₹999
5. Pune Premier League - ₹1,499
6. Startup Pitch Day - ₹999
7. Classical Dance Recital - ₹1,999
8. Wine Tasting Experience - ₹3,499

---

## Frontend Integration

The backend is configured to work with the Angular frontend:
- **CORS enabled** for http://localhost:4200
- **JWT authentication** with 7-day expiry
- **Compatible data structures** with frontend models
- **Email notifications** for bookings and password resets

---

## 🚀 Ready for Frontend Integration!

The backend server is fully operational and ready to handle requests from your Angular frontend. All endpoints are working and the database is populated with sample data.

To connect your frontend:
1. Update your Angular service URLs to point to `http://localhost:5000/api`
2. Use the test credentials above for authentication
3. Test the event booking flow end-to-end
