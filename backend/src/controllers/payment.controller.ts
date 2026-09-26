import { Response } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class PaymentController {
  static async getAll(_req: AuthenticatedRequest, res: Response) {
    try {
      const payments = await PaymentService.getAllPayments();
      return apiSuccess(res, payments);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payment = await PaymentService.getPaymentById(id);
      return apiSuccess(res, payment);
    } catch (err: any) {
      return apiError(res, err.message, 404);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return apiError(res, 'Non authentifié', 401);
      const payment = await PaymentService.createPayment(req.body, req.user.id);
      return apiSuccess(res, payment, 201);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }
}
