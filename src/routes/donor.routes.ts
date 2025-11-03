import { Router } from 'express';
import { DonorController } from '../controllers/donor.controller';

const router = Router();
const donorController = new DonorController();

/**
 * @swagger
 * /api/donors:
 *   get:
 *     summary: Get all blood donors
 *     description: Retrieve a list of all registered blood donors
 *     tags: [Donors]
 *     responses:
 *       200:
 *         description: List of donors retrieved successfully
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
 */
router.get('/', donorController.getAllDonors);

/**
 * @swagger
 * /api/donors/{id}:
 *   get:
 *     summary: Get donor by ID
 *     description: Retrieve a specific blood donor by their ID
 *     tags: [Donors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The donor ID
 *     responses:
 *       200:
 *         description: Donor found
 *       404:
 *         description: Donor not found
 */
router.get('/:id', donorController.getDonorById);

/**
 * @swagger
 * /api/donors/search:
 *   get:
 *     summary: Search donors with filters
 *     description: Search for blood donors using various filters
 *     tags: [Donors]
 *     parameters:
 *       - in: query
 *         name: bloodGroup
 *         schema:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Donors retrieved successfully
 */
router.get('/search', donorController.searchDonors);

/**
 * @swagger
 * /api/donors/blood-group/{bloodGroup}:
 *   get:
 *     summary: Get donors by blood group
 *     description: Retrieve all donors with a specific blood group
 *     tags: [Donors]
 *     parameters:
 *       - in: path
 *         name: bloodGroup
 *         required: true
 *         schema:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *     responses:
 *       200:
 *         description: Donors retrieved successfully
 */
router.get('/blood-group/:bloodGroup', donorController.getDonorsByBloodGroup);

export default router;
