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

export default router;
