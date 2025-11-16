import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { HospitalController } from '../controllers/hospital.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../types';
import { validateHospitalRegistration } from '../middleware/validation.middleware';

const router = Router();
const authController = new AuthController();
const hospitalController = new HospitalController();

/**
 * Admin-only: Register a hospital account
 */
router.post(
  '/hospitals',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateHospitalRegistration,
  authController.registerHospital
);

/**
 * Admin-only: List all hospitals (optional; admin can also use public list)
 */
router.get(
  '/hospitals',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  hospitalController.getAllHospitals
);

export default router;
