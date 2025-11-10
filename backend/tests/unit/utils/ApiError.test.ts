import { ApiError } from '../../../src/utils/ApiError.js';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create error with status code and message', () => {
      const error = new ApiError(404, 'Not found');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.isOperational).toBe(true);
    });

    it('should set isOperational flag', () => {
      const error = new ApiError(500, 'Internal error', false);
      expect(error.isOperational).toBe(false);
    });

    it('should capture stack trace', () => {
      const error = new ApiError(400, 'Bad request');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApiError');
    });
  });

  describe('static factory methods', () => {
    it('should create bad request error (400)', () => {
      const error = ApiError.badRequest('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should create unauthorized error (401)', () => {
      const error = ApiError.unauthorized();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should create unauthorized error with custom message', () => {
      const error = ApiError.unauthorized('Token expired');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Token expired');
    });

    it('should create forbidden error (403)', () => {
      const error = ApiError.forbidden();
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('should create not found error (404)', () => {
      const error = ApiError.notFound();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create not found error with custom message', () => {
      const error = ApiError.notFound('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('should create conflict error (409)', () => {
      const error = ApiError.conflict();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Resource already exists');
    });

    it('should create conflict error with custom message', () => {
      const error = ApiError.conflict('Email already taken');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Email already taken');
    });

    it('should create internal error (500)', () => {
      const error = ApiError.internal();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error.isOperational).toBe(false);
    });

    it('should create internal error with custom message', () => {
      const error = ApiError.internal('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database connection failed');
      expect(error.isOperational).toBe(false);
    });
  });
});

