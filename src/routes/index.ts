import { Router } from 'express';

const router = Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Base API info
router.get('/', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Blood Donation API',
    version: API_VERSION,
    endpoints: {},
  });
});

export default router;
