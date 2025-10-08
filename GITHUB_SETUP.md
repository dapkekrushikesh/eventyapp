# GitHub Repository Setup for Render Deployment

## Create Two Separate Repositories

### 1. Backend Repository
```bash
# Create backend repo
cd event
git init
git add .
git commit -m "Initial backend commit for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/eventy-backend.git
git push -u origin main
```

### 2. Frontend Repository  
```bash
# Create frontend repo
cd ../event-management-app
git init
git add .
git commit -m "Initial frontend commit for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/eventy-frontend.git
git push -u origin main
```

## Alternative: Single Repository with Subdirectories
```bash
# Single repo approach
cd eventy
git init
git add .
git commit -m "Full-stack eventy application"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/eventy-fullstack.git
git push -u origin main
```

## Render Configuration for Single Repo
- Backend: Set root directory to `event`
- Frontend: Set root directory to `event-management-app`

## Next Steps
1. Create GitHub repositories
2. Push your code
3. Connect repositories to Render.com
4. Deploy backend first, then frontend
5. Update frontend environment with backend URL
