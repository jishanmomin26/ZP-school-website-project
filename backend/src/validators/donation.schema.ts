import { z } from 'zod';

export const createDonationSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    amount: z.number().positive(),
    purpose: z.string().min(2),
    message: z.string().optional()
  })
});

export const getDonationsQuery = z.object({
  query: z.object({
    page: z.string().transform(val => parseInt(val, 10)).optional(),
    limit: z.string().transform(val => parseInt(val, 10)).optional()
  })
});
