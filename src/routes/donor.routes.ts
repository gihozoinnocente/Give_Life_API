import { Router, Request, Response, NextFunction } from 'express';
import { DonorController } from '../controllers/donor.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { query } from '../config/database';

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

/** Badges & Achievements */
router.get('/:donorId/badges', authenticateToken, donorController.getBadges);
router.post('/:donorId/recompute-badges', authenticateToken, donorController.recomputeBadges);

// Authenticated donor: hospital health records
router.get('/me/hospital-health-records', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const result = await query(
      `SELECT
         hr.id,
         hr.hospital_id,
         hp.hospital_name,
         hr.donor_id,
         COALESCE(dp.first_name || ' ' || dp.last_name, hr.patient_name) AS patient_name,
         dp.blood_group AS donor_blood_group,
         hr.patient_name,
         hr.blood_type,
         hr.status,
         hr.last_visit,
         hr.age,
         hr.weight,
         hr.height,
         hr.temperature,
         hr.blood_pressure,
         hr.heart_rate,
         hr.hemoglobin,
         hr.allergies,
         hr.medications,
         hr.chronic_conditions,
         hr.hospital_notes,
         hr.created_at
       FROM hospital_health_records hr
       JOIN hospital_profiles hp ON hp.user_id = hr.hospital_id
       LEFT JOIN donor_profiles dp ON dp.user_id = hr.donor_id
       WHERE hr.donor_id = $1
       ORDER BY hr.created_at DESC`,
      [userId]
    );

    const records = result.rows.map((row) => ({
      id: row.id,
      hospitalId: row.hospital_id,
      hospitalName: row.hospital_name,
      donorId: row.donor_id,
      patientName: row.patient_name,
      bloodType: row.blood_type || row.donor_blood_group,
      status: row.status,
      lastVisit: row.last_visit,
      age: row.age,
      weight: row.weight,
      height: row.height,
      temperature: row.temperature,
      bloodPressure: row.blood_pressure,
      heartRate: row.heart_rate,
      hemoglobin: row.hemoglobin,
      allergies: row.allergies,
      medications: row.medications,
      chronicConditions: row.chronic_conditions,
      hospitalNotes: row.hospital_notes,
      createdAt: row.created_at,
    }));

    res.status(200).json({ status: 'success', data: records });
  } catch (error) {
    next(error);
  }
});

export default router;
