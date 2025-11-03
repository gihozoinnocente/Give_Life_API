import { Router } from 'express';
import { RequestController } from '../controllers/request.controller';

const router = Router();
const requestController = new RequestController();

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all blood requests
 *     tags: [Blood Requests]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *       - in: query
 *         name: bloodType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 */
router.get('/', requestController.getAllRequests);

/**
 * @swagger
 * /api/requests/hospital/{hospitalId}:
 *   get:
 *     summary: Get requests for a specific hospital
 *     tags: [Blood Requests]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 */
router.get('/hospital/:hospitalId', requestController.getHospitalRequests);

/**
 * @swagger
 * /api/requests/donor/{donorId}/urgent:
 *   get:
 *     summary: Get urgent requests matching donor's blood type
 *     tags: [Blood Requests]
 *     parameters:
 *       - in: path
 *         name: donorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Urgent requests retrieved successfully
 */
router.get('/donor/:donorId/urgent', requestController.getUrgentRequestsForDonor);

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new blood request
 *     tags: [Blood Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hospitalId
 *               - patientName
 *               - bloodType
 *               - units
 *               - urgency
 *               - contactPerson
 *               - contactPhone
 *     responses:
 *       201:
 *         description: Request created successfully
 */
router.post('/', requestController.createRequest);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get request by ID
 *     tags: [Blood Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request retrieved successfully
 */
router.get('/:id', requestController.getRequestById);

/**
 * @swagger
 * /api/requests/{id}:
 *   patch:
 *     summary: Update blood request
 *     tags: [Blood Requests]
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
 *     responses:
 *       200:
 *         description: Request updated successfully
 */
router.patch('/:id', requestController.updateRequest);

/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Delete blood request
 *     tags: [Blood Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request deleted successfully
 */
router.delete('/:id', requestController.deleteRequest);

export default router;
