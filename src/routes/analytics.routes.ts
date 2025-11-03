import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const analyticsController = new AnalyticsController();

/**
 * @swagger
 * /api/analytics/hospital/{hospitalId}/stats:
 *   get:
 *     summary: Get hospital dashboard statistics
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/hospital/:hospitalId/stats', analyticsController.getHospitalStats);

/**
 * @swagger
 * /api/analytics/hospital/{hospitalId}/blood-type-distribution:
 *   get:
 *     summary: Get blood type distribution
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Distribution retrieved successfully
 */
router.get('/hospital/:hospitalId/blood-type-distribution', analyticsController.getBloodTypeDistribution);

/**
 * @swagger
 * /api/analytics/hospital/{hospitalId}/donation-trends:
 *   get:
 *     summary: Get donation trends
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           description: Number of days
 *     responses:
 *       200:
 *         description: Trends retrieved successfully
 */
router.get('/hospital/:hospitalId/donation-trends', analyticsController.getDonationTrends);

/**
 * @swagger
 * /api/analytics/hospital/{hospitalId}/monthly-report:
 *   get:
 *     summary: Get monthly donation report
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 */
router.get('/hospital/:hospitalId/monthly-report', analyticsController.getMonthlyReport);

/**
 * @swagger
 * /api/analytics/hospital/{hospitalId}/donor-analytics:
 *   get:
 *     summary: Get donor analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/hospital/:hospitalId/donor-analytics', analyticsController.getDonorAnalytics);

export default router;
