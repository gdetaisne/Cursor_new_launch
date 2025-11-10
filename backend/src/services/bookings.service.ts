import { prisma } from '../db/client.js';
import {
  CreateBookingInput,
  CreatePaymentInput,
} from '../schemas/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getSkip, getPaginationMeta } from '../utils/pagination.js';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * List bookings with pagination and filters
 */
export async function listBookings(filters: {
  page: number;
  limit: number;
  status?: string;
  confirmedAtFrom?: string;
  confirmedAtTo?: string;
}) {
  const { page, limit, status, confirmedAtFrom, confirmedAtTo } = filters;
  const skip = getSkip(page, limit);

  const where: any = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (confirmedAtFrom || confirmedAtTo) {
    where.confirmedAt = {};
    if (confirmedAtFrom) {
      where.confirmedAt.gte = new Date(confirmedAtFrom);
    }
    if (confirmedAtTo) {
      where.confirmedAt.lte = new Date(confirmedAtTo);
    }
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        folder: {
          select: {
            id: true,
            originCity: true,
            destCity: true,
            movingDate: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        quote: {
          select: {
            id: true,
            totalPrice: true,
            mover: {
              select: {
                companyName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    data: bookings,
    meta: getPaginationMeta(page, limit, total),
  };
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string) {
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      folder: {
        include: {
          client: true,
        },
      },
      quote: {
        include: {
          mover: true,
        },
      },
      payments: true,
    },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  return booking;
}

/**
 * Create new booking
 */
export async function createBooking(data: CreateBookingInput) {
  // Verify folder exists
  const folder = await prisma.folder.findFirst({
    where: { id: data.folderId, deletedAt: null },
  });

  if (!folder) {
    throw ApiError.notFound('Folder not found');
  }

  // Verify quote exists and is validated
  const quote = await prisma.quote.findFirst({
    where: {
      id: data.quoteId,
      folderId: data.folderId,
      deletedAt: null,
      status: 'VALIDATED',
    },
  });

  if (!quote) {
    throw ApiError.notFound('Quote not found or not validated');
  }

  // Validate deposit is 30% of total
  const totalAmount = new Decimal(data.totalAmount);
  const depositAmount = new Decimal(data.depositAmount);
  const expectedDeposit = totalAmount.mul(0.3);

  if (!depositAmount.equals(expectedDeposit)) {
    throw ApiError.badRequest(
      `Deposit must be 30% of total amount (expected: ${expectedDeposit}, got: ${depositAmount})`
    );
  }

  // Calculate remaining amount
  const remainingAmount = totalAmount.sub(depositAmount);

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      ...data,
      remainingAmount: remainingAmount.toString(),
      status: 'PENDING_PAYMENT',
    },
    include: {
      folder: {
        include: {
          client: true,
        },
      },
      quote: {
        include: {
          mover: true,
        },
      },
    },
  });

  // Update folder status
  await prisma.folder.update({
    where: { id: data.folderId },
    data: { status: 'AWAITING_PAYMENT' },
  });

  return booking;
}

/**
 * List payments with pagination and filters
 */
export async function listPayments(filters: {
  page: number;
  limit: number;
  status?: string;
  paidAtFrom?: string;
  paidAtTo?: string;
}) {
  const { page, limit, status, paidAtFrom, paidAtTo } = filters;
  const skip = getSkip(page, limit);

  const where: any = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (paidAtFrom || paidAtTo) {
    where.paidAt = {};
    if (paidAtFrom) {
      where.paidAt.gte = new Date(paidAtFrom);
    }
    if (paidAtTo) {
      where.paidAt.lte = new Date(paidAtTo);
    }
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      include: {
        booking: {
          select: {
            id: true,
            folder: {
              select: {
                id: true,
                client: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            quote: {
              select: {
                mover: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    data: payments,
    meta: getPaginationMeta(page, limit, total),
  };
}

/**
 * Create new payment
 */
export async function createPayment(data: CreatePaymentInput) {
  // Verify booking exists
  const booking = await prisma.booking.findFirst({
    where: { id: data.bookingId, deletedAt: null },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Calculate commission and mover amount
  const amount = new Decimal(data.amount);
  const commissionRate = new Decimal(data.commissionRate);
  const commissionAmount = amount.mul(commissionRate);
  const moverAmount = amount.sub(commissionAmount);

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      ...data,
      commissionAmount: commissionAmount.toString(),
      moverAmount: moverAmount.toString(),
      status: 'PENDING',
    },
    include: {
      booking: {
        include: {
          folder: {
            select: {
              id: true,
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          quote: {
            select: {
              mover: {
                select: {
                  companyName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return payment;
}

