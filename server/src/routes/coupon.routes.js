import { Router } from 'express';
import { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/coupon.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();
router.post('/validate', verifyToken, validateCoupon);
router.get('/', verifyToken, requireAdmin, getCoupons);
router.post('/', verifyToken, requireAdmin, createCoupon);
router.put('/:id', verifyToken, requireAdmin, updateCoupon);
router.delete('/:id', verifyToken, requireAdmin, deleteCoupon);
export default router;

