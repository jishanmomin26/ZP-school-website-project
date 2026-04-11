import { Router } from 'express';
import { submitContact, getContacts, markAsRead } from '../controllers/contact.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createContactSchema, getContactQuery } from '../validators/contact.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public route to submit contact
router.post('/', validate(createContactSchema), asyncHandler(submitContact));

// Admin routes
router.use(authenticate, authorize('ADMIN'));
router.get('/', validate(getContactQuery), asyncHandler(getContacts));
router.patch('/:id/read', asyncHandler(markAsRead));

export default router;
