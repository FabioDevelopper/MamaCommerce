import { Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class AuthController {
  static async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return apiSuccess(res, result);
    } catch (err: any) {
      return apiError(res, err.message, 401);
    }
  }

  static async register(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      return apiSuccess(res, result, 201);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return apiError(res, 'Non authentifié', 401);
      }
      const profile = await AuthService.getProfile(req.user.id);
      return apiSuccess(res, profile);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await AuthService.getAllUsers();
      return apiSuccess(res, users);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await AuthService.updateUser(id, req.body);
      return apiSuccess(res, user);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }
}