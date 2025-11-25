# 🗄️ Railway Database Migration Guide

## ✅ Recommended: Automatic Migration

**Your database will be automatically migrated when your server starts!**

The server automatically runs the schema migration on startup. Just deploy your app and the tables will be created automatically.

## ❌ Why `railway run` Doesn't Work

When you run `railway run node scripts/migrate-railway.js`, Railway provides a `DATABASE_URL` with an internal hostname like:
```
postgresql://postgres:***@postgres.railway.internal:5432/railway
```

The `.internal` hostname **only works inside Railway's infrastructure**, not from your local machine. That's why you get the `ENOTFOUND` error.

## ✅ Migration Options

### Option 1: Automatic Migration (Recommended) ⭐

**Just deploy your app!** The migration happens automatically.

1. Deploy your API to Railway
2. When the server starts, it automatically runs `initializeDatabase()`
3. All tables are created automatically
4. Check logs to see: `✅ Database schema initialized successfully`

**No manual steps needed!**

### Option 2: Get External DATABASE_URL

If you really need to run migration manually:

1. **Get External Connection String:**
   - Go to Railway Dashboard
   - Click on your **PostgreSQL** service
   - Go to **Variables** tab
   - Look for `DATABASE_URL` (or `PGHOST`, `PGPORT`, etc.)
   - Copy the connection string (should have `.railway.app` domain, NOT `.internal`)

2. **Run Migration:**
   ```bash
   DATABASE_URL="postgresql://user:pass@your-db.railway.app:5432/railway" node scripts/migrate-railway.js
   ```

### Option 3: Use Railway Connect

1. **Link to Postgres service:**
   ```bash
   railway link
   # Select: Postgres
   ```

2. **Connect to database:**
   ```bash
   railway connect postgres
   ```

3. **Run SQL manually:**
   - This opens a psql session
   - Copy contents of `src/config/schema.sql`
   - Paste and execute

## 🔍 How to Verify Migration

### After Deployment:

1. **Check Railway Logs:**
   - Go to your web service in Railway
   - View deployment logs
   - Look for: `✅ Database schema initialized successfully`

2. **Test API Endpoints:**
   - Try registering a user
   - If it works, tables exist!

3. **Check Tables (Using Railway Connect):**
   ```bash
   railway link  # Select Postgres
   railway connect postgres
   ```
   Then in psql:
   ```sql
   \dt  -- List all tables
   SELECT * FROM users;  -- Check if tables have data
   ```

## 🚀 Deployment Flow

```
1. Push code to GitHub
   ↓
2. Railway deploys automatically
   ↓
3. Server starts → initializeDatabase() runs
   ↓
4. Schema.sql is executed → Tables created
   ↓
5. ✅ Migration complete!
```

## 🐛 Troubleshooting

### Error: `ENOTFOUND postgres.railway.internal`

**Cause:** Trying to use internal hostname from local machine.

**Solution:** 
- Just deploy your app - migration is automatic
- OR use external DATABASE_URL (Option 2 above)

### Tables Not Created After Deployment

**Check:**
1. Railway logs for errors
2. Database is linked to web service (Service Dependencies)
3. DATABASE_URL is set in environment variables

**Fix:**
- Check logs for specific errors
- Ensure database is running
- Re-deploy to trigger migration again

### Migration Runs Multiple Times

**This is safe!** The schema uses `CREATE TABLE IF NOT EXISTS`, so:
- Existing tables are not affected
- Missing tables are created
- Safe to run multiple times

You might see: `ℹ️  Tables already exist - this is normal`

## 💡 Best Practice

**Don't run migrations manually!** 

Just deploy your app and let automatic migration handle it. This ensures:
- ✅ Migrations run in the correct environment
- ✅ No connection issues
- ✅ Consistent with your deployment process
- ✅ Less work for you!

## 📝 Summary

| Method | When to Use | Difficulty |
|--------|-------------|------------|
| **Automatic** | Always (recommended) | ⭐ Easy |
| External URL | Manual testing | ⭐⭐ Medium |
| Railway Connect | Debugging | ⭐⭐⭐ Advanced |

**Bottom line:** Just deploy - it works automatically! 🚀
