# 🚀 Vercel Frontend Deployment Configuration

## 📋 Frontend Environment Setup

### ✅ **No Environment Variables Needed!**
Angular frontend uses **build-time configuration** through environment files, so no runtime environment variables are required for Vercel.

---

## 🎯 **Vercel Deployment Settings**

### **Project Configuration:**
```
Framework Preset: Angular
Root Directory: event-management-app
Build Command: npm run build
Output Directory: dist/event-management-app
Install Command: npm install
Node.js Version: 18.x
```

### **Build Settings:**
```
Build Command: npm run build
Output Directory: dist/event-management-app
Install Command: npm install
```

---

## 🔧 **Environment Files (Already Configured)**

### **Production Environment** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://eventyapp-backend.onrender.com/api'
  // OR if backend is on Vercel:
  // apiUrl: 'https://eventyapp-backend.vercel.app/api'
};
```

### **Development Environment** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

---

## 🌐 **Deploy to Vercel Steps:**

### **Option 1: Vercel CLI**
```bash
npm install -g vercel
cd event-management-app
vercel --prod
```

### **Option 2: Vercel Dashboard**
1. Go to https://vercel.com
2. Import your GitHub repository: `dapkekrushikesh/eventyapp`
3. Set Root Directory: `event-management-app`
4. Deploy!

---

## 📍 **Expected URLs:**

- **Frontend**: `https://eventyapp.vercel.app`
- **Backend**: `https://eventyapp-backend.onrender.com`

---

## ⚠️ **Important Notes:**

1. **No environment variables needed** for frontend
2. **Backend URL is hardcoded** in environment.prod.ts
3. **Automatic deployments** on git push to main branch
4. **Free tier includes**:
   - Unlimited static deployments
   - Global CDN
   - SSL certificates
   - Custom domains

---

## 🔄 **Backend Integration:**

Make sure your backend CORS allows your Vercel domain:
```javascript
// In your backend server.js
const corsOptions = {
  origin: [
    'http://localhost:4200',
    'https://eventyapp.vercel.app', // Add your Vercel URL
    'https://*.vercel.app'          // Allow all Vercel preview URLs
  ],
  credentials: true
};
```

---

## 🎉 **Ready to Deploy!**

Your frontend is configured and ready for Vercel deployment with zero environment variables needed!
