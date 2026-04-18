import { resultRepository } from '../repositories/result.repository';

export class ResultService {
  async uploadResults(examType: string, results: any[], uploadedBy: string) {
    await resultRepository.uploadBulk(examType, results, uploadedBy);
    return { count: results.length };
  }

  async getResults(filters: { class?: string; examType?: string }) {
    const rawResults = await resultRepository.getResults(filters);

    // Group logic to match frontend expectations
    // The frontend typically wants results grouped by class then by exam type
    const grouped: any = {};
    for (const r of rawResults) {
      if (!grouped[r.student.class]) {
        grouped[r.student.class] = {};
      }
      if (!grouped[r.student.class][r.examType]) {
        grouped[r.student.class][r.examType] = [];
      }
      grouped[r.student.class][r.examType].push({
        studentId: r.studentId,
        studentName: r.student.name,
        rollNumber: r.student.rollNumber,
        marathi: r.marathi,
        english: r.english,
        maths: r.maths,
        evs: r.evs
      });
    }

    return grouped;
  }
}

export const resultService = new ResultService();
