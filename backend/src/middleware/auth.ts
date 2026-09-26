import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest, UserPayload } from '../types/index.js';
import { apiError } from '../utils/response.js';
import { prisma } from '../lib/prisma.js';

export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiError(res, 'Authentification requise (Token manquant)', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return apiError(res, 'Token invalide', 401);
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as UserPayload;
    if (!decoded || !decoded.id) {
      return apiError(res, 'Session expirée ou invalide', 401);
    }

    // Vérifier que l'utilisateur est toujours actif en base
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    if (!user || !user.active) {
      return apiError(res, 'Compte désactivé ou inexistant', 403);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserPayload['role'],
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return apiError(res, 'Session expirée, veuillez vous reconnecter', 401);
    }
    return apiError(res, 'Token d’authentification invalide', 401);
  }
};
