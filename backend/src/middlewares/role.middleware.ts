import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return next(new AppError('User not authenticated for authorization check', 401));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError('Forbidden: You do not have the required permissions', 403));
    }

    next();
  };
};
