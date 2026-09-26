import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const apiSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  const payload: ApiResponse<T> = {
    success: true,
    data,
  };
  return res.status(statusCode).json(payload);
};

export const apiError = (
  res: Response,
  message: string,
  statusCode = 400,
  details?: unknown
) => {
  const payload: ApiResponse = {
    success: false,
    error: message,
    data: details,
  };
  return res.status(statusCode).json(payload);
};
