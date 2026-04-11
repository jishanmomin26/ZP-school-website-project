import { AppError } from '../utils/AppError';
import { studentRepository } from '../repositories/student.repository';

export class StudentService {
  async getStudents(filters: { class?: string }, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      studentRepository.findAll(filters, skip, limit),
      studentRepository.count(filters)
    ]);

    return {
      students,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getStudentById(id: number) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new AppError('Student not found', 404);
    }
    return student;
  }

  async createStudent(data: { name: string; class: string; rollNumber: number }) {
    const existing = await studentRepository.findByClassAndRoll(data.class, data.rollNumber);
    if (existing) {
      throw new AppError(`Roll number ${data.rollNumber} already exists in class ${data.class}`, 400);
    }
    return studentRepository.create(data);
  }

  async updateStudent(id: number, data: any) {
    const existing = await studentRepository.findById(id);
    if (!existing) {
      throw new AppError('Student not found', 404);
    }

    if (data.class && data.rollNumber) {
      const conflict = await studentRepository.findByClassAndRoll(data.class, data.rollNumber);
      if (conflict && conflict.id !== id) {
        throw new AppError(`Roll number ${data.rollNumber} already exists in class ${data.class}`, 400);
      }
    }

    return studentRepository.update(id, data);
  }

  async deleteStudent(id: number) {
    const existing = await studentRepository.findById(id);
    if (!existing) {
      throw new AppError('Student not found', 404);
    }
    return studentRepository.softDelete(id);
  }
}

export const studentService = new StudentService();
