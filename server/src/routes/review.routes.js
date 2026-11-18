import { Router } from 'express';
import { getReviews, createReview } from '../controllers/review.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router({ mergeParams: true });
router.get('/', getReviews);
router.post('/', verifyToken, createReview);
export default router;

