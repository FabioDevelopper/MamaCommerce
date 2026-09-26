import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { apiError } from '../utils/response.js';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return apiError(res, 'Non authentifié', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return apiError(
        res,
        `Accès refusé : rôle requis (${allowedRoles.join(', ')}), votre rôle est ${req.user.role}`,
        403
      );
    }

    next();
  };
};
