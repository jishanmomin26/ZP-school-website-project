import { prisma } from '../config/database';

export class StudentRepository {
  async create(data: { name: string; class: string; rollNumber: number }) {
    return prisma.student.create({ data });
  }

  async findById(id: number) {
    return prisma.student.findUnique({ where: { id } });
  }

  async findByClassAndRoll(studentClass: string, rollNumber: number) {
    return prisma.student.findUnique({
      where: {
        class_rollNumber: {
          class: studentClass,
          rollNumber
        }
      }
    });
  }

  async findAll(filters: { class?: string }, skip: number, take: number) {
    return prisma.student.findMany({
      where: filters.class ? { class: filters.class, isActive: true } : { isActive: true },
      skip,
      take,
      orderBy: [{ class: 'asc' }, { rollNumber: 'asc' }]
    });
  }

  async count(filters: { class?: string }) {
    return prisma.student.count({
      where: filters.class ? { class: filters.class, isActive: true } : { isActive: true }
    });
  }

  async update(id: number, data: any) {
    return prisma.student.update({
      where: { id },
      data
    });
  }

  async softDelete(id: number) {
    return prisma.student.update({
      where: { id },
      data: { isActive: false }
    });
  }
}

export const studentRepository = new StudentRepository();
