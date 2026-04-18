import { z } from 'zod';

export const uploadResultsSchema = z.object({
  body: z.object({
    examType: z.string().min(1),
    results: z.array(z.object({
      studentId: z.number().int().positive(),
      marathi: z.number().int().min(0).max(100).optional(),
      english: z.number().int().min(0).max(100).optional(),
      maths: z.number().int().min(0).max(100).optional(),
      evs: z.number().int().min(0).max(100).optional()
    })).min(1)
  })
});

export const getResultsQuery = z.object({
  query: z.object({
    class: z.string().optional(),
    examType: z.string().optional()
  })
});
