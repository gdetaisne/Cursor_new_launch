import { Request, Response } from 'express';
import * as bookingsService from '../services/bookings.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPaginationParams } from '../utils/pagination.js';

/**
 * POST /api/bookings
 * Create new booking
 */
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingsService.createBooking(req.body);
  res.status(201).json(booking);
});

/**
 * GET /api/bookings
 * List bookings with pagination and filters
 */
export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const { status, confirmedAtFrom, confirmedAtTo } = req.query;

  const result = await bookingsService.listBookings({
    page,
    limit,
    status: status as string,
    confirmedAtFrom: confirmedAtFrom as string,
    confirmedAtTo: confirmedAtTo as string,
  });

  res.json(result);
});

/**
 * GET /api/bookings/:id
 * Get booking details
 */
export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingsService.getBookingById(req.params.id);
  res.json(booking);
});

/**
 * POST /api/payments
 * Create new payment
 */
export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await bookingsService.createPayment(req.body);
  res.status(201).json(payment);
});

/**
 * GET /api/payments
 * List payments with pagination and filters
 */
export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const { status, paidAtFrom, paidAtTo } = req.query;

  const result = await bookingsService.listPayments({
    page,
    limit,
    status: status as string,
    paidAtFrom: paidAtFrom as string,
    paidAtTo: paidAtTo as string,
  });

  res.json(result);
});

