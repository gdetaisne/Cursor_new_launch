import { prisma } from '../db/client.js';
import { CreateLeadInput } from '../schemas/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getSkip, getPaginationMeta } from '../utils/pagination.js';

/**
 * List leads with pagination and filters
 */
export async function listLeads(filters: {
  page: number;
  limit: number;
  status?: string;
  source?: string;
}) {
  const { page, limit, status, source } = filters;
  const skip = getSkip(page, limit);

  const where: any = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (source) {
    where.source = { contains: source, mode: 'insensitive' };
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        source: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        originCity: true,
        originPostalCode: true,
        destCity: true,
        destPostalCode: true,
        estimatedVolume: true,
        estimationMethod: true,
        movingDate: true,
        status: true,
        createdAt: true,
        convertedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    data: leads,
    meta: getPaginationMeta(page, limit, total),
  };
}

/**
 * Get lead by ID
 */
export async function getLeadById(id: string) {
  const lead = await prisma.lead.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      folder: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  return lead;
}

/**
 * Create new lead
 */
export async function createLead(data: CreateLeadInput) {
  const lead = await prisma.lead.create({
    data: {
      ...data,
      status: 'NEW',
    },
  });

  return lead;
}

/**
 * Convert lead to folder
 */
export async function convertLead(leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, deletedAt: null },
  });

  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  if (lead.status === 'CONVERTED') {
    throw ApiError.badRequest('Lead already converted');
  }

  // Check if client exists with this email
  let client = await prisma.client.findFirst({
    where: {
      email: lead.email,
      deletedAt: null,
    },
  });

  // Create client if doesn't exist
  if (!client) {
    client = await prisma.client.create({
      data: {
        email: lead.email,
        phone: lead.phone || '',
        firstName: lead.firstName,
        lastName: lead.lastName,
      },
    });
  }

  // Create folder from lead
  const folder = await prisma.folder.create({
    data: {
      leadId: leadId,
      clientId: client.id,
      originAddress: lead.originAddress,
      originCity: lead.originCity,
      originPostalCode: lead.originPostalCode,
      destAddress: lead.destAddress,
      destCity: lead.destCity,
      destPostalCode: lead.destPostalCode,
      volume: lead.estimatedVolume || '0',
      distance: '0', // Will be calculated later
      movingDate: lead.movingDate || new Date(),
      flexibleDate: false,
      needPacking: false,
      needStorage: false,
      needInsurance: false,
      status: 'CREATED',
    },
    include: {
      client: true,
      lead: true,
    },
  });

  // Update lead status
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: 'CONVERTED',
      convertedAt: new Date(),
    },
  });

  return folder;
}

