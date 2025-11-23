import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './config/initDatabase';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

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

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
