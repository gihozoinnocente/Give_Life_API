# 🔧 Railway CLI Authentication Fix

## The Problem

You're getting this error:
```
Project Token not found
Note: Using RAILWAY_TOKEN environment variable
Error: Process completed with exit code 1.
```

This means the Railway CLI can't find your project configuration or authentication.

## ✅ Solution Steps

### Option 1: Link Your Project (Recommended)

This is the easiest way if you're deploying from your local machine:

#### Step 1: Login to Railway

```bash
railway login
```

This will:
- Open your browser
- Ask you to authorize Railway CLI
- Save your authentication

#### Step 2: Link Your Project

```bash
railway link
```

This will prompt you to:
1. Select your workspace
2. Select your project (e.g., `skillful-bravery`)
3. Select your environment (e.g., `production`)
4. Select your service (e.g., `web`)

This creates a `.railway` folder with your project configuration.

#### Step 3: Deploy

```bash
railway up --service web
```

### Option 2: Use Railway Token (For CI/CD)

If you're using this in GitHub Actions or CI/CD:

#### Step 1: Get Your Railway Token

1. Go to [Railway Dashboard](https://railway.app)
2. Click your profile → **Account Settings**
3. Go to **Tokens** tab
4. Click **"New Token"**
5. Give it a name (e.g., "CI/CD Token")
6. Copy the token (you can only see it once!)

#### Step 2: Set Environment Variable

**For Local Use:**

Windows PowerShell:
```powershell
$env:RAILWAY_TOKEN="your_token_here"
```

Windows CMD:
```cmd
set RAILWAY_TOKEN=your_token_here
```

Linux/Mac:
```bash
export RAILWAY_TOKEN="your_token_here"
```

**For CI/CD (GitHub Actions):**

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click **"New repository secret"**
4. Name: `RAILWAY_TOKEN`
5. Value: Paste your token
6. Save

#### Step 3: Set Project Environment Variable

You also need to specify which project/service to deploy to:

**Option A: Set Project ID in environment variable**

```bash
export RAILWAY_PROJECT_ID="your_project_id"
export RAILWAY_SERVICE_NAME="web"
```

**Option B: Use Railway link first** (creates `.railway` config)

```bash
railway link
railway up --service web
```

### Option 3: Use Railway Dashboard (Easiest)

Instead of using CLI, you can deploy from Railway dashboard:

1. **Go to Railway Dashboard**
2. **Select your project**
3. **Click on your web service**
4. **Go to Settings tab**
5. **Connect GitHub repository** (if not already connected)
6. **Push to GitHub** - Railway will auto-deploy!

## 🔍 Troubleshooting

### Error: "Not authenticated"

**Fix:**
```bash
railway login
```

### Error: "Project not found"

**Fix:**
```bash
railway link
# Select your project from the list
```

### Error: "Service not found"

**Fix:**
1. Check service name is correct: `railway up --service web`
2. Or link again: `railway link` and select the service

### Error: "Token expired or invalid"

**Fix:**
1. Generate a new token from Railway dashboard
2. Update your environment variable or GitHub secret

## 📋 Complete Setup Checklist

### For Local Deployment:

- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Link project: `railway link` (select project, environment, service)
- [ ] Deploy: `railway up --service web`

### For CI/CD (GitHub Actions):

- [ ] Get Railway token from dashboard
- [ ] Add `RAILWAY_TOKEN` to GitHub Secrets
- [ ] (Optional) Add `RAILWAY_PROJECT_ID` and `RAILWAY_SERVICE_NAME` to secrets
- [ ] Push to GitHub - deployment runs automatically

### For Dashboard Deployment (No CLI needed):

- [ ] Connect GitHub repo in Railway dashboard
- [ ] Push to GitHub
- [ ] Railway auto-deploys!

## 🎯 Recommended Approach

### If deploying manually:
```bash
# One-time setup
railway login
railway link

# Every time you want to deploy
railway up --service web
```

### If using GitHub Actions:
1. Connect repo in Railway dashboard
2. Push to GitHub
3. Railway auto-deploys (no CLI needed)

### If deploying from local machine:
```bash
railway login
railway link
railway up --service web
```

## 🔐 Security Notes

- **Never commit** `.railway` folder or tokens to Git
- **Add to .gitignore:**
  ```
  .railway/
  .railway/*
  ```

- **Use environment variables** for tokens (never hardcode)

## ✅ Quick Fix Commands

If you just want to get it working quickly:

```bash
# 1. Login
railway login

# 2. Link (select your project/service)
railway link

# 3. Deploy
railway up --service web
```

That's it! The `.railway` folder will be created automatically with your project configuration.

## 🆘 Still Having Issues?

### Check Railway CLI is installed:
```bash
railway --version
```

### Check you're logged in:
```bash
railway whoami
```

### Check linked project:
```bash
railway status
```

### Unlink and re-link if needed:
```bash
railway unlink
railway link
```

---

**The easiest solution:** Just use `railway link` to connect your local project to Railway, then `railway up` to deploy! 🚀
