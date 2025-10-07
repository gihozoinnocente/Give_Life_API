# Blood Donation App API

A modern Node.js backend application built with Express and TypeScript for managing blood donation operations with role-based authentication.

## Live Demo

Visit the live application - Swagger Documentation: [https://givelifeapi.up.railway.app/api-docs/](https://givelifeapi.up.railway.app/api-docs/)

## 🚀 Features

- **TypeScript** - Type-safe code with modern ES features
- **Express.js** - Fast and minimalist web framework
- **PostgreSQL** - Robust relational database with pgAdmin support
- **Role-Based Authentication** - JWT-based auth with 5 user roles (Donor, Hospital, Admin, RBC, Ministry)
- **Security** - Helmet for security headers, CORS enabled, bcrypt password hashing
- **Validation** - Express-validator for input validation
- **Logging** - Morgan for HTTP request logging
- **Error Handling** - Centralized error handling middleware
- **Environment Config** - dotenv for environment variables
- **API Documentation** - Swagger/OpenAPI documentation
- **RESTful API** - Well-structured API endpoints

## 📁 Project Structure

```
blood-donation-app-api/
├── src/
│   ├── config/           # Database and app configuration
│   │   ├── database.ts   # PostgreSQL connection pool
│   │   ├── schema.sql    # Database schema
│   │   └── initDatabase.ts
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   └── donor.controller.ts
│   ├── middleware/       # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── errorHandler.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   └── index.ts
│   ├── services/        # Business logic
│   │   └── auth.service.ts
│   ├── types/           # TypeScript types and interfaces
│   │   └── index.ts
│   └── server.ts        # Application entry point
├── dist/                # Compiled JavaScript (generated)
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- pgAdmin (optional, for database management)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd blood-donation-app-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL Database:**
   
   Using pgAdmin or psql:
   ```sql
   CREATE DATABASE blood_donation;
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   API_VERSION=v1
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=blood_donation
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT Authentication
   JWT_SECRET=your_secure_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

5. **Initialize the database:**
   
   The database schema will be automatically initialized when you start the server for the first time. The schema includes:
   - Users table (main authentication)
   - Donor profiles table
   - Hospital profiles table
   - Admin profiles table
   - RBC profiles table
   - Ministry profiles table

6. **Run in development mode:**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3000`

7. **Access API Documentation:**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000/api-docs
   ```

8. **Build for production:**
   ```bash
   npm run build
   ```

9. **Start production server:**
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Health Check
- `GET /health` - Check API status

### Authentication

#### Registration Endpoints
- `POST /api/auth/register/donor` - Register as a donor
- `POST /api/auth/register/hospital` - Register as a hospital
- `POST /api/auth/register/admin` - Register as an admin
- `POST /api/auth/register/rbc` - Register as RBC (Rwanda Biomedical Center)
- `POST /api/auth/register/ministry` - Register as Ministry

#### Login
- `POST /api/auth/login` - Login with email and password

#### Profile
- `GET /api/auth/profile` - Get current user profile (requires authentication)

## 🔐 User Roles

The system supports 5 different user roles, each with specific registration fields:

### 1. Donor
Required fields:
- email
- password
- firstName
- lastName
- phoneNumber
- address
- age (18-65)
- bloodGroup (A+, A-, B+, B-, AB+, AB-, O+, O-)
- district
- state
- pinCode
- lastDonationMonth (optional)
- lastDonationYear (optional)

### 2. Hospital
Required fields:
- email
- password
- hospitalName
- address
- headOfHospital
- phoneNumber

### 3. Admin
Required fields:
- email
- password
- firstName
- lastName
- phoneNumber

### 4. RBC (Rwanda Biomedical Center)
Required fields:
- email
- password
- officeName
- contactPerson
- phoneNumber
- address

### 5. Ministry
Required fields:
- email
- password
- departmentName
- contactPerson
- phoneNumber
- address

## 🧪 Testing the API

### Using cURL

#### 1. Register as a Donor
```bash
curl -X POST http://localhost:3000/api/auth/register/donor \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+250788123456",
    "address": "123 Main Street, Kigali",
    "age": 25,
    "bloodGroup": "O+",
    "district": "Gasabo",
    "state": "Kigali City",
    "pinCode": "00100",
    "lastDonationMonth": "January",
    "lastDonationYear": "2024"
  }'
```

#### 2. Register as a Hospital
```bash
curl -X POST http://localhost:3000/api/auth/register/hospital \
  -H "Content-Type: application/json" \
  -d '{
    "email": "info@kigalihospital.com",
    "password": "hospitalPass123",
    "hospitalName": "Kigali Central Hospital",
    "address": "KN 4 Ave, Kigali",
    "headOfHospital": "Dr. Jane Smith",
    "phoneNumber": "+250788999888"
  }'
```

#### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

#### 4. Get Profile (with JWT token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Using Postman

1. Import the API endpoints from Swagger documentation
2. Set up environment variables for base URL and token
3. Use the examples above as request bodies

### Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "donor"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description",
  "errors": []
}
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run lint` - Lint code with ESLint

## 🔒 Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blood_donation
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Authentication
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=7d
```

## 🔑 Authentication Flow

1. **Register** - Choose appropriate registration endpoint based on role
2. **Receive JWT Token** - Token is returned in the response
3. **Use Token** - Include token in Authorization header for protected routes:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
4. **Token Expiry** - Tokens expire after 7 days (configurable)

## 🛡️ Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Different permissions for different user types
- **Input Validation** - Express-validator for all inputs
- **SQL Injection Protection** - Parameterized queries
- **CORS** - Configurable cross-origin resource sharing
- **Helmet** - Security headers

## 🗄️ Database Schema

The application uses PostgreSQL with the following tables:

- **users** - Main authentication table
- **donor_profiles** - Donor-specific information
- **hospital_profiles** - Hospital-specific information
- **admin_profiles** - Admin-specific information
- **rbc_profiles** - RBC-specific information
- **ministry_profiles** - Ministry-specific information

All tables include:
- UUID primary keys
- Timestamps (created_at, updated_at)
- Foreign key relationships
- Indexes for performance

## 🚀 Deployment

This project includes automated CI/CD pipeline for Railway deployment.

### Quick Deploy to Railway

1. **Fork/Clone this repository**
2. **Create a Railway account** at [railway.app](https://railway.app)
3. **Add PostgreSQL database** in Railway
4. **Connect your GitHub repository** to Railway
5. **Configure environment variables** in Railway dashboard
6. **Push to main branch** - Automatic deployment via GitHub Actions!

### CI/CD Features

- ✅ Automated testing on push
- ✅ TypeScript build validation
- ✅ Security audits
- ✅ Multi-version Node.js testing (18.x, 20.x)
- ✅ Automatic deployment to Railway on main branch
- ✅ Health check monitoring

## 🚧 Next Steps / Roadmap

- [x] PostgreSQL database integration
- [x] Role-based authentication & authorization
- [x] Input validation with express-validator
- [x] API documentation (Swagger/OpenAPI)
- [x] Database schema and migrations
- [ ] Set up unit and integration tests
- [ ] Implement rate limiting
- [ ] Add email verification
- [ ] Password reset functionality
- [ ] Refresh token mechanism
- [ ] Blood donation request management
- [ ] Blood inventory tracking
- [ ] Notification system

## 📄 License

ISC
