import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller';

const router = Router();
const communityController = new CommunityController();

/**
 * @swagger
 * /api/community/posts:
 *   get:
 *     summary: Get all community posts
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 */
router.get('/posts', communityController.getAllPosts);

/**
 * @swagger
 * /api/community/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Community]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorId
 *               - content
 *               - type
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post('/posts', communityController.createPost);

/**
 * @swagger
 * /api/community/posts/{id}/like:
 *   patch:
 *     summary: Like a post
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked successfully
 */
router.patch('/posts/:id/like', communityController.likePost);

/**
 * @swagger
 * /api/community/events:
 *   get:
 *     summary: Get all events
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 */
router.get('/events', communityController.getAllEvents);

/**
 * @swagger
 * /api/community/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Community]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - time
 *               - location
 *               - organizer
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post('/events', communityController.createEvent);

/**
 * @swagger
 * /api/community/events/{id}/join:
 *   patch:
 *     summary: Join an event
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined event
 */
router.patch('/events/:id/join', communityController.joinEvent);

/**
 * @swagger
 * /api/community/stats:
 *   get:
 *     summary: Get community statistics
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', communityController.getCommunityStats);

/**
 * @swagger
 * /api/community/leaderboard:
 *   get:
 *     summary: Get top donors leaderboard
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get('/leaderboard', communityController.getLeaderboard);

export default router;
