# Event Management System Deployment Guide

## 🚀 Deploy to Vercel (Free)

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Create GitHub repositories for your code
3. Sign up at https://vercel.com

### Backend Deployment

1. **Navigate to backend folder:**
   ```bash
   cd event
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - `NODE_ENV=production`
   - `MONGO_URI=mongodb+srv://dapkerushikesh:123456@eventy.l1rvzct.mongodb.net/eventy`
   - `JWT_SECRET=your_super_secret_jwt_key_here_change_in_production`
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_USER=your_email@gmail.com`
   - `EMAIL_PASS=your_app_password`

### Frontend Deployment

1. **Update environment file with your backend URL:**
   Edit `src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend-url.vercel.app/api'
   };
   ```

2. **Navigate to frontend folder:**
   ```bash
   cd ../event-management-app
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel
   ```

### Alternative: Deploy to Netlify + Railway

#### Backend on Railway (Free with MongoDB)
1. Go to https://railway.app
2. Connect your GitHub repository
3. Deploy from `event` folder
4. Add environment variables

#### Frontend on Netlify (Free)
1. Go to https://netlify.com
2. Drag and drop your `dist` folder after building
3. Or connect GitHub repository

## 🔧 Build Commands

### Frontend Build
```bash
cd event-management-app
npm run build
```

### Backend Start
```bash
cd event
npm start
```

## 🌐 Live URLs (after deployment)
- Backend: https://your-backend.vercel.app
- Frontend: https://your-frontend.vercel.app
- Login: rushi@gmail.com / 123456
