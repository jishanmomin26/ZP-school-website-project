import { prisma } from '../config/database';

export class ContactRepository {
  async create(data: { name: string; email: string; subject: string; message: string }) {
    return prisma.contactMessage.create({ data });
  }

  async findAll(filters: { isRead?: boolean }, skip: number, take: number) {
    return prisma.contactMessage.findMany({
      where: filters.isRead !== undefined ? { isRead: filters.isRead } : {},
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async count(filters: { isRead?: boolean }) {
    return prisma.contactMessage.count({
      where: filters.isRead !== undefined ? { isRead: filters.isRead } : {}
    });
  }

  async markAsRead(id: number) {
    return prisma.contactMessage.update({
      where: { id },
      data: { isRead: true }
    });
  }
}

export const contactRepository = new ContactRepository();
