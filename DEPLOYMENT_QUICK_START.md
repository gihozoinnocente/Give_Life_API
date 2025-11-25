# 🚀 Railway Deployment - Quick Start Guide

Quick reference guide for deploying to Railway.

## ⚡ 5-Minute Quick Start

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository

### 3. Add PostgreSQL Database
1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait for database to provision

### 4. Link Database to Service
1. Click on your **Web Service**
2. Go to **"Settings"** → **"Service Dependencies"**
3. Click **"+ Add Dependency"**
4. Select your **PostgreSQL** service
5. Railway will auto-add `DATABASE_URL`

### 5. Set Environment Variables
In your **Web Service** → **"Variables"** tab, add:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your_super_secure_secret_key_change_this
JWT_EXPIRES_IN=7d
API_VERSION=v1
```

**Important:** Replace `JWT_SECRET` with a secure random string!

### 6. Deploy!
Railway will automatically deploy. Check logs for:
- ✅ `Database connection validated successfully`
- ✅ `Database schema initialized successfully`
- ✅ `Server is running on port 3000`

## 🗄️ Database Migration

### Automatic (Recommended)
The database schema is **automatically migrated** on first startup. Just deploy!

### Manual (If Needed)
Using Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway link
railway run node scripts/migrate-railway.js
```

## ✅ Verify Deployment

1. **Health Check:**
   ```
   https://your-app-name.up.railway.app/health
   ```

2. **API Docs:**
   ```
   https://your-app-name.up.railway.app/api-docs
   ```

## 🔄 Updates

Just push to GitHub:
```bash
git push origin main
```

Railway will auto-deploy!

## 📚 Full Guide

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed instructions.

## 🐛 Troubleshooting

**Database connection fails?**
- Ensure PostgreSQL is linked in Service Dependencies
- Check `DATABASE_URL` is in environment variables

**Build fails?**
- Check logs in Railway dashboard
- Verify `npm run build` works locally

**Tables not created?**
- Check deployment logs for schema initialization
- Run manual migration script if needed

## 📞 Need Help?

- Full guide: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- Railway docs: [docs.railway.app](https://docs.railway.app)
