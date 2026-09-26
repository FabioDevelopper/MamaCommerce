import { Request, Response, NextFunction } from 'express';
import { apiError } from '../utils/response.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('💥 Erreur interne capturée :', err);

  const message = err.message || 'Une erreur inattendue est survenue sur le serveur';
  return apiError(res, message, 500);
};
