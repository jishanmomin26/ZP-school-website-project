import { Router } from 'express';
import { submitDonation, getDonations, getDonationStats } from '../controllers/donation.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { createDonationSchema, getDonationsQuery } from '../validators/donation.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public route to submit donation
router.post('/', validate(createDonationSchema), asyncHandler(submitDonation));

// Admin routes
router.use(authenticate, authorize('ADMIN'));
router.get('/', validate(getDonationsQuery), asyncHandler(getDonations));
router.get('/stats', asyncHandler(getDonationStats));

export default router;
