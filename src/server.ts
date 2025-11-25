import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import healthRoutes from './routes/health.routes';
import swaggerRoutes from './routes/swagger.routes';
import { errorHandler } from './middleware/errorHandler';
import { initializeDatabase } from './config/initDatabase';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      /^http:\/\/localhost:\d+$/, // Allow any localhost port in development
      'https://gihozoinnocente.github.io', // GitHub Pages frontend
      'https://givelifeapi.up.railway.app', // Backend domain (for Swagger UI)
    ];
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  } : false, // Disable CSP in development for easier testing
  crossOriginEmbedderPolicy: false, // Allow cross-origin requests
}));

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', healthRoutes);
app.use('/api-docs', swaggerRoutes);
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  // Start server FIRST (so healthcheck can pass)
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Blood Donation API ready to accept requests`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  });

  // Then try to initialize database (non-blocking)
  try {
    await initializeDatabase();
    console.log('✅ Database connected and initialized');
  } catch (dbError) {
    console.error('⚠️  Database initialization failed:', dbError);
    console.error('⚠️  Server running without database connection');
    // Don't exit - let server run for healthcheck
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
};

startServer();

export default app;
