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
 * @swagger
 * /api/admin/hospitals:
 *   post:
 *     summary: Register a hospital account (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - hospitalName
 *               - address
 *               - headOfHospital
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               hospitalName:
 *                 type: string
 *               address:
 *                 type: string
 *               headOfHospital:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hospital registered successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Email already registered
 */
router.post(
  '/hospitals',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateHospitalRegistration,
  authController.registerHospital
);

/**
 * @swagger
 * /api/admin/hospitals:
 *   get:
 *     summary: List all hospitals (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all hospitals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get(
  '/hospitals',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  hospitalController.getAllHospitals
);

/**
 * @swagger
 * /api/admin/reset-password:
 *   post:
 *     summary: Reset user password by email (Admin only)
 *     description: Allows an admin to reset a user's password when they forgot it. Requires user email, new password, and password confirmation.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user whose password needs to be reset
 *                 example: user@example.com
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (minimum 6 characters)
 *                 example: NewSecurePassword123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the new password (must match newPassword)
 *                 example: NewSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Bad request (missing fields, passwords don't match, password too short, or user not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: New password and confirm password do not match
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/reset-password',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  authController.resetUserPassword
);

export default router;
