import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome to Give Life Website
 *     description: Returns a welcome message for the Give Life blood donation platform
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Welcome to Give Life Website
 *                 description:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                 version:
 *                   type: string
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Give Life Website',
    description: 'A platform connecting blood donors with those in need',
    documentation: '/api-docs',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api-docs',
    },
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Give Life API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
