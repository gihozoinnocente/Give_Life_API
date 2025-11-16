import { Router } from 'express';
import authRoutes from './auth.routes';
import donorRoutes from './donor.routes';
import hospitalRoutes from './hospital.routes';
import notificationRoutes from './notification.routes';
import donationRoutes from './donation.routes';
import appointmentRoutes from './appointment.routes';
import inventoryRoutes from './inventory.routes';
import requestRoutes from './request.routes';
import communityRoutes from './community.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';

const router = Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Mount routes
router.use('/auth', authRoutes);
router.use('/donors', donorRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/notifications', notificationRoutes);
router.use('/donations', donationRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/requests', requestRoutes);
router.use('/community', communityRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

// Base API info
router.get('/', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Blood Donation API',
    version: API_VERSION,
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      register: {
        donor: '/api/auth/register/donor',
        hospital: '/api/auth/register/hospital',
        admin: '/api/auth/register/admin',
        rbc: '/api/auth/register/rbc',
        ministry: '/api/auth/register/ministry',
      },
      login: '/api/auth/login',
      profile: '/api/auth/profile',
      donors: '/api/donors',
      hospitals: '/api/hospitals',
      notifications: '/api/notifications',
      bloodRequests: '/api/notifications/blood-request',
      donations: '/api/donations',
      appointments: '/api/appointments',
      inventory: '/api/inventory',
      requests: '/api/requests',
      community: '/api/community',
      analytics: '/api/analytics',
    },
  });
});

export default router;
