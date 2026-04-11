import { z } from 'zod';

export const markAttendanceSchema = z.object({
  body: z.object({
    date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format (ISO 8601 expected)" }),
    records: z.array(z.object({
      studentId: z.number().int().positive(),
      isPresent: z.boolean()
    })).min(1)
  })
});

export const getAttendanceHistoryQuery = z.object({
  query: z.object({
    class: z.string().optional(),
    startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid startDate format" }),
    endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid endDate format" })
  })
});
