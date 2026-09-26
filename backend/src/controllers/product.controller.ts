import { Response } from 'express';
import { ProductService } from '../services/product.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { apiSuccess, apiError } from '../utils/response.js';

export class ProductController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const products = await ProductService.getAllProducts(includeInactive);
      return apiSuccess(res, products);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const product = await ProductService.getProductById(id);
      return apiSuccess(res, product);
    } catch (err: any) {
      return apiError(res, err.message, 404);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const product = await ProductService.createProduct(req.body);
      return apiSuccess(res, product, 201);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const product = await ProductService.updateProduct(id, req.body);
      return apiSuccess(res, product);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async adjustStock(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await ProductService.adjustStock(req.body);
      return apiSuccess(res, result);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }

  static async getLowStock(_req: AuthenticatedRequest, res: Response) {
    try {
      const items = await ProductService.getLowStockAlerts();
      return apiSuccess(res, items);
    } catch (err: any) {
      return apiError(res, err.message, 400);
    }
  }
}
