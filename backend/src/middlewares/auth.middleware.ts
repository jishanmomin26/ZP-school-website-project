import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!auth) {
      throw new AppError('Firebase Auth is not initialized', 500);
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    // Fetch user from DB to attach to request
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!user) {
      throw new AppError('User not found in database', 404);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 403);
    }

    // Attach user to req
    (req as any).user = user;

    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(error.message || 'Unauthorized', 401));
    }
  }
};
