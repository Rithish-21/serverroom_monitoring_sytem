import { Router } from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', authenticate, requireRole('admin'), getAllUsers);
router.put('/:id', authenticate, requireRole('admin'), updateUserRole);
router.delete('/:id', authenticate, requireRole('admin'), deleteUser);

export default router;
