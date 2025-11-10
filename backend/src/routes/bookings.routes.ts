import { Router } from 'express';
import * as bookingsController from '../controllers/bookings.controller.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createBookingSchema, createPaymentSchema } from '../schemas/index.js';

const router = Router();

/**
 * POST /api/bookings
 * Create new booking
 */
router.post(
  '/',
  validateBody(createBookingSchema),
  bookingsController.createBooking
);

/**
 * GET /api/bookings
 * List bookings with pagination and filters
 * Query params: ?page=1&limit=10&status=CONFIRMED&confirmedAtFrom=2025-01-01&confirmedAtTo=2025-12-31
 */
router.get(
  '/',
  bookingsController.listBookings
);

/**
 * GET /api/bookings/:id
 * Get booking details
 */
router.get(
  '/:id',
  bookingsController.getBooking
);

/**
 * POST /api/payments
 * Create new payment
 */
router.post(
  '/payments',
  validateBody(createPaymentSchema),
  bookingsController.createPayment
);

/**
 * GET /api/payments
 * List payments (admin)
 */
router.get(
  '/payments',
  bookingsController.listPayments
);

export default router;

