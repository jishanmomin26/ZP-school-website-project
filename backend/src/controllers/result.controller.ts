import { Request, Response } from 'express';
import { resultService } from '../services/result.service';

export const uploadResults = async (req: Request, res: Response) => {
  const { examType, results } = req.body;
  const user = (req as any).user;

  const result = await resultService.uploadResults(examType, results, user.id);

  res.status(200).json({
    status: 'success',
    data: result
  });
};

export const getResults = async (req: Request, res: Response) => {
  const filters = {
    class: req.query.class as string,
    examType: req.query.examType as string
  };

  const results = await resultService.getResults(filters);

  res.status(200).json({
    status: 'success',
    data: { results }
  });
};
