import { Router } from 'express';
import { login, register, getMe } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { loginSchema, registerSchema } from '../validators/auth.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Notice: In the actual flow, even register and login should be authenticated by the Firebase token first
// We want to extract the Firebase UID locally.
// However, the `authenticate` middleware we built looks up the database user too.
// For registration, the database user won't exist yet! We need a specialized auth midleware for registering.

// Let's create a simpler firebase auth just to verify the token for registration
import admin from 'firebase-admin';
import { AppError } from '../utils/AppError';

const verifyFirebaseTokenOnly = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: No token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // basic firebase decoded token
    next();
  } catch (error: any) {
    next(new AppError(error.message || 'Unauthorized', 401));
  }
};

router.post('/register', verifyFirebaseTokenOnly, validate(registerSchema), asyncHandler(register));
router.post('/login', verifyFirebaseTokenOnly, validate(loginSchema), asyncHandler(login));
router.get('/me', authenticate, asyncHandler(getMe));

export default router;
