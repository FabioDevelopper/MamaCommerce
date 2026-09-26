import { Response } from 'express';
import { ShipmentService } from '../services/shipment.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class ShipmentController {
  static async getAll(_req: AuthenticatedRequest, res: Response) {
    try {
      const shipments = await ShipmentService.getAllShipments();
      return apiSuccess(res, shipments);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const shipment = await ShipmentService.getShipmentById(id);
      return apiSuccess(res, shipment);
    } catch (err: any) {
      return apiError(res, err.message, 404);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return apiError(res, 'Non authentifié', 401);
      const shipment = await ShipmentService.createShipment(req.body, req.user.id);
      return apiSuccess(res, shipment, 201);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const shipment = await ShipmentService.updateStatus(
        id,
        req.body.status,
        req.body.arrivalDate,
        req.user?.id
      );
      return apiSuccess(res, shipment);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }
}
