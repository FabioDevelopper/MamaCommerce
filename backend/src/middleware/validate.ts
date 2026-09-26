import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { apiError } from '../utils/response.js';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = (err as any).issues || (err as any).errors || [];
        const errorMessages = issues
          .map((e: any) => `${e.path?.join('.') || 'champ'}: ${e.message}`)
          .join(', ');
        return apiError(res, `Données invalides: ${errorMessages}`, 400, issues);
      }
      return apiError(res, 'Erreur de validation des données', 400);
    }
  };
};
