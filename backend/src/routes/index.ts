import { Router } from 'express';

// Import all route files here as we build them.
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import attendanceRoutes from './attendance.routes';
import resultRoutes from './result.routes';
import noticeRoutes from './notice.routes';
import donationRoutes from './donation.routes';
import contactRoutes from './contact.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to ZP School API v1' });
});

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/results', resultRoutes);
router.use('/notices', noticeRoutes);
router.use('/donations', donationRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);

export default router;
