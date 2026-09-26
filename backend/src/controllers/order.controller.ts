import { Response } from 'express';
import { OrderService } from '../services/order.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class OrderController {
  static async getAll(_req: AuthenticatedRequest, res: Response) {
    try {
      const orders = await OrderService.getAllOrders();
      return apiSuccess(res, orders);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const order = await OrderService.getOrderById(id);
      return apiSuccess(res, order);
    } catch (err: any) {
      return apiError(res, err.message, 404);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return apiError(res, 'Non authentifié', 401);
      const order = await OrderService.createOrder(req.body, req.user.id);
      return apiSuccess(res, order, 201);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return apiError(res, 'Non authentifié', 401);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const order = await OrderService.cancelOrder(id, req.user.id, req.body.reason);
      return apiSuccess(res, order);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }
}
