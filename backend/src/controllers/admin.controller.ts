import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getDashboardStats = async (req: Request, res: Response) => {
  const [
    totalStudents,
    totalNotices,
    totalDonationsAggr,
    unreadMessages
  ] = await Promise.all([
    prisma.student.count({ where: { isActive: true } }),
    prisma.notice.count(),
    prisma.donation.aggregate({ _sum: { amount: true } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalStudents,
        totalNotices,
        totalDonationsAmount: totalDonationsAggr._sum.amount || 0,
        unreadMessages
      }
    }
  });
};

export const getUsers = async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip: (page - 1) * limit, take: limit }),
    prisma.user.count()
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    }
  });
};
