import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Basic authentication middleware for POC
 * Accepts x-user-id header or userId query param
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Check header (case-insensitive)
    const headerUserId =
      req.header('x-user-id') ||
      req.header('X-User-Id') ||
      req.header('X-USER-ID');

    // Check query param (dev mode)
    const queryUserId = req.query.userId as string | undefined;

    const userId = headerUserId || queryUserId;

    if (!userId) {
      throw new ApiError(401, 'Authentication required: x-user-id header missing');
    }

    // Attach userId to request
    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
}

