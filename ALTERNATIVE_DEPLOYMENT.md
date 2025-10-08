# Alternative Deployment: Netlify + Railway

## Deploy Backend to Railway (Free MongoDB Support)

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo" 
5. Connect your `event` folder
6. Add environment variables:
   - NODE_ENV=production
   - MONGO_URI=mongodb+srv://dapkerushikesh:123456@eventy.l1rvzct.mongodb.net/eventy
   - JWT_SECRET=your_jwt_secret
   - EMAIL_HOST=smtp.gmail.com
   - etc.

## Deploy Frontend to Netlify

1. Build your project: `npm run build`
2. Go to https://netlify.com
3. Drag and drop the `dist/event-management-app` folder
4. Or connect GitHub repository

## Deploy Frontend to Surge.sh (Quick)

1. Install surge: `npm install -g surge`
2. Build project: `npm run build` 
3. Deploy: `cd dist/event-management-app && surge`

Your app will be live at: https://your-project.surge.sh
