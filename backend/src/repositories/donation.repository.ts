import { prisma } from '../config/database';

export class DonationRepository {
  async create(data: { donorName: string; phone: string; amount: number; purpose: string; message?: string; donorUserId?: string }) {
    return prisma.donation.create({ data });
  }

  async findAll(skip: number, take: number) {
    return prisma.donation.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { donor: { select: { name: true, email: true } } }
    });
  }

  async count() {
    return prisma.donation.count();
  }

  async getStats() {
    const totalAmount = await prisma.donation.aggregate({
      _sum: { amount: true }
    });
    
    return {
      totalDonations: await this.count(),
      totalAmount: totalAmount._sum.amount || 0
    };
  }
}

export const donationRepository = new DonationRepository();
