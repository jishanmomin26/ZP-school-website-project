import { Request, Response } from 'express';
import { contactService } from '../services/contact.service';

export const submitContact = async (req: Request, res: Response) => {
  const message = await contactService.submitMessage(req.body);
  res.status(201).json({ status: 'success', data: { message } });
};

export const getContacts = async (req: Request, res: Response) => {
  const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  
  const result = await contactService.getMessages({ isRead }, page, limit);
  res.status(200).json({ status: 'success', data: result });
};

export const markAsRead = async (req: Request, res: Response) => {
  const message = await contactService.markAsRead(parseInt(req.params.id as string));
  res.status(200).json({ status: 'success', data: { message } });
};
