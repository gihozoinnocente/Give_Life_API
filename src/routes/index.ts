import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Mount routes
router.use('/auth', authRoutes);

// Base API info
router.get('/', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Blood Donation API',
    version: API_VERSION,
    endpoints: {
      auth: '/api/auth',
      register: {
        donor: '/api/auth/register/donor',
        hospital: '/api/auth/register/hospital',
        admin: '/api/auth/register/admin',
        rbc: '/api/auth/register/rbc',
        ministry: '/api/auth/register/ministry',
      },
      login: '/api/auth/login',
      profile: '/api/auth/profile',
    },
  });
});

export default router;
