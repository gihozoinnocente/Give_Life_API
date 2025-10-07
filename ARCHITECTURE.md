# System Architecture - Blood Donation API

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│  (Web Browser, Mobile App, Postman, cURL, etc.)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS Requests
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      EXPRESS SERVER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                         │  │
│  │  • Helmet (Security Headers)                             │  │
│  │  • CORS (Cross-Origin)                                   │  │
│  │  • Morgan (Logging)                                      │  │
│  │  • Body Parser (JSON/URL Encoded)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │  Routes Layer                                             │  │
│  │  • /health          → Health Check                        │  │
│  │  • /api-docs        → Swagger Documentation              │  │
│  │  • /api/auth/*      → Authentication Routes              │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │  Validation Middleware                                    │  │
│  │  • Express-validator                                      │  │
│  │  • Role-specific validation rules                        │  │
│  │  • Input sanitization                                    │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │  Authentication Middleware (Protected Routes)            │  │
│  │  • JWT Token Verification                                │  │
│  │  • Role-Based Access Control                             │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │  Controllers Layer                                        │  │
│  │  • AuthController                                         │  │
│  │    - registerDonor()                                      │  │
│  │    - registerHospital()                                   │  │
│  │    - registerAdmin()                                      │  │
│  │    - registerRBC()                                        │  │
│  │    - registerMinistry()                                   │  │
│  │    - login()                                              │  │
│  │    - getProfile()                                         │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │  Services Layer (Business Logic)                         │  │
│  │  • AuthService                                            │  │
│  │    - Password hashing (bcrypt)                           │  │
│  │    - JWT token generation                                │  │
│  │    - Email validation                                    │  │
│  │    - User registration by role                           │  │
│  │    - Authentication                                      │  │
│  │    - Profile retrieval                                   │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │  Database Layer                                           │  │
│  │  • Connection Pool (pg)                                   │  │
│  │  • Query helpers                                          │  │
│  │  • Transaction support                                   │  │
│  └──────────────────────────┬────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ SQL Queries
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    POSTGRESQL DATABASE                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tables:                                                  │  │
│  │  • users (authentication)                                │  │
│  │  • donor_profiles                                        │  │
│  │  • hospital_profiles                                     │  │
│  │  • admin_profiles                                        │  │
│  │  • rbc_profiles                                          │  │
│  │  • ministry_profiles                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. Registration Flow

```
Client
  │
  │ POST /api/auth/register/donor
  │ { email, password, firstName, ... }
  │
  ▼
Express Middleware
  │
  ├─► Helmet (Security)
  ├─► CORS
  ├─► Body Parser
  │
  ▼
Validation Middleware
  │
  ├─► Validate email format
  ├─► Validate password strength
  ├─► Validate age (18-65)
  ├─► Validate blood group
  ├─► Sanitize inputs
  │
  ▼
Auth Controller
  │
  ├─► Extract request data
  ├─► Call AuthService.registerDonor()
  │
  ▼
Auth Service
  │
  ├─► Check if email exists
  ├─► Hash password (bcrypt)
  ├─► Begin transaction
  ├─► Insert into users table
  ├─► Insert into donor_profiles table
  ├─► Commit transaction
  ├─► Generate JWT token
  │
  ▼
Response
  │
  └─► { status: "success", data: { user, token } }
```

### 2. Login Flow

```
Client
  │
  │ POST /api/auth/login
  │ { email, password }
  │
  ▼
Validation Middleware
  │
  ├─► Validate email format
  ├─► Validate password presence
  │
  ▼
Auth Controller
  │
  ├─► Extract credentials
  ├─► Call AuthService.login()
  │
  ▼
Auth Service
  │
  ├─► Find user by email
  ├─► Verify password (bcrypt.compare)
  ├─► Check if account is active
  ├─► Generate JWT token
  │
  ▼
Response
  │
  └─► { status: "success", data: { user, token } }
```

### 3. Protected Route Flow

```
Client
  │
  │ GET /api/auth/profile
  │ Authorization: Bearer <token>
  │
  ▼
Auth Middleware
  │
  ├─► Extract token from header
  ├─► Verify JWT signature
  ├─► Decode payload
  ├─► Attach user to request
  │
  ▼
Auth Controller
  │
  ├─► Get user from request
  ├─► Call AuthService.getUserProfile()
  │
  ▼
Auth Service
  │
  ├─► Query database by user ID and role
  ├─► Join with appropriate profile table
  ├─► Return complete profile
  │
  ▼
Response
  │
  └─► { status: "success", data: { ...profile } }
```

## Database Schema

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (UUID) PK        │
│ email (UNIQUE)      │
│ password (HASHED)   │
│ role (ENUM)         │
│ is_active           │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:1 relationships
           │
     ┌─────┴─────┬─────────┬─────────┬─────────┐
     │           │         │         │         │
     ▼           ▼         ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ donor_  │ │hospital_│ │ admin_  │ │  rbc_   │ │ministry_│
│profiles │ │profiles │ │profiles │ │profiles │ │profiles │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│  1. Transport Layer                         │
│     • HTTPS (in production)                 │
│     • TLS/SSL encryption                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  2. Application Layer                       │
│     • Helmet (Security headers)             │
│     • CORS (Origin control)                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  3. Input Validation                        │
│     • Express-validator                     │
│     • Type checking                         │
│     • Sanitization                          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  4. Authentication                          │
│     • JWT tokens                            │
│     • Token expiration                      │
│     • Signature verification                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  5. Authorization                           │
│     • Role-based access control             │
│     • Permission checking                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  6. Data Layer                              │
│     • Password hashing (bcrypt)             │
│     • Parameterized queries                 │
│     • SQL injection prevention              │
└─────────────────────────────────────────────┘
```

## Component Responsibilities

### Controllers
- Handle HTTP requests/responses
- Input extraction
- Call appropriate services
- Format responses
- Error handling

### Services
- Business logic
- Data validation
- Database operations
- Password hashing
- Token generation
- Transaction management

### Middleware
- Request preprocessing
- Authentication verification
- Authorization checks
- Input validation
- Error handling
- Logging

### Database Layer
- Connection pooling
- Query execution
- Transaction support
- Error handling

## Technology Stack

```
┌─────────────────────────────────────────────┐
│  Runtime & Language                         │
│  • Node.js (v18+)                          │
│  • TypeScript                               │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Web Framework                              │
│  • Express.js                               │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Database                                   │
│  • PostgreSQL                               │
│  • pg (node-postgres)                       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Authentication & Security                  │
│  • jsonwebtoken (JWT)                       │
│  • bcryptjs (Password hashing)              │
│  • helmet (Security headers)                │
│  • cors (CORS handling)                     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Validation & Utilities                     │
│  • express-validator                        │
│  • dotenv (Environment variables)           │
│  • morgan (Logging)                         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Documentation                              │
│  • swagger-jsdoc                            │
│  • swagger-ui-express                       │
└─────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│  Load Balancer / Reverse Proxy             │
│  (nginx, Railway, etc.)                     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Application Server(s)                      │
│  • Node.js + Express                        │
│  • Multiple instances (horizontal scaling)  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Database Server                            │
│  • PostgreSQL                               │
│  • Connection pooling                       │
│  • Replication (optional)                   │
└─────────────────────────────────────────────┘
```

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless application design
   - JWT tokens (no session storage)
   - Multiple app instances possible

2. **Database Optimization**
   - Connection pooling
   - Indexes on frequently queried fields
   - Prepared statements

3. **Caching** (Future)
   - Redis for session data
   - Query result caching
   - Rate limiting data

4. **Load Balancing** (Future)
   - Round-robin distribution
   - Health checks
   - Failover support
