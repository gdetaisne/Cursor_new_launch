import { prisma } from '../db/client.js';
import {
  CreateFolderInput,
  UpdateFolderInput,
  SelectQuoteInput,
} from '../schemas/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getSkip, getPaginationMeta } from '../utils/pagination.js';

/**
 * List folders with pagination and filters
 */
export async function listFolders(filters: {
  page: number;
  limit: number;
  status?: string;
  clientId?: string;
  movingDateFrom?: string;
  movingDateTo?: string;
}) {
  const { page, limit, status, clientId, movingDateFrom, movingDateTo } = filters;
  const skip = getSkip(page, limit);

  const where: any = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (clientId) {
    where.clientId = clientId;
  }

  if (movingDateFrom || movingDateTo) {
    where.movingDate = {};
    if (movingDateFrom) {
      where.movingDate.gte = new Date(movingDateFrom);
    }
    if (movingDateTo) {
      where.movingDate.lte = new Date(movingDateTo);
    }
  }

  const [folders, total] = await Promise.all([
    prisma.folder.findMany({
      where,
      skip,
      take: limit,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            quotes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.folder.count({ where }),
  ]);

  return {
    data: folders,
    meta: getPaginationMeta(page, limit, total),
  };
}

/**
 * Get folder by ID with full details
 */
export async function getFolderById(id: string) {
  const folder = await prisma.folder.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      client: true,
      lead: true,
      selectedQuote: {
        include: {
          mover: {
            select: {
              id: true,
              companyName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      quotes: {
        where: { deletedAt: null },
        include: {
          mover: {
            select: {
              id: true,
              companyName: true,
              city: true,
              googleRating: true,
            },
          },
        },
        orderBy: { scoreTotal: 'desc' },
      },
      booking: {
        include: {
          payments: true,
        },
      },
      top3Selections: {
        orderBy: { presentedAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!folder) {
    throw ApiError.notFound('Folder not found');
  }

  return folder;
}

/**
 * Create new folder
 */
export async function createFolder(data: CreateFolderInput) {
  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: data.clientId },
  });

  if (!client || client.deletedAt) {
    throw ApiError.notFound('Client not found');
  }

  // Verify lead if provided
  if (data.leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: data.leadId },
    });

    if (!lead || lead.deletedAt) {
      throw ApiError.notFound('Lead not found');
    }

    // Check if lead already converted
    const existingFolder = await prisma.folder.findFirst({
      where: { leadId: data.leadId },
    });

    if (existingFolder) {
      throw ApiError.conflict('Lead already converted to folder');
    }
  }

  // Create folder
  const folder = await prisma.folder.create({
    data: {
      ...data,
      status: 'CREATED',
    },
    include: {
      client: true,
      lead: true,
    },
  });

  // Update lead status if provided
  if (data.leadId) {
    await prisma.lead.update({
      where: { id: data.leadId },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date(),
      },
    });
  }

  return folder;
}

/**
 * Update folder
 */
export async function updateFolder(id: string, data: UpdateFolderInput) {
  const existingFolder = await prisma.folder.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingFolder) {
    throw ApiError.notFound('Folder not found');
  }

  return prisma.folder.update({
    where: { id },
    data,
    include: {
      client: true,
      lead: true,
    },
  });
}

/**
 * Select quote for folder
 */
export async function selectQuote(folderId: string, quoteId: string) {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, deletedAt: null },
  });

  if (!folder) {
    throw ApiError.notFound('Folder not found');
  }

  const quote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      folderId,
      deletedAt: null,
      status: 'VALIDATED', // Only validated quotes can be selected
    },
  });

  if (!quote) {
    throw ApiError.notFound('Quote not found or not validated');
  }

  return prisma.folder.update({
    where: { id: folderId },
    data: {
      selectedQuoteId: quoteId,
      status: 'AWAITING_PAYMENT',
    },
    include: {
      selectedQuote: {
        include: {
          mover: true,
        },
      },
    },
  });
}

/**
 * Soft delete folder
 */
export async function deleteFolder(id: string) {
  const folder = await prisma.folder.findFirst({
    where: { id, deletedAt: null },
  });

  if (!folder) {
    throw ApiError.notFound('Folder not found');
  }

  // Check if folder has active booking
  const booking = await prisma.booking.findFirst({
    where: {
      folderId: id,
      status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'] },
    },
  });

  if (booking) {
    throw ApiError.badRequest('Cannot delete folder with active booking');
  }

  await prisma.folder.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

