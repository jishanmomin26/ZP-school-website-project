import { Request, Response } from 'express';
import { donationService } from '../services/donation.service';

export const submitDonation = async (req: Request, res: Response) => {
  // If user is authenticated via middleware, attach user ID. But this Route is public
  let userId = undefined;
  if ((req as any).user) {
    userId = (req as any).user.id;
  }
  
  const donation = await donationService.submitDonation(req.body, userId);
  res.status(201).json({ status: 'success', data: { donation } });
};

export const getDonations = async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

  const result = await donationService.getDonations(page, limit);
  res.status(200).json({ status: 'success', data: result });
};

export const getDonationStats = async (req: Request, res: Response) => {
  const stats = await donationService.getStats();
  res.status(200).json({ status: 'success', data: { stats } });
};
