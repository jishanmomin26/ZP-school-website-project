import { Router } from 'express';
import { uploadResults, getResults } from '../controllers/result.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { uploadResultsSchema, getResultsQuery } from '../validators/result.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/upload', authorize('TEACHER', 'ADMIN'), validate(uploadResultsSchema), asyncHandler(uploadResults));
router.get('/', authorize('TEACHER', 'ADMIN'), validate(getResultsQuery), asyncHandler(getResults));

export default router;
