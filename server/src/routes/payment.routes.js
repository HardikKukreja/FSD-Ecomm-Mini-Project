import { Router } from 'express';
import { createPaymentIntent } from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/create-intent', verifyToken, createPaymentIntent);
export default router;

