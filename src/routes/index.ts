import { Router } from 'express';
import donorRoutes from './donor.routes';

const router = Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Mount routes
router.use(`/${API_VERSION}/donors`, donorRoutes);

// Base API info
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Blood Donation API',
    version: API_VERSION,
    endpoints: {
      donors: `/api/${API_VERSION}/donors`,
    },
  });
});

export default router;
