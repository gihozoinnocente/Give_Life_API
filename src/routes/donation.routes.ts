import { Router } from 'express';
import { DonationController } from '../controllers/donation.controller';

const router = Router();
const donationController = new DonationController();

/**
 * @swagger
 * /api/donations/donor/{donorId}:
 *   get:
 *     summary: Get all donations for a donor
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: donorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donations retrieved successfully
 */
router.get('/donor/:donorId', donationController.getDonorDonations);

/**
 * @swagger
 * /api/donations/hospital/{hospitalId}:
 *   get:
 *     summary: Get all donations for a hospital
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donations retrieved successfully
 */
router.get('/hospital/:hospitalId', donationController.getHospitalDonations);

/**
 * @swagger
 * /api/donations/donor/{donorId}/stats:
 *   get:
 *     summary: Get donation statistics for a donor
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: donorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/donor/:donorId/stats', donationController.getDonorStats);

/**
 * @swagger
 * /api/donations:
 *   post:
 *     summary: Create a new donation record
 *     tags: [Donations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - donorId
 *               - hospitalId
 *               - date
 *               - bloodType
 *               - units
 *     responses:
 *       201:
 *         description: Donation created successfully
 */
router.post('/', donationController.createDonation);

/**
 * @swagger
 * /api/donations/{id}:
 *   get:
 *     summary: Get donation by ID
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donation retrieved successfully
 */
router.get('/:id', donationController.getDonationById);

/**
 * @swagger
 * /api/donations/{id}/status:
 *   patch:
 *     summary: Update donation status
 *     tags: [Donations]
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
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/:id/status', donationController.updateDonationStatus);

export default router;
