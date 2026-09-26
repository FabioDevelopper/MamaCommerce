import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class DashboardController {
  static async getMetrics(_req: AuthenticatedRequest, res: Response) {
    try {
      const data = await DashboardService.getDashboardMetrics();
      return apiSuccess(res, data);
    } catch (err: any) {
      return apiError(res, err.message, 500);
    }
  }
}
