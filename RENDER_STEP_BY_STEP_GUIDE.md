# 🚀 Complete Render.com Deployment Guide

## 🎯 Overview
Deploy your full-stack Eventy application to Render.com with these step-by-step instructions.

---

## 📋 Prerequisites
- ✅ GitHub repository: https://github.com/dapkekrushikesh/eventyapp
- ✅ Render.com account (free)
- ✅ MongoDB Atlas database (already configured)

---

## 🖥️ PART 1: Deploy Backend (API Server)

### Step 1: Create Backend Service
1. Go to **https://render.com**
2. Click **"Sign Up"** or **"Login"**
3. Click **"New +"** → **"Web Service"**
4. Choose **"Build and deploy from a Git repository"**
5. Click **"Connect account"** → Connect GitHub
6. Select repository: **`dapkekrushikesh/eventyapp`**

### Step 2: Configure Backend Service
```
Name: eventyapp-backend
Environment: Node
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: event          ⚠️ IMPORTANT!
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### Step 3: Add Environment Variables
In the Render dashboard, go to **Environment** tab and add:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://dapkerushikesh:123456@eventy.l1rvzct.mongodb.net/eventy
JWT_SECRET=your_super_secret_jwt_key_make_this_very_long_and_random
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=https://eventyapp-frontend.onrender.com
```

### Step 4: Deploy Backend
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Your backend will be available at: **`https://eventyapp-backend.onrender.com`**

### Step 5: Test Backend
Visit: `https://eventyapp-backend.onrender.com/api/events`
Expected: JSON response with events

---

## 🎨 PART 2: Deploy Frontend (Angular App)

### Step 1: Create Frontend Service
1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect same repository: **`dapkekrushikesh/eventyapp`**

### Step 2: Configure Frontend Service
```
Name: eventyapp-frontend
Branch: main
Root Directory: event-management-app    ⚠️ IMPORTANT!
Build Command: npm install && npm run build
Publish Directory: dist/event-management-app
```

### Step 3: Deploy Frontend
1. Click **"Create Static Site"**
2. Wait 5-10 minutes for deployment
3. Your frontend will be available at: **`https://eventyapp-frontend.onrender.com`**

---

## 🔧 PART 3: Final Configuration

### Update CORS (if needed)
If you encounter CORS errors, the backend is already configured to accept requests from your frontend URL.

### Update Frontend URL in Backend
1. Go to your backend service in Render
2. Update the `FRONTEND_URL` environment variable to: `https://eventyapp-frontend.onrender.com`
3. The service will automatically redeploy

---

## 🌐 Your Live Application URLs

### 📍 Production URLs:
- **Frontend App**: https://eventyapp-frontend.onrender.com
- **Backend API**: https://eventyapp-backend.onrender.com
- **API Documentation**: https://eventyapp-backend.onrender.com/api/events

### 🔑 Login Credentials:
- **Email**: rushi@gmail.com
- **Password**: 123456

---

## ⚡ Deployment Status Checklist

### Backend Deployment ✅
- [ ] Service created and deployed
- [ ] Environment variables configured
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] CORS configured for frontend

### Frontend Deployment ✅  
- [ ] Static site created and deployed
- [ ] Build completed successfully
- [ ] App loading in browser
- [ ] API calls working
- [ ] Login/registration functional

---

## 🚨 Troubleshooting

### Backend Issues:
- **Build fails**: Check `Root Directory` is set to `event`
- **500 errors**: Verify environment variables are correct
- **Database connection**: Check MongoDB URI format

### Frontend Issues:
- **Build fails**: Check `Root Directory` is set to `event-management-app`
- **API errors**: Verify backend URL in environment.prod.ts
- **CORS errors**: Check CORS settings in backend

### Common Solutions:
1. **Redeploy**: Click "Manual Deploy" → "Deploy latest commit"
2. **Check logs**: View deployment and runtime logs in dashboard
3. **Environment variables**: Double-check all values

---

## 🔄 Auto-Deploy Setup

Both services are configured for **automatic deployment**:
- Any push to `main` branch triggers new deployment
- No manual intervention needed
- Changes go live in 5-10 minutes

---

## 💡 Free Tier Notes

### Render.com Free Tier:
- **750 hours/month** free (sufficient for development)
- **Services sleep** after 15 minutes of inactivity
- **Cold start** takes ~30 seconds to wake up
- **SSL certificates** included
- **Custom domains** available

### Performance Tips:
- First request may be slow (cold start)
- Keep services warm with uptime monitoring
- Upgrade to paid tier for production use

---

## 🎉 Success!

Once both deployments are complete, your full-stack application will be live on the internet!

**Share your app**: https://eventyapp-frontend.onrender.com

**Built with**: Angular, Node.js, MongoDB, JWT, Express.js
