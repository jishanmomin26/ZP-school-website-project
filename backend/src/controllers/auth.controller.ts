import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

export const login = async (req: Request, res: Response) => {
  const { role, email, parentId } = req.body;
  const user = (req as any).user; // from firebase auth token

  // For double safety, verify that the firebase user actually matches the requested login details.
  // In a real scenario, you usually just register via firebase, and then query the DB by firebaseUid.
  
  const loggedInUser = await prisma.user.findUnique({
    where: { firebaseUid: user.uid },
    include: { parentProfile: true }
  });

  if (!loggedInUser) {
    throw new AppError('User profile not found in database. Please register first.', 404);
  }

  // Verification checks optionally
  if (role === 'teacher' && loggedInUser.role !== 'TEACHER' && loggedInUser.role !== 'ADMIN') {
    throw new AppError('Access denied: You are not a teacher', 403);
  }

  if (role === 'parent' && loggedInUser.role !== 'PARENT') {
    throw new AppError('Access denied: You are not a parent', 403);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: loggedInUser
    }
  });
};

export const register = async (req: Request, res: Response) => {
  // In a typical flow:
  // 1. User signs up on frontend with Firebase -> gets firebaseUid
  // 2. Frontend calls this API with the JWT token + profile details (name, role, etc)
  const { role, name, email, parentId, phone, studentName, studentClass } = req.body;
  const user = (req as any).user; // verified firebase token payload

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { firebaseUid: user.uid }
  });

  if (existingUser) {
    throw new AppError('User profile already exists', 400);
  }

  // Check unique constraints (email or parentId)
  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new AppError('Email is already registered', 400);
  }

  if (parentId) {
    const existingParentId = await prisma.user.findUnique({ where: { parentId } });
    if (existingParentId) throw new AppError('Parent ID is already registered', 400);
  }

  let finalRole: 'TEACHER' | 'PARENT' | 'ADMIN' = role === 'teacher' ? 'TEACHER' : 'PARENT';

  // Create user in DB
  const newUser = await prisma.user.create({
    data: {
      firebaseUid: user.uid,
      name,
      email,
      phone,
      role: finalRole,
      parentId,
      ...(finalRole === 'PARENT' && {
        parentProfile: {
          create: {
            studentName: studentName,
            studentClass: studentClass,
          }
        }
      })
    },
    include: {
      parentProfile: true
    }
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
};

export const getMe = async (req: Request, res: Response) => {
  // user object attached in auth.middleware contains the full DB user
  const dbUser = (req as any).user;
  
  const fullUser = await prisma.user.findUnique({
    where: { id: dbUser.id },
    include: { parentProfile: true }
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: fullUser
    }
  });
};
