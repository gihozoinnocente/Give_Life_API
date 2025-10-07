# Blood Donation App API

A modern Node.js backend application built with Express and TypeScript for managing blood donation operations.

## Live Demo

Visit the live application - Swagger Documentation: [https://givelifeapi.up.railway.app/api-docs/](https://givelifeapi.up.railway.app/api-docs/)
Deployed Version: [https://givelifeapi.up.railway.app/](https://givelifeapi.up.railway.app/)

## 🚀 Features

- **TypeScript** - Type-safe code with modern ES features
- **Express.js** - Fast and minimalist web framework
- **Security** - Helmet for security headers, CORS enabled
- **Logging** - Morgan for HTTP request logging
- **Error Handling** - Centralized error handling middleware
- **Environment Config** - dotenv for environment variables
- **RESTful API** - Well-structured API endpoints

## 📁 Project Structure

```
blood-donation-app-api/
├── src/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware
│   ├── routes/           # API routes
│   ├── types/            # TypeScript types and interfaces
│   └── server.ts         # Application entry point
├── dist/                 # Compiled JavaScript (generated)
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your settings.

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Start production server:**
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Health Check
- `GET /health` - Check API status

### Donors
- `GET /api/v1/donors` - Get all donors
- `GET /api/v1/donors/:id` - Get donor by ID
- `POST /api/v1/donors` - Create new donor
- `PUT /api/v1/donors/:id` - Update donor
- `DELETE /api/v1/donors/:id` - Delete donor

## 🧪 Testing

Test the API using curl, Postman, or any HTTP client:

```bash
# Health check
curl http://localhost:3000/health

# Get API info
curl http://localhost:3000/api
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
```

## 🚀 Deployment

This project includes automated CI/CD pipeline for Railway deployment.

### Quick Deploy to Railway

1. **Fork/Clone this repository**
2. **Create a Railway account** at [railway.app](https://railway.app)
3. **Connect your GitHub repository** to Railway
4. **Configure environment variables** in Railway dashboard
5. **Push to main branch** - Automatic deployment via GitHub Actions!

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### CI/CD Features

- ✅ Automated testing on push
- ✅ TypeScript build validation
- ✅ Security audits
- ✅ Multi-version Node.js testing (18.x, 20.x)
- ✅ Automatic deployment to Railway on main branch
- ✅ Health check monitoring

## 🚧 Next Steps

- [ ] Add database integration (PostgreSQL, MongoDB, etc.)
- [ ] Implement authentication & authorization
- [ ] Add input validation with express-validator
- [ ] Set up unit and integration tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement rate limiting
- [ ] Add database models and migrations

## 📄 License

ISC
