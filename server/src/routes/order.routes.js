import { Router } from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getOrder } from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();
router.use(verifyToken);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/', requireAdmin, getAllOrders);
router.put('/:id/status', requireAdmin, updateOrderStatus);
router.get('/:id', getOrder);
export default router;

