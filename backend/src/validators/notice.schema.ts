import { z } from 'zod';

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    isImportant: z.boolean().default(false)
  })
});

export const updateNoticeSchema = z.object({
  params: z.object({
    id: z.string().transform(val => parseInt(val, 10))
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
    date: z.string().refine(val => !isNaN(Date.parse(val))).optional(),
    isImportant: z.boolean().optional()
  })
});

export const getNoticesQuery = z.object({
  query: z.object({
    isImportant: z.string().optional(), // 'true' or 'false'
    page: z.string().transform(val => parseInt(val, 10)).optional(),
    limit: z.string().transform(val => parseInt(val, 10)).optional()
  })
});
