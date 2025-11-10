import { prisma } from '../db/client.js';
import {
  CreateMoverInput,
  UpdateMoverInput,
  BlacklistMoverInput,
} from '../schemas/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getSkip, getPaginationMeta } from '../utils/pagination.js';

/**
 * List movers with pagination and filters
 */
export async function listMovers(filters: {
  page: number;
  limit: number;
  status?: string;
  city?: string;
  postalCode?: string;
}) {
  const { page, limit, status, city, postalCode } = filters;
  const skip = getSkip(page, limit);

  const where: any = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (city) {
    where.city = { contains: city, mode: 'insensitive' };
  }

  if (postalCode) {
    where.postalCode = postalCode;
  }

  const [movers, total] = await Promise.all([
    prisma.mover.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            pricingGrids: true,
            quotes: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mover.count({ where }),
  ]);

  return {
    data: movers,
    meta: getPaginationMeta(page, limit, total),
  };
}

/**
 * Get mover by ID with full details
 */
export async function getMoverById(id: string) {
  const mover = await prisma.mover.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      pricingGrids: {
        where: { deletedAt: null, active: true },
        orderBy: { createdAt: 'desc' },
      },
      users: {
        where: { deletedAt: null, active: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          quotes: true,
        },
      },
    },
  });

  if (!mover) {
    throw ApiError.notFound('Mover not found');
  }

  // Get bookings count via quotes
  const bookingsCount = await prisma.booking.count({
    where: {
      quote: {
        moverId: id,
        deletedAt: null,
      },
    },
  });

  return {
    ...mover,
    stats: {
      quotesCount: mover._count.quotes,
      bookingsCount,
      pricingGridsCount: mover.pricingGrids.length,
      usersCount: mover.users.length,
    },
  };
}

/**
 * Create new mover
 */
export async function createMover(data: CreateMoverInput) {
  // Check SIRET unique
  const existingMover = await prisma.mover.findFirst({
    where: {
      siret: data.siret,
      deletedAt: null,
    },
  });

  if (existingMover) {
    throw ApiError.conflict('Mover with this SIRET already exists');
  }

  // Check email unique
  const existingEmail = await prisma.mover.findFirst({
    where: {
      email: data.email,
      deletedAt: null,
    },
  });

  if (existingEmail) {
    throw ApiError.conflict('Mover with this email already exists');
  }

  const mover = await prisma.mover.create({
    data: {
      ...data,
      status: 'PENDING', // New movers start as PENDING
    },
  });

  return mover;
}

/**
 * Update mover
 */
export async function updateMover(id: string, data: UpdateMoverInput) {
  const existingMover = await prisma.mover.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingMover) {
    throw ApiError.notFound('Mover not found');
  }

  // Check SIRET unique if updating
  if (data.siret && data.siret !== existingMover.siret) {
    const duplicateSiret = await prisma.mover.findFirst({
      where: {
        siret: data.siret,
        deletedAt: null,
        id: { not: id },
      },
    });

    if (duplicateSiret) {
      throw ApiError.conflict('Mover with this SIRET already exists');
    }
  }

  // Check email unique if updating
  if (data.email && data.email !== existingMover.email) {
    const duplicateEmail = await prisma.mover.findFirst({
      where: {
        email: data.email,
        deletedAt: null,
        id: { not: id },
      },
    });

    if (duplicateEmail) {
      throw ApiError.conflict('Mover with this email already exists');
    }
  }

  return prisma.mover.update({
    where: { id },
    data,
  });
}

/**
 * Blacklist/unblacklist mover (admin action)
 */
export async function blacklistMover(data: BlacklistMoverInput) {
  const { moverId, blacklisted, blacklistReason } = data;

  const mover = await prisma.mover.findFirst({
    where: { id: moverId, deletedAt: null },
  });

  if (!mover) {
    throw ApiError.notFound('Mover not found');
  }

  // If blacklisting, require reason
  if (blacklisted && !blacklistReason) {
    throw ApiError.badRequest('Blacklist reason is required when blacklisting a mover');
  }

  const updatedMover = await prisma.mover.update({
    where: { id: moverId },
    data: {
      blacklisted,
      blacklistReason: blacklisted ? blacklistReason : null,
      status: blacklisted ? 'SUSPENDED' : 'ACTIVE',
    },
  });

  return updatedMover;
}

/**
 * Soft delete mover
 */
export async function deleteMover(id: string) {
  const mover = await prisma.mover.findFirst({
    where: { id, deletedAt: null },
  });

  if (!mover) {
    throw ApiError.notFound('Mover not found');
  }

  // Check for active quotes
  const activeQuotes = await prisma.quote.count({
    where: {
      moverId: id,
      deletedAt: null,
      status: { in: ['REQUESTED', 'REMINDED', 'VALIDATED'] },
    },
  });

  if (activeQuotes > 0) {
    throw ApiError.badRequest(
      `Cannot delete mover with ${activeQuotes} active quote(s). Please reject or expire them first.`
    );
  }

  // Check for active bookings
  const activeBookings = await prisma.booking.count({
    where: {
      quote: {
        moverId: id,
      },
      status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'] },
    },
  });

  if (activeBookings > 0) {
    throw ApiError.badRequest(
      `Cannot delete mover with ${activeBookings} active booking(s).`
    );
  }

  await prisma.mover.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

