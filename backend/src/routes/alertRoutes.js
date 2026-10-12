import { Router } from 'express';
import { getActiveAlerts, getAllAlerts, acknowledgeAlert } from '../controllers/alertController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getActiveAlerts);
router.get('/history', authenticate, getAllAlerts);
router.put('/:id/acknowledge', authenticate, acknowledgeAlert);

export default router;
