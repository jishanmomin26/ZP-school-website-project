import { Router } from 'express';
import { markAttendance, getHistory, getDefaulters } from '../controllers/attendance.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { markAttendanceSchema, getAttendanceHistoryQuery } from '../validators/attendance.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/mark', authorize('TEACHER', 'ADMIN'), validate(markAttendanceSchema), asyncHandler(markAttendance));
router.get('/history', authorize('TEACHER', 'ADMIN'), validate(getAttendanceHistoryQuery), asyncHandler(getHistory));
router.get('/defaulters', authorize('TEACHER', 'ADMIN'), asyncHandler(getDefaulters));
// For parent endpoint, it could be implemented but we stick to the required ones for now.

export default router;
