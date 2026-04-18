import { prisma } from '../config/database';

export class ResultRepository {
  async uploadBulk(examType: string, results: any[], uploadedBy: string) {
    const studentIds = results.map(r => r.studentId);
    
    return prisma.$transaction([
      prisma.result.deleteMany({
        where: {
          examType,
          studentId: { in: studentIds }
        }
      }),
      prisma.result.createMany({
        data: results.map(r => ({
          studentId: r.studentId,
          examType,
          marathi: r.marathi,
          english: r.english,
          maths: r.maths,
          evs: r.evs,
          uploadedBy
        }))
      })
    ]);
  }

  async getResults(filters: { class?: string; examType?: string }) {
    const where: any = {};
    if (filters.examType) where.examType = filters.examType;
    if (filters.class) where.student = { class: filters.class };

    return prisma.result.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, rollNumber: true, class: true } }
      },
      orderBy: [{ student: { class: 'asc' } }, { student: { rollNumber: 'asc' } }]
    });
  }
}

export const resultRepository = new ResultRepository();
