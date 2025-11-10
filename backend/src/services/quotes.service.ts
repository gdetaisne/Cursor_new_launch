import { prisma } from '../db/client.js';
import {
  CreateQuoteInput,
  UpdateQuoteInput,
  ValidateQuoteInput,
  ScoreQuoteInput,
} from '../schemas/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getSkip, getPaginationMeta } from '../utils/pagination.js';

/**
 * List quotes with pagination and filters
 */
export async function listQuotes(filters: {
  page: number;
  limit: number;
  folderId?: string;
  moverId?: string;
  status?: string;
}) {
  const { page, limit, folderId, moverId, status } = filters;
  const skip = getSkip(page, limit);

  const where: any = {
    deletedAt: null,
  };

  if (folderId) {
    where.folderId = folderId;
  }

  if (moverId) {
    where.moverId = moverId;
  }

  if (status) {
    where.status = status;
  }

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      skip,
      take: limit,
      include: {
        mover: {
          select: {
            id: true,
            companyName: true,
            city: true,
            googleRating: true,
            googleReviewsCount: true,
          },
        },
        folder: {
          select: {
            id: true,
            originCity: true,
            destCity: true,
            movingDate: true,
            status: true,
          },
        },
      },
      orderBy: [
        { scoreTotal: 'desc' },
        { createdAt: 'desc' },
      ],
    }),
    prisma.quote.count({ where }),
  ]);

  return {
    data: quotes,
    meta: getPaginationMeta(page, limit, total),
  };
}

/**
 * Get quotes for a specific folder
 */
export async function getQuotesByFolder(folderId: string) {
  // Verify folder exists
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, deletedAt: null },
  });

  if (!folder) {
    throw ApiError.notFound('Folder not found');
  }

  const quotes = await prisma.quote.findMany({
    where: {
      folderId,
      deletedAt: null,
    },
    include: {
      mover: {
        select: {
          id: true,
          companyName: true,
          city: true,
          email: true,
          phone: true,
          googleRating: true,
          googleReviewsCount: true,
          status: true,
        },
      },
      validatedByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { scoreTotal: 'desc' },
  });

  return quotes;
}

/**
 * Get quote by ID
 */
export async function getQuoteById(id: string) {
  const quote = await prisma.quote.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      mover: true,
      folder: {
        include: {
          client: true,
        },
      },
      validatedByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      pricingGrid: true,
    },
  });

  if (!quote) {
    throw ApiError.notFound('Quote not found');
  }

  return quote;
}

/**
 * Create new quote
 */
export async function createQuote(data: CreateQuoteInput) {
  // Verify folder exists
  const folder = await prisma.folder.findFirst({
    where: { id: data.folderId, deletedAt: null },
  });

  if (!folder) {
    throw ApiError.notFound('Folder not found');
  }

  // Verify mover exists
  const mover = await prisma.mover.findFirst({
    where: { id: data.moverId, deletedAt: null },
  });

  if (!mover) {
    throw ApiError.notFound('Mover not found');
  }

  // Check mover not blacklisted
  if (mover.blacklisted) {
    throw ApiError.badRequest('Cannot create quote for blacklisted mover');
  }

  // Verify pricing grid if provided
  if (data.pricingGridId) {
    const grid = await prisma.pricingGrid.findFirst({
      where: {
        id: data.pricingGridId,
        moverId: data.moverId,
        deletedAt: null,
      },
    });

    if (!grid) {
      throw ApiError.notFound('Pricing grid not found for this mover');
    }
  }

  // Create quote
  const quote = await prisma.quote.create({
    data: {
      ...data,
      status: 'REQUESTED',
    },
    include: {
      mover: {
        select: {
          id: true,
          companyName: true,
          email: true,
          phone: true,
        },
      },
      folder: {
        select: {
          id: true,
          originCity: true,
          destCity: true,
        },
      },
    },
  });

  return quote;
}

/**
 * Update quote
 */
export async function updateQuote(id: string, data: UpdateQuoteInput) {
  const existingQuote = await prisma.quote.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingQuote) {
    throw ApiError.notFound('Quote not found');
  }

  return prisma.quote.update({
    where: { id },
    data,
    include: {
      mover: true,
      folder: true,
    },
  });
}

/**
 * Validate quote (admin action)
 */
export async function validateQuote(data: ValidateQuoteInput) {
  const { quoteId, validatedByUserId, approved, rejectionReason } = data;

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, deletedAt: null },
  });

  if (!quote) {
    throw ApiError.notFound('Quote not found');
  }

  // Verify user exists and is admin/operator
  const user = await prisma.user.findFirst({
    where: {
      id: validatedByUserId,
      deletedAt: null,
      active: true,
      role: { in: ['ADMIN', 'OPERATOR'] },
    },
  });

  if (!user) {
    throw ApiError.forbidden('User not authorized to validate quotes');
  }

  // Update quote status
  const updatedQuote = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: approved ? 'VALIDATED' : 'REJECTED',
      validatedByUserId,
      validatedAt: new Date(),
      rejectionReason: approved ? null : rejectionReason,
    },
    include: {
      mover: true,
      folder: true,
      validatedByUser: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return updatedQuote;
}

/**
 * Score quote (admin action)
 */
export async function scoreQuote(data: ScoreQuoteInput) {
  const { quoteId, scorePrice, scoreGoogle, scoreFinancial, scoreLitigations } = data;

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, deletedAt: null },
  });

  if (!quote) {
    throw ApiError.notFound('Quote not found');
  }

  // Calculate weighted average score
  // Price: 40%, Google: 30%, Financial: 20%, Litigations: 10%
  const weights = {
    price: 0.4,
    google: 0.3,
    financial: 0.2,
    litigations: 0.1,
  };

  const scoreTotal =
    scorePrice * weights.price +
    scoreGoogle * weights.google +
    scoreFinancial * weights.financial +
    (scoreLitigations || 100) * weights.litigations;

  // Update quote with scores
  const updatedQuote = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      scorePrice,
      scoreGoogle,
      scoreFinancial,
      scoreLitigations: scoreLitigations || null,
      scoreTotal: Math.round(scoreTotal * 100) / 100, // Round to 2 decimals
    },
    include: {
      mover: true,
      folder: true,
    },
  });

  return updatedQuote;
}

/**
 * Send reminder to mover (increment reminderCount)
 */
export async function remindQuote(id: string) {
  const quote = await prisma.quote.findFirst({
    where: {
      id,
      deletedAt: null,
      status: { in: ['REQUESTED', 'REMINDED'] },
    },
  });

  if (!quote) {
    throw ApiError.notFound('Quote not found or not in remindable state');
  }

  const updatedQuote = await prisma.quote.update({
    where: { id },
    data: {
      status: 'REMINDED',
      reminderCount: { increment: 1 },
      lastRemindedAt: new Date(),
    },
    include: {
      mover: true,
      folder: true,
    },
  });

  return updatedQuote;
}

/**
 * Soft delete quote
 */
export async function deleteQuote(id: string) {
  const quote = await prisma.quote.findFirst({
    where: { id, deletedAt: null },
  });

  if (!quote) {
    throw ApiError.notFound('Quote not found');
  }

  // Check if quote is selected
  const folder = await prisma.folder.findFirst({
    where: { selectedQuoteId: id },
  });

  if (folder) {
    throw ApiError.badRequest('Cannot delete quote that is selected by a folder');
  }

  // Check if quote has booking
  const booking = await prisma.booking.findFirst({
    where: { quoteId: id },
  });

  if (booking) {
    throw ApiError.badRequest('Cannot delete quote that has an associated booking');
  }

  await prisma.quote.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

