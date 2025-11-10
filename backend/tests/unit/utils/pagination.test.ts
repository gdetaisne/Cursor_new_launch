import {
  getPaginationParams,
  getPaginationMeta,
  getSkip,
} from '../../../src/utils/pagination.js';

describe('Pagination Utils', () => {
  describe('getPaginationParams', () => {
    it('should return default page and limit', () => {
      const result = getPaginationParams({});
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should parse valid page and limit from query', () => {
      const result = getPaginationParams({ page: '2', limit: '20' });
      expect(result).toEqual({ page: 2, limit: 20 });
    });

    it('should enforce minimum page of 1', () => {
      const result = getPaginationParams({ page: '0' });
      expect(result.page).toBe(1);

      const result2 = getPaginationParams({ page: '-5' });
      expect(result2.page).toBe(1);
    });

    it('should enforce maximum limit', () => {
      const result = getPaginationParams({ limit: '500' }, 10, 100);
      expect(result.limit).toBe(100);
    });

    it('should use default limit when limit is 0', () => {
      const result = getPaginationParams({ limit: '0' }, 10);
      expect(result.limit).toBe(10); // Falls back to default when invalid
    });

    it('should use default limit when invalid', () => {
      const result = getPaginationParams({ limit: 'invalid' }, 25);
      expect(result.limit).toBe(25);
    });
  });

  describe('getPaginationMeta', () => {
    it('should calculate correct pagination meta', () => {
      const result = getPaginationMeta(1, 10, 50);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('should handle last page correctly', () => {
      const result = getPaginationMeta(5, 10, 50);
      expect(result).toEqual({
        page: 5,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('should handle middle page correctly', () => {
      const result = getPaginationMeta(3, 10, 50);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('should handle zero total correctly', () => {
      const result = getPaginationMeta(1, 10, 0);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle non-divisible total correctly', () => {
      const result = getPaginationMeta(1, 10, 45);
      expect(result.totalPages).toBe(5); // Should round up
    });
  });

  describe('getSkip', () => {
    it('should calculate correct skip for page 1', () => {
      expect(getSkip(1, 10)).toBe(0);
    });

    it('should calculate correct skip for page 2', () => {
      expect(getSkip(2, 10)).toBe(10);
    });

    it('should calculate correct skip for page 5', () => {
      expect(getSkip(5, 20)).toBe(80);
    });

    it('should handle page 0 (edge case)', () => {
      expect(getSkip(0, 10)).toBe(-10); // Invalid but should handle
    });
  });
});

