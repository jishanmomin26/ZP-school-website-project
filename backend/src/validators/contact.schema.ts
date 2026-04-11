import { z } from 'zod';

export const createContactSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    subject: z.string().min(2),
    message: z.string().min(5)
  })
});

export const getContactQuery = z.object({
  query: z.object({
    page: z.string().transform(val => parseInt(val, 10)).optional(),
    limit: z.string().transform(val => parseInt(val, 10)).optional(),
    isRead: z.string().optional() // 'true' or 'false'
  })
});
