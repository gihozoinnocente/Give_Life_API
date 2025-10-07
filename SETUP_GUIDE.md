# Quick Setup Guide - Blood Donation API

## Step-by-Step Setup

### 1. Install PostgreSQL

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install pgAdmin (included with PostgreSQL installer)
- Remember your postgres password during installation

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

### 2. Create Database

Open pgAdmin or use psql:

```sql
CREATE DATABASE blood_donation;
```

### 3. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3000
NODE_ENV=development
API_VERSION=v1

DB_HOST=localhost
DB_PORT=5432
DB_NAME=blood_donation
DB_USER=postgres
DB_PASSWORD=your_actual_password

JWT_SECRET=change_this_to_a_random_secure_string
JWT_EXPIRES_IN=7d
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Server

```bash
npm run dev
```

You should see:
```
🔄 Initializing database schema...
✅ Database schema initialized successfully
✅ Connected to PostgreSQL database
🚀 Server is running on port 3000
📍 Environment: development
🏥 Blood Donation API ready to accept requests
📚 API Documentation: http://localhost:3000/api-docs
```

### 6. Test the API

Open your browser and go to:
```
http://localhost:3000/api-docs
```

Or test with curl:
```bash
curl http://localhost:3000/health
```

## Common Issues

### Issue: Database connection error

**Solution:** Check your PostgreSQL is running:
```bash
# Windows
services.msc (look for postgresql service)

# Mac
brew services list

# Linux
sudo systemctl status postgresql
```

### Issue: Port 3000 already in use

**Solution:** Change PORT in `.env` file or kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Issue: JWT_SECRET not defined

**Solution:** Make sure `.env` file exists and JWT_SECRET is set

## Next Steps

1. Register a donor account using Swagger UI or curl
2. Login to get JWT token
3. Use token to access protected routes
4. Explore API documentation at `/api-docs`

## Need Help?

Check the following files:
- `README.md` - Full documentation
- `API_EXAMPLES.md` - Request/response examples
- Swagger UI - Interactive API documentation
