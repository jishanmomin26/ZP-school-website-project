import { Request, Response } from 'express';
import { studentService } from '../services/student.service';

export const getStudents = async (req: Request, res: Response) => {
  const { class: studentClass, page, limit } = req.query;
  const result = await studentService.getStudents(
    { class: studentClass as string },
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20
  );

  res.status(200).json({
    status: 'success',
    data: result
  });
};

export const getStudentById = async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(parseInt(req.params.id as string));
  res.status(200).json({
    status: 'success',
    data: { student }
  });
};

export const createStudent = async (req: Request, res: Response) => {
  const student = await studentService.createStudent(req.body);
  res.status(201).json({
    status: 'success',
    data: { student }
  });
};

export const updateStudent = async (req: Request, res: Response) => {
  const student = await studentService.updateStudent(parseInt(req.params.id as string), req.body);
  res.status(200).json({
    status: 'success',
    data: { student }
  });
};

export const deleteStudent = async (req: Request, res: Response) => {
  await studentService.deleteStudent(parseInt(req.params.id as string));
  res.status(204).send();
};
