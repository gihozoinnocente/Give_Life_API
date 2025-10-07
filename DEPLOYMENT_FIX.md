# Deployment Issue Fix - Railway Nixpacks Error

## Problem
The deployment was failing during the Nixpacks build phase with a Nix environment error at stage-0.

## Root Cause
1. **Incorrect Nixpacks package name**: Used `nodejs-20_x` instead of `nodejs_20`
2. **Conflicting build commands**: The `postinstall` script in package.json was causing conflicts
3. **Redundant build configuration**: Duplicate build commands in railway.json

## Changes Made

### 1. Fixed `nixpacks.toml`
**Before:**
```toml
[phases.setup]
nixPkgs = ['nodejs-20_x']  # ❌ Invalid package name

[phases.install]
cmds = ['npm ci']
```

**After:**
```toml
[phases.setup]
nixPkgs = ['nodejs_20']  # ✅ Correct package name

[phases.install]
cmds = ['npm install']  # Changed to npm install for better compatibility
```

### 2. Cleaned up `package.json`
**Removed:**
- `postinstall` script (causes conflicts during Railway deployment)
- `railway:build` script (redundant with nixpacks.toml)
- `railway:start` script (redundant with Procfile)

### 3. Simplified `railway.json`
**Before:**
```json
"build": {
  "builder": "NIXPACKS",
  "buildCommand": "npm install && npm run build"  // Redundant
}
```

**After:**
```json
"build": {
  "builder": "NIXPACKS"  // Let nixpacks.toml handle build commands
}
```

## How to Deploy

### Option 1: Push to GitHub (Recommended)
```bash
git add .
git commit -m "fix: resolve Railway Nixpacks deployment error"
git push origin main
```
The GitHub Actions workflow will automatically deploy to Railway.

### Option 2: Manual Railway Deployment
```bash
railway up
```

## Verification Steps

1. **Check build logs** in Railway dashboard
2. **Wait for deployment** to complete (usually 2-5 minutes)
3. **Test health endpoint:**
   ```bash
   curl https://your-app.railway.app/health
   ```
4. **Expected response:**
   ```json
   {
     "status": "success",
     "message": "Blood Donation API is running",
     "timestamp": "2025-10-07T08:24:00.000Z"
   }
   ```

## Additional Notes

- **Node.js version**: Using Node.js 20 (specified in nixpacks.toml)
- **Build process**: Nixpacks handles the build automatically
- **Start command**: Defined in Procfile and railway.json
- **Health check**: Configured at `/health` endpoint

## If Issues Persist

1. Check Railway logs for specific errors
2. Verify all environment variables are set in Railway dashboard
3. Ensure GitHub secrets (RAILWAY_TOKEN) are correctly configured
4. Try clearing Railway cache and redeploying

## References

- [Nixpacks Documentation](https://nixpacks.com/docs)
- [Railway Deployment Guide](https://docs.railway.app/deploy/deployments)
- [Node.js Nixpacks Provider](https://nixpacks.com/docs/providers/node)
