import { Response } from 'express';
import { ExpenseService } from '../services/expense.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class ExpenseController {
  static async getAll(_req: AuthenticatedRequest, res: Response) {
    try {
      const expenses = await ExpenseService.getAllExpenses();
      return apiSuccess(res, expenses);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return apiError(res, 'Non authentifié', 401);
      const expense = await ExpenseService.createExpense(req.body, req.user.id);
      return apiSuccess(res, expense, 201);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await ExpenseService.deleteExpense(id);
      return apiSuccess(res, { success: true });
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }
}
