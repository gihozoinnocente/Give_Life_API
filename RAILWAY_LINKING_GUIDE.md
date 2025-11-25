# 🔗 Railway Linking Guide

## Understanding Railway Services

When you run `railway link`, Railway asks you to select a **service**. Here's what each service is for:

### Services You'll See:

1. **`web`** ✅ (Your API Application)
   - This is your Node.js/Express API server
   - **Select this** for API-related commands
   - Used for: deploying code, managing environment variables, viewing logs
   - This is what serves your API endpoints

2. **`Postgres`** (Your Database)
   - This is your PostgreSQL database service
   - **Select this** only if you want to run database commands
   - Used for: database migrations, direct SQL queries, database management
   - Can be linked separately for database operations

## What to Choose Now?

### ✅ Choose `web` if you want to:
- Deploy your API code
- Manage environment variables for your API
- View API logs
- Run API-related commands
- Test your API connection

### Choose `Postgres` if you want to:
- Run database migrations manually
- Execute SQL queries directly
- Access database via psql
- Manage database schema

## For Most Use Cases

**Select `web`** - This is what you need for:
- Setting up environment variables
- Running deployment commands
- Managing your API service

## Linking Both Services

You can link both services if needed:

### Step 1: Link Web Service (Most Common)
```bash
railway link
# Select: web
```

### Step 2: Link Postgres Service (Optional - Only if needed)
```bash
railway link
# Select: Postgres
# This creates a different link configuration
```

## After Linking

Once linked to `web`, you can:

1. **Set Environment Variables:**
   ```bash
   railway variables set JWT_SECRET=your_secret
   ```

2. **Run Commands in Railway Environment:**
   ```bash
   railway run npm run seed:admin
   ```

3. **View Logs:**
   ```bash
   railway logs
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

## Switching Services

To switch to a different service later:
```bash
railway link --service postgres  # Link to database
railway link --service web       # Link to web service
```

Or just run `railway link` again and select a different service.

## Recommendation

For your current task (deploying the API), **select `web`** ✅

This will link your local project to the Railway web service where your API runs.
