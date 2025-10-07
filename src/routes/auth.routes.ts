import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  validateDonorRegistration,
  validateHospitalRegistration,
  validateAdminRegistration,
  validateRBCRegistration,
  validateMinistryRegistration,
  validateLogin,
} from '../middleware/validation.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/register/donor:
 *   post:
 *     summary: Register as a donor
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - address
 *               - age
 *               - bloodGroup
 *               - district
 *               - state
 *               - pinCode
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               age:
 *                 type: number
 *               bloodGroup:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               district:
 *                 type: string
 *               state:
 *                 type: string
 *               pinCode:
 *                 type: string
 *               lastDonationMonth:
 *                 type: string
 *               lastDonationYear:
 *                 type: string
 *     responses:
 *       201:
 *         description: Donor registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already registered
 */
router.post('/register/donor', validateDonorRegistration, authController.registerDonor);

/**
 * @swagger
 * /api/auth/register/hospital:
 *   post:
 *     summary: Register as a hospital
 *     tags: [Authentication]
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
 *       409:
 *         description: Email already registered
 */
router.post('/register/hospital', validateHospitalRegistration, authController.registerHospital);

/**
 * @swagger
 * /api/auth/register/admin:
 *   post:
 *     summary: Register as an admin
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already registered
 */
router.post('/register/admin', validateAdminRegistration, authController.registerAdmin);

/**
 * @swagger
 * /api/auth/register/rbc:
 *   post:
 *     summary: Register as RBC (Rwanda Biomedical Center)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - officeName
 *               - contactPerson
 *               - phoneNumber
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               officeName:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: RBC registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already registered
 */
router.post('/register/rbc', validateRBCRegistration, authController.registerRBC);

/**
 * @swagger
 * /api/auth/register/ministry:
 *   post:
 *     summary: Register as Ministry
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - departmentName
 *               - contactPerson
 *               - phoneNumber
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               departmentName:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ministry registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already registered
 */
router.post('/register/ministry', validateMinistryRegistration, authController.registerMinistry);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials or account deactivated
 */
router.post('/login', validateLogin, authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/profile', authenticateToken, authController.getProfile);

export default router;
