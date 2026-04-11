import { prisma } from '../config/database';

export class AttendanceRepository {
  async markBulk(date: Date, records: { studentId: number; isPresent: boolean; markedBy: string }[]) {
    // Determine the studentIds in this operation to delete old records for the same date
    const studentIds = records.map(r => r.studentId);
    
    // Use transaction: Delete existing records for these students on this date, then create new ones
    return prisma.$transaction([
      prisma.attendanceRecord.deleteMany({
        where: {
          date: date,
          studentId: { in: studentIds }
        }
      }),
      prisma.attendanceRecord.createMany({
        data: records.map(r => ({
          studentId: r.studentId,
          date: date,
          isPresent: r.isPresent,
          markedBy: r.markedBy
        }))
      })
    ]);
  }

  async getHistory(filters: { class?: string; startDate?: Date; endDate?: Date }) {
    const whereClause: any = {};
    if (filters.startDate || filters.endDate) {
      whereClause.date = {};
      if (filters.startDate) whereClause.date.gte = filters.startDate;
      if (filters.endDate) whereClause.date.lte = filters.endDate;
    }

    if (filters.class) {
      whereClause.student = { class: filters.class };
    }

    return prisma.attendanceRecord.findMany({
      where: whereClause,
      include: {
        student: { select: { name: true, rollNumber: true, class: true } }
      },
      orderBy: [{ date: 'desc' }, { student: { class: 'asc' } }]
    });
  }

  async getStudentAttendance(studentId: number) {
    return prisma.attendanceRecord.findMany({
      where: { studentId },
      orderBy: { date: 'desc' }
    });
  }
  
  async getStudentAttendanceSummary(studentId: number) {
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId }
    });
    const total = records.length;
    const present = records.filter(r => r.isPresent).length;
    return {
      totalDays: total,
      presentDays: present,
      percentage: total === 0 ? 0 : Math.round((present / total) * 100)
    };
  }

  async getAllSummaries() {
    // This can be heavy in a very large DB, but fine for a single school.
    const records = await prisma.attendanceRecord.findMany({
        include: { student: true }
    });
    return records;
  }
}

export const attendanceRepository = new AttendanceRepository();
