import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

/**
 * @swagger
 * /api/notifications/blood-request:
 *   post:
 *     summary: Create blood request and send notifications to all users
 *     description: Hospital info (hospitalId, hospitalName, location) is automatically fetched from authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bloodType
 *               - unitsNeeded
 *               - urgency
 *               - patientCondition
 *               - contactPerson
 *               - contactPhone
 *               - expiryDate
 *             properties:
 *               bloodType:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               unitsNeeded:
 *                 type: number
 *               urgency:
 *                 type: string
 *                 enum: [critical, urgent, normal]
 *               patientCondition:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               additionalNotes:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Blood request created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/blood-request', authenticateToken, notificationController.createBloodRequest);

/**
 * @swagger
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: Get all notifications for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/user/:userId', authenticateToken, notificationController.getUserNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/user/{userId}/unread-count:
 *   get:
 *     summary: Get unread notification count for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/user/:userId/unread-count', notificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

/**
 * @swagger
 * /api/notifications/blood-requests/active:
 *   get:
 *     summary: Get all active blood requests
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Active blood requests retrieved successfully
 */
router.get('/blood-requests/active', notificationController.getActiveBloodRequests);

export default router;
