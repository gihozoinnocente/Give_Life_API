import { Router } from 'express';
import { HospitalController } from '../controllers/hospital.controller';

const router = Router();
const hospitalController = new HospitalController();

/**
 * @swagger
 * /api/hospitals:
 *   get:
 *     summary: Get all hospitals
 *     description: Retrieve a list of all registered hospitals
 *     tags: [Hospitals]
 *     responses:
 *       200:
 *         description: List of hospitals retrieved successfully
 */
router.get('/', hospitalController.getAllHospitals);

/**
 * @swagger
 * /api/hospitals/search:
 *   get:
 *     summary: Search hospitals
 *     description: Search for hospitals by name or location
 *     tags: [Hospitals]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for hospital name or address
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 */
router.get('/search', hospitalController.searchHospitals);

/**
 * @swagger
 * /api/hospitals/{id}:
 *   get:
 *     summary: Get hospital by ID
 *     description: Retrieve a specific hospital by their ID
 *     tags: [Hospitals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The hospital ID
 *     responses:
 *       200:
 *         description: Hospital found
 *       404:
 *         description: Hospital not found
 */
router.get('/:id', hospitalController.getHospitalById);

/**
 * @swagger
 * /api/hospitals/{id}/donors:
 *   get:
 *     summary: Get donors who opted-in for a hospital
 *     tags: [Hospitals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donors retrieved successfully
 */
router.get('/:id/donors', hospitalController.getHospitalDonors);

/**
 * @swagger
 * /api/hospitals/{id}/recognition:
 *   get:
 *     summary: Get donor recognition stats for a hospital
 *     tags: [Hospitals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recognition stats retrieved successfully
 */
router.get('/:id/recognition', hospitalController.getRecognition);

/**
 * @swagger
 * /api/hospitals/{id}/health-records:
 *   get:
 *     summary: Get health records for a hospital
 *     tags: [Hospitals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: donorId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health records retrieved successfully
 */
router.get('/:id/health-records', hospitalController.getHealthRecords);

/**
 * @swagger
 * /api/hospitals/{id}/health-records:
 *   post:
 *     summary: Create a new health record for a donor at this hospital
 *     tags: [Hospitals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               donorId:
 *                 type: string
 *               patientName:
 *                 type: string
 *               bloodType:
 *                 type: string
 *               status:
 *                 type: string
 *               lastVisit:
 *                 type: string
 *                 format: date-time
 *               age:
 *                 type: number
 *               weight:
 *                 type: number
 *               temperature:
 *                 type: number
 *               bloodPressure:
 *                 type: string
 *               heartRate:
 *                 type: number
 *               hemoglobin:
 *                 type: number
 *               allergies:
 *                 type: string
 *               medications:
 *                 type: string
 *               chronicConditions:
 *                 type: string
 *               hospitalNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Health record created successfully
 */
router.post('/:id/health-records', hospitalController.createHealthRecord);

/**
 * @swagger
 * /api/hospitals/{hospitalId}/opt-in:
 *   get:
 *     summary: Donor opt-in confirmation via email link
 *     tags: [Hospitals]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donor opt-in recorded
 */
router.get('/:hospitalId/opt-in', hospitalController.optInDonor);

export default router;
