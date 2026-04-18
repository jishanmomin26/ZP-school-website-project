import { Router } from 'express';
import { getDashboardStats, getUsers } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', asyncHandler(getDashboardStats));
router.get('/users', asyncHandler(getUsers));

export default router;
