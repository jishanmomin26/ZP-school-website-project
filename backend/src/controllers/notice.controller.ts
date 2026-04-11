import { Request, Response } from 'express';
import { noticeService } from '../services/notice.service';

export const createNotice = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const notice = await noticeService.createNotice(req.body, user.id);
  res.status(201).json({ status: 'success', data: { notice } });
};

export const getNotices = async (req: Request, res: Response) => {
  const isImportant = req.query.isImportant === 'true' ? true : req.query.isImportant === 'false' ? false : undefined;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  
  const result = await noticeService.getNotices({ isImportant }, page, limit);
  res.status(200).json({ status: 'success', data: result });
};

export const getNoticeById = async (req: Request, res: Response) => {
  const notice = await noticeService.getNoticeById(parseInt(req.params.id as string));
  res.status(200).json({ status: 'success', data: { notice } });
};

export const updateNotice = async (req: Request, res: Response) => {
  const notice = await noticeService.updateNotice(parseInt(req.params.id as string), req.body);
  res.status(200).json({ status: 'success', data: { notice } });
};

export const deleteNotice = async (req: Request, res: Response) => {
  await noticeService.deleteNotice(parseInt(req.params.id as string));
  res.status(204).send();
};
