import { Router } from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/student.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createStudentSchema, updateStudentSchema, getStudentParams, getStudentsQuery } from '../validators/student.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

// List and detail routes accessible by TEACHER and ADMIN
router.get('/', authorize('TEACHER', 'ADMIN'), validate(getStudentsQuery), asyncHandler(getStudents));
router.get('/:id', authorize('TEACHER', 'ADMIN'), validate(getStudentParams), asyncHandler(getStudentById));

// Modification routes accessible only by ADMIN
router.post('/', authorize('ADMIN'), validate(createStudentSchema), asyncHandler(createStudent));
router.put('/:id', authorize('ADMIN'), validate(updateStudentSchema), asyncHandler(updateStudent));
router.delete('/:id', authorize('ADMIN'), validate(getStudentParams), asyncHandler(deleteStudent));

export default router;
