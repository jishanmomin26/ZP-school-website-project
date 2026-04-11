import { AppError } from '../utils/AppError';
import { attendanceRepository } from '../repositories/attendance.repository';

export class AttendanceService {
  async markAttendance(dateStr: string, records: { studentId: number; isPresent: boolean }[], markedBy: string) {
    const date = new Date(dateStr);
    
    // Add markedBy to each record
    const enrichedRecords = records.map(r => ({
      ...r,
      markedBy,
      date
    }));

    await attendanceRepository.markBulk(date, enrichedRecords);
    
    return { count: enrichedRecords.length };
  }

  async getHistory(filters: { class?: string; startDate?: string; endDate?: string }) {
    const parsedFilters: any = { class: filters.class };
    if (filters.startDate) parsedFilters.startDate = new Date(filters.startDate);
    if (filters.endDate) parsedFilters.endDate = new Date(filters.endDate);
    
    // We group it by date and class for the frontend if needed, but returning flat list is raw.
    // The frontend groups by date, so returning flat with relation is fine.
    const rawHistory = await attendanceRepository.getHistory(parsedFilters);
    
    // Grouping by Date and Class for frontend compatibility
    const grouped: Record<string, { date: string, class: string, present: number[], absent: number[] }> = {};
    
    for (const record of rawHistory) {
      const dateKey = record.date.toISOString().split('T')[0];
      const classVal = record.student.class;
      const key = `${dateKey}_${classVal}`;
      
      if (!grouped[key]) {
        grouped[key] = { date: dateKey, class: classVal, present: [], absent: [] };
      }
      
      if (record.isPresent) {
        grouped[key].present.push(record.studentId);
      } else {
        grouped[key].absent.push(record.studentId);
      }
    }

    return Object.values(grouped);
  }

  async getDefaulters(thresholdPercentage: number = 75) {
    const records = await attendanceRepository.getAllSummaries();
    
    const studentStats: Record<number, { studentId: number; name: string; class: string; total: number; present: number }> = {};
    
    for (const r of records) {
        if (!studentStats[r.studentId]) {
            studentStats[r.studentId] = {
                studentId: r.studentId,
                name: r.student.name,
                class: r.student.class,
                total: 0,
                present: 0
            };
        }
        studentStats[r.studentId].total += 1;
        if (r.isPresent) studentStats[r.studentId].present += 1;
    }

    const defaulters = Object.values(studentStats)
        .map(stat => ({
            ...stat,
            percentage: stat.total === 0 ? 0 : Math.round((stat.present / stat.total) * 100)
        }))
        .filter(stat => stat.percentage < thresholdPercentage && stat.total > 0)
        .sort((a, b) => a.percentage - b.percentage);
        
    return defaulters;
  }
}

export const attendanceService = new AttendanceService();
