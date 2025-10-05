import { Router } from 'express';
import { DonorController } from '../controllers/donor.controller';

const router = Router();
const donorController = new DonorController();

// Donor routes
router.get('/', donorController.getAllDonors);
router.get('/:id', donorController.getDonorById);
router.post('/', donorController.createDonor);
router.put('/:id', donorController.updateDonor);
router.delete('/:id', donorController.deleteDonor);

export default router;
