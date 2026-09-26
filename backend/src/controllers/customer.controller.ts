import { Response } from 'express';
import { CustomerService } from '../services/customer.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class CustomerController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const customers = await CustomerService.getAllCustomers(includeInactive);
      return apiSuccess(res, customers);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await CustomerService.getCustomerById(id);
      return apiSuccess(res, customer);
    } catch (err: any) {
      return apiError(res, err.message, 404);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      return apiSuccess(res, customer, 201);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await CustomerService.updateCustomer(id, req.body);
      return apiSuccess(res, customer);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }
}
