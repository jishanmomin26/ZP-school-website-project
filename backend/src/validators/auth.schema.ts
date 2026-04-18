import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    role: z.enum(['teacher', 'parent']),
    email: z.string().email().optional(),
    parentId: z.string().optional(),
  }).refine((data) => {
    if (data.role === 'teacher' && !data.email) return false;
    if (data.role === 'parent' && !data.parentId) return false;
    return true;
  }, {
    message: "Email is required for teachers, Parent ID is required for parents",
  })
});

export const registerSchema = z.object({
  body: z.object({
    role: z.enum(['teacher', 'parent']),
    name: z.string().min(2),
    email: z.string().email().optional(),
    parentId: z.string().optional(),
    phone: z.string().min(10).optional(),
    // Firebase UID is injected by auth middleware, so it's not expected in the body
    studentName: z.string().optional(),
    studentClass: z.string().optional(),
  }).refine((data) => {
    if (data.role === 'teacher' && !data.email) return false;
    if (data.role === 'parent' && (!data.parentId || !data.studentName || !data.studentClass)) return false;
    return true;
  }, {
    message: "Missing required fields for the specified role",
  })
});
