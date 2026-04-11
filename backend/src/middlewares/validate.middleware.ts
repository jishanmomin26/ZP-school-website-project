import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';

export const validate = (schema: ZodSchema) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
