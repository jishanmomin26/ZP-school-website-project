import { Router } from 'express';
import { createNotice, getNotices, getNoticeById, updateNotice, deleteNotice } from '../controllers/notice.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createNoticeSchema, updateNoticeSchema, getNoticesQuery } from '../validators/notice.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public routes
router.get('/', validate(getNoticesQuery), asyncHandler(getNotices));
router.get('/:id', asyncHandler(getNoticeById));

// Protected routes
router.use(authenticate);
router.post('/', authorize('TEACHER', 'ADMIN'), validate(createNoticeSchema), asyncHandler(createNotice));
router.put('/:id', authorize('TEACHER', 'ADMIN'), validate(updateNoticeSchema), asyncHandler(updateNotice));
router.delete('/:id', authorize('ADMIN'), asyncHandler(deleteNotice));

export default router;
