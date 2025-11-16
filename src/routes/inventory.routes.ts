import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();
const inventoryController = new InventoryController();

/**
 * @swagger
 * /api/inventory/hospital/{hospitalId}:
 *   get:
 *     summary: Get blood inventory for a hospital
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 */
router.get('/hospital/:hospitalId', inventoryController.getHospitalInventory);

/**
 * @swagger
 * /api/inventory/hospital/{hospitalId}/stats:
 *   get:
 *     summary: Get inventory statistics
 *     tags: [Inventory]
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
router.get('/hospital/:hospitalId/stats', inventoryController.getInventoryStats);

/**
 * @swagger
 * /api/inventory/hospital/{hospitalId}:
 *   patch:
 *     summary: Update blood inventory
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: hospitalId
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
 *               - bloodType
 *               - units
 *               - operation
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 */
router.patch('/hospital/:hospitalId', inventoryController.updateInventory);

/**
 * @swagger
 * /api/inventory/hospital/{hospitalId}/initialize:
 *   post:
 *     summary: Initialize inventory for a hospital
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Inventory initialized successfully
 */
router.post('/hospital/:hospitalId/initialize', inventoryController.initializeInventory);

export default router;
