import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    class: z.string().min(1),
    rollNumber: z.number().int().positive(),
    isActive: z.boolean().optional()
  })
});

export const updateStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    class: z.string().min(1).optional(),
    rollNumber: z.number().int().positive().optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().transform(val => parseInt(val, 10))
  })
});

export const getStudentParams = z.object({
  params: z.object({
    id: z.string().transform(val => parseInt(val, 10))
  })
});

export const getStudentsQuery = z.object({
  query: z.object({
    class: z.string().optional(),
    limit: z.string().transform(val => parseInt(val, 10)).optional(),
    page: z.string().transform(val => parseInt(val, 10)).optional()
  })
});
