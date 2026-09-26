import { Response } from 'express';
import { ReportService } from '../services/report.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class ReportController {
  static async getReport(req: AuthenticatedRequest, res: Response) {
    try {
      const period = String(req.query.period || 'month');
      const from = req.query.from ? String(req.query.from) : undefined;
      const to = req.query.to ? String(req.query.to) : undefined;

      const report = await ReportService.getFinancialReport(period, from, to);
      return apiSuccess(res, report);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async exportCsv(req: AuthenticatedRequest, res: Response) {
    try {
      const period = String(req.query.period || 'month');
      const from = req.query.from ? String(req.query.from) : undefined;
      const to = req.query.to ? String(req.query.to) : undefined;

      const csv = await ReportService.generateCsvReport(period, from, to);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="sokho_rapport_${period}_${Date.now()}.csv"`);
      return res.send(csv);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }
}
