import { Request, Response } from 'express';
import { attendanceService } from '../services/attendance.service';

export const markAttendance = async (req: Request, res: Response) => {
  const { date, records } = req.body;
  const user = (req as any).user;
  
  const result = await attendanceService.markAttendance(date, records, user.id);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
};

export const getHistory = async (req: Request, res: Response) => {
  const filters = {
    class: req.query.class as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string
  };
  
  const history = await attendanceService.getHistory(filters);
  
  res.status(200).json({
    status: 'success',
    data: { history }
  });
};

export const getDefaulters = async (req: Request, res: Response) => {
  const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 75;
  const defaulters = await attendanceService.getDefaulters(threshold);
  
  res.status(200).json({
    status: 'success',
    data: { defaulters }
  });
};
