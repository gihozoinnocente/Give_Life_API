import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';

const router = Router();
const appointmentController = new AppointmentController();

/**
 * @swagger
 * /api/appointments/hospitals:
 *   get:
 *     summary: Get all hospitals where donors can schedule appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 */
router.get('/hospitals', appointmentController.getAllHospitals);

/**
 * @swagger
 * /api/appointments/donor/{donorId}:
 *   get:
 *     summary: Get all appointments for a donor
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: donorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 */
router.get('/donor/:donorId', appointmentController.getDonorAppointments);

/**
 * @swagger
 * /api/appointments/hospital/{hospitalId}:
 *   get:
 *     summary: Get all appointments for a hospital
 *     tags: [Appointments]
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
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 */
router.get('/hospital/:hospitalId', appointmentController.getHospitalAppointments);

/**
 * @swagger
 * /api/appointments/hospital/{hospitalId}/available-slots:
 *   get:
 *     summary: Get available time slots for a hospital
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 */
router.get('/hospital/:hospitalId/available-slots', appointmentController.getAvailableSlots);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment (Schedule appointment at hospital)
 *     description: Donors can schedule appointments at hospitals. The system validates that the time slot is not already booked.
 *     tags: [Appointments]
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
 *               - time
 *               - type
 *             properties:
 *               donorId:
 *                 type: string
 *                 description: The ID of the donor
 *               hospitalId:
 *                 type: string
 *                 description: The ID of the hospital
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the appointment (YYYY-MM-DD)
 *               time:
 *                 type: string
 *                 description: The time slot (e.g., "09:00 AM")
 *               type:
 *                 type: string
 *                 enum: [regular, platelet, plasma, urgent]
 *                 description: The type of donation
 *               notes:
 *                 type: string
 *                 description: Optional notes for the appointment
 *     responses:
 *       201:
 *         description: Appointment scheduled successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Time slot already booked or donor already has appointment on this date
 */
router.post('/', appointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 */
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}:
 *   patch:
 *     summary: Update appointment
 *     tags: [Appointments]
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
 *         description: Appointment updated successfully
 */
router.patch('/:id', appointmentController.updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 */
router.patch('/:id/cancel', appointmentController.cancelAppointment);

export default router;
