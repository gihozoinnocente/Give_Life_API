# Railway Deployment Setup Guide

## Problem: Database Only Works When Local Server is Running

If your app works locally but the Railway deployment only connects to the database when your local server is running, it means **Railway is trying to connect to localhost instead of the Railway PostgreSQL database**.

## Root Cause

Railway provides database credentials via the `DATABASE_URL` environment variable. If this variable is not properly configured in Railway, your app falls back to the localhost configuration, which doesn't exist on Railway's servers.

## Solution: Configure Railway Environment Variables

### Step 1: Add PostgreSQL Database to Railway

1. Go to your Railway project dashboard
2. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically provision a PostgreSQL database

### Step 2: Link Database to Your Service

Railway should automatically set the `DATABASE_URL` environment variable when you add PostgreSQL. To verify:

1. Go to your Railway project
2. Click on your **web service** (not the database)
3. Go to the **"Variables"** tab
4. Check if `DATABASE_URL` exists

### Step 3: Manually Set DATABASE_URL (if needed)

If `DATABASE_URL` is not automatically set:

1. Click on your **PostgreSQL database** service
2. Go to the **"Variables"** tab
3. Copy the `DATABASE_URL` value (it looks like: `postgresql://user:password@host:port/database`)
4. Go back to your **web service**
5. Go to **"Variables"** tab
6. Click **"New Variable"**
7. Set:
   - **Variable Name**: `DATABASE_URL`
   - **Value**: Paste the PostgreSQL connection string

### Step 4: Set Required Environment Variables

Make sure these environment variables are set in your Railway web service:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
```

**Important**: 
- Do NOT set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, or `DB_PASSWORD` individually in production
- Railway uses `DATABASE_URL` which includes all connection details
- The app will automatically use `DATABASE_URL` when available

### Step 5: Reference Database Variables (Alternative Method)

Railway allows you to reference variables from other services:

1. In your web service's **Variables** tab
2. Click **"New Variable"**
3. Click **"Add Reference"**
4. Select your PostgreSQL database
5. Choose `DATABASE_URL`

This creates a dynamic reference that updates automatically if the database credentials change.

### Step 6: Verify Configuration

After setting the environment variables:

1. Go to your web service
2. Click **"Deployments"**
3. Click **"Deploy"** to trigger a new deployment
4. Check the deployment logs for:
   ```
   🔍 Database Configuration:
      NODE_ENV: production
      DATABASE_URL: ✅ Set
   ```

If you see `DATABASE_URL: ❌ Not set`, the environment variable is not configured correctly.

## Debugging Tips

### Check Deployment Logs

1. Go to Railway dashboard
2. Click on your web service
3. Go to **"Deployments"** tab
4. Click on the latest deployment
5. Check the logs for database connection errors

### Common Error Messages

**Error**: `connect ECONNREFUSED 127.0.0.1:5432`
- **Cause**: App is trying to connect to localhost
- **Solution**: Set `DATABASE_URL` environment variable in Railway

**Error**: `password authentication failed`
- **Cause**: Wrong database credentials
- **Solution**: Copy the correct `DATABASE_URL` from the PostgreSQL service

**Error**: `no pg_hba.conf entry for host`
- **Cause**: SSL configuration issue
- **Solution**: The code already handles this (line 18 in `database.ts`)

### Test Database Connection

After deployment, check these endpoints:

1. **Health Check**: `https://your-app.railway.app/health`
2. **API Docs**: `https://your-app.railway.app/api-docs`

If the health check passes but API endpoints fail, the database connection is the issue.

## Railway PostgreSQL Connection Details

Railway automatically provides these variables for PostgreSQL:

- `DATABASE_URL` - Full connection string (use this)
- `PGHOST` - Database host
- `PGPORT` - Database port
- `PGUSER` - Database user
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

**Always use `DATABASE_URL`** as it includes all connection details in the correct format.

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use strong JWT secrets** - Generate with: `openssl rand -base64 32`
3. **Enable SSL in production** - Already configured in `database.ts`
4. **Rotate credentials regularly** - Railway allows regenerating database passwords

## Troubleshooting Checklist

- [ ] PostgreSQL database added to Railway project
- [ ] `DATABASE_URL` environment variable set in web service
- [ ] `NODE_ENV=production` set in Railway
- [ ] `JWT_SECRET` set with a secure value
- [ ] New deployment triggered after setting variables
- [ ] Deployment logs show `DATABASE_URL: ✅ Set`
- [ ] No `DB_HOST=localhost` in Railway environment variables

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway PostgreSQL Guide](https://docs.railway.app/databases/postgresql)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

## Need Help?

If you're still experiencing issues:

1. Check Railway deployment logs for specific error messages
2. Verify `DATABASE_URL` is set correctly (without exposing credentials)
3. Ensure the PostgreSQL service is running in Railway
4. Try redeploying after setting environment variables
