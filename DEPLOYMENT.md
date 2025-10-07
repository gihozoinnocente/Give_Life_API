# Deployment Guide - Railway CI/CD Pipeline

This guide explains how to deploy the Blood Donation API to Railway using the automated CI/CD pipeline.

## 📋 Prerequisites

1. **GitHub Account** - Your code repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Git** - Version control

## 🚀 Initial Setup

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select your `blood-donation-app-api` repository

### Step 2: Configure Railway Environment Variables

In your Railway project dashboard:

1. Click on your service
2. Go to **"Variables"** tab
3. Add the following environment variables:

```env
NODE_ENV=production
PORT=3000
API_VERSION=v1
```

Add additional variables as needed (database credentials, JWT secrets, etc.):

```env
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=blood_donation
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
```

### Step 3: Configure GitHub Secrets

For automated deployments via GitHub Actions:

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Add the following secrets:

#### Required Secrets:

- **`RAILWAY_TOKEN`**
  - Get this from Railway Dashboard → Account Settings → Tokens
  - Click "Create Token" and copy the value
  - Paste it as the secret value in GitHub

#### Optional Secrets:

- **`RAILWAY_SERVICE_NAME`** (default: `blood-donation-api`)
  - Your Railway service name
  - Find it in Railway Dashboard → Your Project → Service Name

### Step 4: Enable GitHub Actions

1. Ensure the `.github/workflows/deploy.yml` file is in your repository
2. Push your code to the `main` branch
3. GitHub Actions will automatically trigger

## 🔄 CI/CD Pipeline Workflow

### Automated Triggers

The pipeline runs automatically on:
- **Push to `main` branch** - Triggers full CI/CD (test, build, deploy)
- **Push to `develop` branch** - Triggers CI only (test, build)
- **Pull requests** to `main` or `develop` - Triggers CI only

### Pipeline Stages

#### 1. **Test and Build** (runs on all triggers)
- Checkout code
- Setup Node.js (tests on v18 and v20)
- Install dependencies
- Run linter
- Run tests
- Build TypeScript to JavaScript
- Upload build artifacts

#### 2. **Deploy to Railway** (only on main branch push)
- Checkout code
- Setup Node.js
- Install Railway CLI
- Deploy to Railway using token
- Send deployment notification

#### 3. **Security Audit** (runs in parallel)
- Run npm audit
- Check for vulnerabilities

## 📦 Deployment Files

### Configuration Files Created

1. **`.github/workflows/deploy.yml`** - GitHub Actions CI/CD workflow
2. **`railway.json`** - Railway deployment configuration
3. **`nixpacks.toml`** - Nixpacks build configuration
4. **`Procfile`** - Process file for Railway
5. **`.env.production`** - Production environment template

## 🛠️ Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

### Using Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Link your project:**
   ```bash
   railway link
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

### Using Railway Dashboard

1. Go to your Railway project
2. Click **"Deploy"** button
3. Railway will automatically detect changes and deploy

## 🔍 Monitoring Deployments

### Check Deployment Status

1. **GitHub Actions:**
   - Go to your repository → Actions tab
   - View workflow runs and logs

2. **Railway Dashboard:**
   - Go to your project → Deployments tab
   - View deployment logs and status

### Health Check

After deployment, verify your API is running:

```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Blood Donation API is running",
  "timestamp": "2025-10-06T18:04:18.000Z"
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Fails
- **Check logs** in GitHub Actions or Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `npm run build`

#### 2. Deployment Fails
- **Verify Railway token** is correct in GitHub secrets
- Check Railway service name matches
- Ensure environment variables are set in Railway

#### 3. Application Crashes
- **Check Railway logs** for error messages
- Verify all required environment variables are set
- Ensure database connection is configured correctly

#### 4. Port Issues
- Railway automatically assigns a PORT
- Ensure your app uses `process.env.PORT`
- Default fallback is 3000

### Debug Commands

```bash
# Test build locally
npm run build

# Test production start locally
npm start

# Check Railway logs
railway logs

# Check Railway status
railway status
```

## 🔐 Security Best Practices

1. **Never commit sensitive data:**
   - Use `.gitignore` for `.env` files
   - Store secrets in Railway dashboard or GitHub Secrets

2. **Rotate tokens regularly:**
   - Update Railway tokens periodically
   - Update GitHub secrets when tokens change

3. **Use environment-specific configs:**
   - Development: `.env`
   - Production: Railway environment variables

4. **Enable security features:**
   - Helmet.js (already configured)
   - CORS with specific origins in production
   - Rate limiting (recommended to add)

## 📊 Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] Environment variables configured in Railway
- [ ] GitHub secrets configured (RAILWAY_TOKEN)
- [ ] Database is set up and accessible
- [ ] Health check endpoint works
- [ ] CORS configured for your frontend domain
- [ ] Security headers enabled (Helmet)
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Backup strategy in place

## 🔄 Updating the Application

### Standard Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "Add your feature"
   ```

3. **Push to GitHub:**
   ```bash
   git push origin feature/your-feature
   ```

4. **Create Pull Request:**
   - GitHub Actions will run CI checks
   - Review and merge to `main`

5. **Automatic Deployment:**
   - Merge triggers deployment to Railway
   - Monitor in GitHub Actions and Railway dashboard

## 📞 Support

### Resources

- **Railway Documentation:** [docs.railway.app](https://docs.railway.app)
- **GitHub Actions Docs:** [docs.github.com/actions](https://docs.github.com/en/actions)
- **Railway Community:** [Discord](https://discord.gg/railway)

### Getting Help

1. Check Railway logs for errors
2. Review GitHub Actions workflow logs
3. Consult Railway documentation
4. Ask in Railway Discord community

## 🎉 Success!

Your Blood Donation API is now deployed with automated CI/CD! Every push to `main` will automatically test, build, and deploy your application to Railway.

**Your API URL:** `https://your-service-name.railway.app`

**Health Check:** `https://your-service-name.railway.app/health`
