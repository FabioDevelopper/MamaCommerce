import { Response } from 'express';
import { SupplierService } from '../services/supplier.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class SupplierController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const suppliers = await SupplierService.getAllSuppliers(includeInactive);
      return apiSuccess(res, suppliers);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const supplier = await SupplierService.getSupplierById(id);
      return apiSuccess(res, supplier);
    } catch (err: any) {
      return apiError(res, err.message, 404);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const supplier = await SupplierService.createSupplier(req.body);
      return apiSuccess(res, supplier, 201);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const supplier = await SupplierService.updateSupplier(id, req.body);
      return apiSuccess(res, supplier);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }
}
