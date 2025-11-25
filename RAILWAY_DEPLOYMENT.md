# 🚂 Railway Deployment Guide

Complete guide to deploy the Blood Donation App API to Railway and migrate your database.

## 📋 Prerequisites

- GitHub account with your code repository
- Railway account (sign up at [railway.app](https://railway.app))
- Git installed locally

---

## 🚀 Step 1: Prepare Your Repository

### 1.1 Push Your Code to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 1.2 Verify Build Script

The build script is configured to work cross-platform. It will:
- Compile TypeScript to JavaScript
- Copy the database schema file to the dist folder

---

## 🎯 Step 2: Create Railway Project

### 2.1 Sign Up / Login to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up or log in with your GitHub account

### 2.2 Create New Project

1. Click **"New Project"** on Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (`blood-donation-app-api`)
4. Railway will automatically detect it's a Node.js project

---

## 🗄️ Step 3: Set Up PostgreSQL Database

### 3.1 Add PostgreSQL Service

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically provision a PostgreSQL database
4. **Important:** Note down the database details (they'll be in environment variables)

### 3.2 Get Database Connection String

1. Click on the PostgreSQL service you just created
2. Go to the **"Variables"** tab
3. You'll see `DATABASE_URL` - this is your connection string
4. Copy this value (you'll need it later)

---

## 🔧 Step 4: Configure Environment Variables

### 4.1 Add Environment Variables

1. In your Railway project, click on your **Web Service** (not the database)
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"**
4. Add the following variables:

#### Required Variables:

```env
# Database (Railway will auto-provide this when you connect the database)
DATABASE_URL=<auto-filled-when-you-add-database>

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Authentication (CHANGE THESE VALUES!)
JWT_SECRET=your_super_secure_random_secret_key_here_change_this
JWT_EXPIRES_IN=7d

# API Version
API_VERSION=v1

# Email Configuration (Optional - for notifications)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# SMS Configuration (Optional - for Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
SMS_ENABLED=true
```

### 4.2 Connect Database to Service

**Important:** You need to link the database to your web service:

1. In your **Web Service** → Go to **"Settings"**
2. Scroll down to **"Service Dependencies"**
3. Click **"+ Add Dependency"**
4. Select your **PostgreSQL** service
5. Railway will automatically add `DATABASE_URL` to your web service variables

---

## 📦 Step 5: Configure Build Settings

### 5.1 Verify Railway Configuration

Your `railway.json` is already configured correctly:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 5.2 Verify Nixpacks Configuration

Your `nixpacks.toml` is already set up:

```toml
[phases.setup]
nixPkgs = ['nodejs_20']

[phases.install]
cmds = ['npm install']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm start'
```

Railway will automatically use these settings.

---

## 🗃️ Step 6: Database Migration

### Option A: Automatic Migration (Recommended)

The database schema will be automatically initialized when your app starts!

**How it works:**
- When the server starts, it calls `initializeDatabase()`
- This function reads `schema.sql` and executes it
- Tables are created automatically if they don't exist

**Verify it worked:**
1. After deployment, check the Railway logs
2. Look for: `✅ Database schema initialized successfully`
3. If you see `ℹ️  Tables already exist`, that's fine - it means they were already created

### Option B: Manual Migration (If Needed)

If automatic migration doesn't work, you can manually run the schema:

#### Using Railway CLI:

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Connect to PostgreSQL shell:
   ```bash
   railway connect postgres
   ```

5. Run the schema file:
   ```sql
   \i src/config/schema.sql
   ```

#### Using pgAdmin or psql:

1. Get your database credentials from Railway:
   - Go to PostgreSQL service → Variables tab
   - You'll see: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

2. Connect using psql:
   ```bash
   psql postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
   ```

3. Copy and paste the contents of `src/config/schema.sql`

---

## 🚢 Step 7: Deploy

### 7.1 Automatic Deployment

Railway will automatically deploy when you:
- Push to the `main` branch
- Or manually trigger deployment from Railway dashboard

### 7.2 Manual Deployment

1. In Railway dashboard, click **"Deploy"** button
2. Railway will:
   - Install dependencies
   - Run `npm run build`
   - Start the server with `npm start`

### 7.3 Monitor Deployment

Watch the deployment logs:
1. Go to your service in Railway
2. Click on **"Deployments"** tab
3. Click on the latest deployment to see logs

**What to look for:**
- ✅ `Database connection validated successfully`
- ✅ `Database schema initialized successfully`
- ✅ `Server is running on port 3000`
- ✅ `Blood Donation API ready to accept requests`

---

## ✅ Step 8: Verify Deployment

### 8.1 Check Health Endpoint

Your app should be accessible at:
```
https://your-app-name.up.railway.app/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 8.2 Check API Documentation

Visit:
```
https://your-app-name.up.railway.app/api-docs
```

You should see the Swagger API documentation.

### 8.3 Test Database Connection

Check the Railway logs for:
```
✅ Database connection validated successfully
✅ Database schema initialized successfully
```

---

## 🔐 Step 9: Seed Admin User (Optional)

To create an admin user, you can use the seed script:

### Option A: Using Railway CLI

1. Connect to Railway:
   ```bash
   railway login
   railway link
   ```

2. Run the seed script:
   ```bash
   railway run npm run seed:admin
   ```

### Option B: Create via API

Once deployed, use the admin registration endpoint:
```
POST https://your-app-name.up.railway.app/api/v1/auth/register/admin
```

---

## 🔄 Step 10: Continuous Deployment

Railway will automatically redeploy when you:
- Push commits to the connected branch (usually `main`)
- Merge pull requests to the main branch

To change the branch:
1. Go to Service → Settings
2. Find "Source" section
3. Change the branch if needed

---

## 🐛 Troubleshooting

### Issue: Database connection failed

**Solution:**
1. Ensure PostgreSQL service is added
2. Ensure database is connected to web service (Service Dependencies)
3. Check `DATABASE_URL` is set in environment variables
4. Verify database is running (green status in Railway)

### Issue: Build fails

**Solution:**
1. Check build logs in Railway
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript compiles: `npm run build` locally
4. Check for syntax errors

### Issue: Schema migration fails

**Solution:**
1. Check logs for specific error
2. Error `42P07` (table already exists) is OK - tables are already created
3. Error `ECONNREFUSED` - database connection issue
4. Error `3D000` - database doesn't exist (shouldn't happen with Railway)

### Issue: Server crashes on startup

**Solution:**
1. Check Railway logs
2. Verify all environment variables are set
3. Ensure `JWT_SECRET` is set (required)
4. Check database connection

### Issue: Cannot connect to database

**Solution:**
1. Ensure database service is provisioned
2. Check Service Dependencies are set
3. Verify `DATABASE_URL` is in environment variables
4. Database might still be initializing (wait a few minutes)

---

## 📝 Environment Variables Checklist

Before deploying, ensure you have set:

- ✅ `DATABASE_URL` (auto-set when database is connected)
- ✅ `PORT` (usually 3000)
- ✅ `NODE_ENV=production`
- ✅ `JWT_SECRET` (CHANGE THIS!)
- ✅ `JWT_EXPIRES_IN=7d`
- ✅ `API_VERSION=v1`
- ⚠️ Email config (optional)
- ⚠️ SMS config (optional)

---

## 🔗 Useful Links

- Railway Dashboard: [railway.app](https://railway.app)
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Your API: `https://your-app-name.up.railway.app`
- API Docs: `https://your-app-name.up.railway.app/api-docs`

---

## 📊 Monitoring

### View Logs

1. Go to your service in Railway
2. Click on "Deployments"
3. Click on latest deployment
4. View real-time logs

### Check Metrics

1. Go to service dashboard
2. View CPU, Memory, Network usage
3. Monitor request rates

---

## 🎉 Success!

Once deployed, your API will be:
- ✅ Running on Railway's infrastructure
- ✅ Database automatically migrated
- ✅ Auto-scaling based on traffic
- ✅ Monitored 24/7

Your API endpoint: `https://your-app-name.up.railway.app`

---

## 🔄 Updating Your Deployment

To update your app:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. Railway will automatically redeploy!

---

## 📞 Need Help?

- Check Railway logs for error messages
- Review this guide again
- Check Railway documentation: [docs.railway.app](https://docs.railway.app)
- Railway support: [railway.app/discord](https://railway.app/discord)
