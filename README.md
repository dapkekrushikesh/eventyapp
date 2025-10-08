# 🎉 Eventy - Full-Stack Event Management System

A complete event management application built with **Angular** frontend and **Node.js/Express** backend, featuring real-time event booking, user authentication, and MongoDB integration.

## 🌟 Features

- ✅ **User Authentication** - JWT-based login/registration
- ✅ **Event Management** - Browse, search, and filter events
- ✅ **Ticket Booking** - Complete booking system with payment simulation
- ✅ **QR Code Generation** - Digital tickets with QR codes
- ✅ **Email Notifications** - Ticket confirmations via email
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Real-time Updates** - Live event data from MongoDB
- ✅ **Profile Management** - User profiles and settings

## 🏗️ Architecture

```
eventy/
├── event/                    # Backend (Node.js/Express)
│   ├── server.js            # Main server file
│   ├── models/              # MongoDB models
│   ├── controllers/         # API controllers
│   ├── routes/              # API routes
│   ├── config/              # Database & auth config
│   └── scripts/             # Database seeding
└── event-management-app/     # Frontend (Angular)
    ├── src/app/
    │   ├── components/      # Angular components
    │   ├── services/        # HTTP services
    │   └── models/          # TypeScript interfaces
    └── dist/                # Production build
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Git

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/eventy-fullstack.git
   cd eventy-fullstack
   ```

2. **Setup Backend:**
   ```bash
   cd event
   npm install
   cp .env.example .env
   # Update .env with your MongoDB URI
   npm run seed    # Seed database
   npm start       # Start backend on port 5000
   ```

3. **Setup Frontend:**
   ```bash
   cd ../event-management-app
   npm install
   npm start       # Start frontend on port 4200
   ```

4. **Access Application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5000
   - Login: rushi@gmail.com / 123456

## 🔧 Environment Variables

Create `.env` file in the `event` directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventy
JWT_SECRET=your_super_secret_jwt_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:4200
```

## 🌐 Deployment

### Render.com (Recommended)

1. **Backend Deployment:**
   - Connect GitHub repo to Render
   - Set root directory: `event`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables

2. **Frontend Deployment:**
   - Set root directory: `event-management-app`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist/event-management-app`

See `RENDER_DEPLOYMENT_GUIDE.md` for detailed instructions.

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **QRCode** - QR code generation

### Frontend
- **Angular 20** - Frontend framework
- **TypeScript** - Programming language
- **RxJS** - Reactive programming
- **Angular Material** - UI components
- **CSS Grid/Flexbox** - Layout

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Tickets
- `POST /api/tickets/book` - Book tickets
- `GET /api/tickets/my-tickets` - Get user tickets

## 🧪 Testing

```bash
# Backend tests
cd event
npm test

# Frontend tests
cd event-management-app
ng test
```

## 📄 License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## 👥 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📞 Support

For support, email dapkekrushikesh@gmail.com or create an issue on GitHub.

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Express.js community
- MongoDB team
- All open-source contributors

---

**Built with ❤️ by Team 6**
