# Quick Start - Blood Donation API

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites Check
```bash
node --version  # Should be v18+
psql --version  # Should be v12+
```

### 2. Setup Database
```sql
-- In pgAdmin or psql
CREATE DATABASE blood_donation;
```

### 3. Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your PostgreSQL password
# Change JWT_SECRET to a secure random string
```

### 4. Install & Run
```bash
npm install
npm run dev
```

### 5. Test It!

**Open Swagger UI:**
```
http://localhost:3000/api-docs
```

**Or use curl:**
```bash
# Register a donor
curl -X POST http://localhost:3000/api/auth/register/donor \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "+250788123456",
    "address": "Kigali",
    "age": 25,
    "bloodGroup": "O+",
    "district": "Gasabo",
    "state": "Kigali",
    "pinCode": "00100"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## 📋 Registration Fields by Role

### Donor
✅ email, password, firstName, lastName, phoneNumber, address, age, bloodGroup, district, state, pinCode

### Hospital
✅ email, password, hospitalName, address, headOfHospital, phoneNumber

### Admin
✅ email, password, firstName, lastName, phoneNumber

### RBC
✅ email, password, officeName, contactPerson, phoneNumber, address

### Ministry
✅ email, password, departmentName, contactPerson, phoneNumber, address

## 🔑 Authentication

1. Register or login → Get JWT token
2. Use token in headers: `Authorization: Bearer <token>`
3. Access protected routes

## 📚 Documentation

- **Full Guide:** `README.md`
- **API Examples:** `API_EXAMPLES.md`
- **Setup Help:** `SETUP_GUIDE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Swagger UI:** `http://localhost:3000/api-docs`

## ❓ Troubleshooting

**Database connection error?**
- Check PostgreSQL is running
- Verify credentials in `.env`

**Port already in use?**
- Change PORT in `.env`

**Need help?**
- Check `SETUP_GUIDE.md` for common issues
