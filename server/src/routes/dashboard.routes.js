import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();
router.get('/stats', verifyToken, requireAdmin, getStats);
export default router;

