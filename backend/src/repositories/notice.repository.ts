import { prisma } from '../config/database';

export class NoticeRepository {
  async create(data: any) {
    return prisma.notice.create({ data });
  }

  async findById(id: number) {
    return prisma.notice.findUnique({ where: { id } });
  }

  async findAll(filters: { isImportant?: boolean }, skip: number, take: number) {
    return prisma.notice.findMany({
      where: filters.isImportant !== undefined ? { isImportant: filters.isImportant } : {},
      skip,
      take,
      orderBy: { date: 'desc' }
    });
  }

  async count(filters: { isImportant?: boolean }) {
    return prisma.notice.count({
      where: filters.isImportant !== undefined ? { isImportant: filters.isImportant } : {}
    });
  }

  async update(id: number, data: any) {
    return prisma.notice.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.notice.delete({ where: { id } });
  }
}

export const noticeRepository = new NoticeRepository();
