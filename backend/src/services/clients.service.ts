import { prisma } from '../db/client.js';
import { CreateClientInput, UpdateClientInput } from '../schemas/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getSkip, getPaginationMeta } from '../utils/pagination.js';

/**
 * List clients with pagination and filters
 */
export async function listClients(filters: {
  page: number;
  limit: number;
  email?: string;
  phone?: string;
}) {
  const { page, limit, email, phone } = filters;
  const skip = getSkip(page, limit);

  const where: any = {
    deletedAt: null,
  };

  if (email) {
    where.email = { contains: email, mode: 'insensitive' };
  }

  if (phone) {
    where.phone = { contains: phone };
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            folders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    data: clients,
    meta: getPaginationMeta(page, limit, total),
  };
}

/**
 * Get client by ID with full details
 */
export async function getClientById(id: string) {
  const client = await prisma.client.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      folders: {
        where: { deletedAt: null },
        select: {
          id: true,
          status: true,
          originCity: true,
          destCity: true,
          movingDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          folders: true,
        },
      },
    },
  });

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  // Get bookings count via folders
  const bookingsCount = await prisma.booking.count({
    where: {
      folder: {
        clientId: id,
        deletedAt: null,
      },
    },
  });

  return {
    ...client,
    stats: {
      foldersCount: client._count.folders,
      bookingsCount,
    },
  };
}

/**
 * Create new client
 */
export async function createClient(data: CreateClientInput) {
  // Check email unique
  const existingClient = await prisma.client.findFirst({
    where: {
      email: data.email,
      deletedAt: null,
    },
  });

  if (existingClient) {
    throw ApiError.conflict('Client with this email already exists');
  }

  const client = await prisma.client.create({
    data,
  });

  return client;
}

/**
 * Update client
 */
export async function updateClient(id: string, data: UpdateClientInput) {
  const existingClient = await prisma.client.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingClient) {
    throw ApiError.notFound('Client not found');
  }

  // Check email unique if updating
  if (data.email && data.email !== existingClient.email) {
    const duplicateEmail = await prisma.client.findFirst({
      where: {
        email: data.email,
        deletedAt: null,
        id: { not: id },
      },
    });

    if (duplicateEmail) {
      throw ApiError.conflict('Client with this email already exists');
    }
  }

  return prisma.client.update({
    where: { id },
    data,
  });
}

/**
 * Anonymize client (RGPD compliance)
 */
export async function anonymizeClient(id: string, reason: string) {
  const client = await prisma.client.findFirst({
    where: { id, deletedAt: null },
  });

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  // Check for active bookings
  const activeBookings = await prisma.booking.count({
    where: {
      folder: {
        clientId: id,
      },
      status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'] },
    },
  });

  if (activeBookings > 0) {
    throw ApiError.badRequest(
      `Cannot anonymize client with ${activeBookings} active booking(s). Please complete or cancel them first.`
    );
  }

  // Generate anonymized email
  const anonymizedEmail = `deleted-${client.id}@anonymized.local`;

  // Anonymize personal data
  const anonymizedClient = await prisma.client.update({
    where: { id },
    data: {
      email: anonymizedEmail,
      phone: null,
      firstName: 'Anonymized',
      lastName: 'User',
      deletedAt: new Date(),
    },
  });

  // Log anonymization reason (could be stored in an audit log table)
  console.log(`Client ${id} anonymized. Reason: ${reason}`);

  return anonymizedClient;
}

