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
 * /api/donors:
 *   post:
 *     summary: Register a new blood donor
 *     description: Create a new blood donor profile
 *     tags: [Donors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - bloodType
 *               - contact
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               bloodType:
 *                 type: string
 *                 example: O+
 *               contact:
 *                 type: string
 *                 example: +250788123456
 *     responses:
 *       201:
 *         description: Donor created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', donorController.createDonor);

/**
 * @swagger
 * /api/donors/{id}:
 *   put:
 *     summary: Update donor information
 *     description: Update an existing blood donor's profile
 *     tags: [Donors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The donor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Donor updated successfully
 *       404:
 *         description: Donor not found
 */
router.put('/:id', donorController.updateDonor);

/**
 * @swagger
 * /api/donors/{id}:
 *   delete:
 *     summary: Delete a donor
 *     description: Remove a blood donor from the system
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
 *         description: Donor deleted successfully
 *       404:
 *         description: Donor not found
 */
router.delete('/:id', donorController.deleteDonor);

export default router;
