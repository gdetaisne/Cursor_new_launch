/**
 * Pagination helpers
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function getPaginationParams(
  query: any,
  defaultLimit = 10,
  maxLimit = 100
): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit as string) || defaultLimit)
  );

  return { page, limit };
}

export function getPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

