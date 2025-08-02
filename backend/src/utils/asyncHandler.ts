import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types/types';

type AsyncHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => Promise<any>;

export const asyncHandler = (handler: AsyncHandler): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};