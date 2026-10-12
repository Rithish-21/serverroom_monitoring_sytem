import { Router } from 'express';
import { getAllRacks, createRack, deleteRack } from '../controllers/rackController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', authenticate, getAllRacks);
router.post('/', authenticate, requireRole('admin'), createRack);
router.delete('/:id', authenticate, requireRole('admin'), deleteRack);

export default router;
