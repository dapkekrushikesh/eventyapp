# 🚀 Complete Render.com Deployment Guide

## Prerequisites
1. Create account at https://render.com
2. Connect your GitHub account
3. Create GitHub repositories for your code

## 📁 Project Structure Ready for Deployment
```
eventy/
├── event/                    (Backend - Deploy First)
│   ├── server.js
│   ├── package.json
│   ├── Procfile
│   ├── render.yaml
│   └── .env
└── event-management-app/     (Frontend - Deploy Second)
    ├── package.json
    ├── render.yaml
    └── src/
```

## 🔧 Step 1: Deploy Backend

### Option A: Manual Upload
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Choose "Build and deploy from a Git repository"
4. Connect GitHub and select your backend repository
5. Configure:
   - **Name**: `eventy-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Option B: GitHub Integration
1. Push your `event` folder to a GitHub repository
2. Connect repository to Render
3. Auto-deploy on git push

### Environment Variables (Add in Render Dashboard):
```
NODE_ENV=production
MONGO_URI=mongodb+srv://dapkerushikesh:123456@eventy.l1rvzct.mongodb.net/eventy
JWT_SECRET=your_super_secret_jwt_key_make_this_very_long_and_random_for_production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=https://eventy-frontend.onrender.com
```

## 🎨 Step 2: Deploy Frontend

### After Backend is Deployed:
1. Update `src/environments/environment.prod.ts` with your backend URL:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://YOUR-BACKEND-URL.onrender.com/api'
   };
   ```

### Deploy Frontend:
1. Click "New +" → "Static Site"
2. Connect your frontend repository
3. Configure:
   - **Name**: `eventy-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist/event-management-app`

## 🌐 Final URLs (after deployment)
- **Backend API**: https://eventy-backend.onrender.com
- **Frontend App**: https://eventy-frontend.onrender.com
- **Login**: rushi@gmail.com / 123456

## ⚡ Quick Commands for Local Testing
```bash
# Backend
cd event
npm start

# Frontend  
cd event-management-app
npm start
```

## 🔄 Auto-Deploy Setup
- Connect GitHub repositories
- Enable auto-deploy on main branch
- Every git push will trigger new deployment

## 💡 Tips
1. **Free Tier**: Both services can run on Render's free tier
2. **Cold Starts**: Free tier apps sleep after 15min inactivity
3. **Custom Domains**: Can add custom domain in settings
4. **Logs**: Check deployment logs for debugging
5. **Environment Variables**: Keep sensitive data in Render dashboard, not in code

## 🚨 Important Notes
- Replace `YOUR-BACKEND-URL` with actual deployed backend URL
- Update CORS settings if needed
- Test all API endpoints after deployment
- Monitor logs for any issues
