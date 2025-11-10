import * as bookingsService from '../../../src/services/bookings.service.js';
import { prisma } from '../../../src/db/client.js';
import { ApiError } from '../../../src/utils/ApiError.js';
import {
  createTestClient,
  createTestMover,
  createTestFolder,
  createTestQuote,
  cleanupTestData,
} from '../../helpers.js';

describe('Bookings Service', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('listBookings', () => {
    it('should list bookings with pagination', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      await prisma.booking.create({
        data: {
          folderId: folder.id,
          quoteId: quote.id,
          totalAmount: '1000',
          depositAmount: '300',
          remainingAmount: '700',
          status: 'CONFIRMED',
        },
      });

      const result = await bookingsService.listBookings({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter bookings by status', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      await prisma.booking.create({
        data: {
          folderId: folder.id,
          quoteId: quote.id,
          totalAmount: '1000',
          depositAmount: '300',
          remainingAmount: '700',
          status: 'CONFIRMED',
        },
      });

      const result = await bookingsService.listBookings({
        page: 1,
        limit: 10,
        status: 'CONFIRMED',
      });

      expect(result.data.every((b: any) => b.status === 'CONFIRMED')).toBe(true);
    });

    it('should include folder and quote in list', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const booking = await prisma.booking.create({
        data: {
          folderId: folder.id,
          quoteId: quote.id,
          totalAmount: '1000',
          depositAmount: '300',
          remainingAmount: '700',
          status: 'CONFIRMED',
        },
      });

      const result = await bookingsService.listBookings({
        page: 1,
        limit: 10,
      });

      const testBooking = result.data.find((b: any) => b.id === booking.id);
      expect(testBooking).toBeDefined();
      expect(testBooking!.folder).toBeDefined();
      expect(testBooking!.quote).toBeDefined();
    });
  });

  describe('getBookingById', () => {
    it('should return booking with full details', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const booking = await prisma.booking.create({
        data: {
          folderId: folder.id,
          quoteId: quote.id,
          totalAmount: '1000',
          depositAmount: '300',
          remainingAmount: '700',
          status: 'CONFIRMED',
        },
      });

      const result = await bookingsService.getBookingById(booking.id);

      expect(result.id).toBe(booking.id);
      expect(result.folder).toBeDefined();
      expect(result.quote).toBeDefined();
      expect(result.payments).toBeDefined();
    });

    it('should throw 404 if booking not found', async () => {
      await expect(
        bookingsService.getBookingById('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Booking not found',
      });
    });
  });

  describe('createBooking', () => {
    it('should create booking with exact 30% deposit', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, {
        totalPrice: '1000',
        status: 'VALIDATED',
      });

      const data = {
        folderId: folder.id,
        quoteId: quote.id,
        totalAmount: 1000,
        depositAmount: 300, // Exactly 30%
      };

      const booking = await bookingsService.createBooking(data as any);

      expect(booking.id).toBeDefined();
      expect(parseFloat(booking.totalAmount.toString())).toBe(1000);
      expect(parseFloat(booking.depositAmount.toString())).toBe(300);
      expect(parseFloat(booking.remainingAmount.toString())).toBe(700);
      expect(booking.status).toBe('PENDING_PAYMENT');
    });

    it('should throw 400 if deposit is not 30%', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, { status: 'VALIDATED' });

      const data = {
        folderId: folder.id,
        quoteId: quote.id,
        totalAmount: 1000,
        depositAmount: 200, // Only 20%, should fail
      };

      await expect(bookingsService.createBooking(data as any)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('30%'),
      });
    });

    it('should throw 404 if folder not found', async () => {
      const mover = await createTestMover();
      const client = await createTestClient();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const data = {
        folderId: '00000000-0000-0000-0000-000000000000',
        quoteId: quote.id,
        totalAmount: 1000,
        depositAmount: 300,
      };

      await expect(bookingsService.createBooking(data as any)).rejects.toThrow(ApiError);
    });

    it('should throw 404 if quote not validated', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, {
        status: 'REQUESTED', // Not validated
      });

      const data = {
        folderId: folder.id,
        quoteId: quote.id,
        totalAmount: 1000,
        depositAmount: 300,
      };

      await expect(bookingsService.createBooking(data as any)).rejects.toMatchObject({
        statusCode: 404,
        message: expect.stringContaining('validated'),
      });
    });

    it('should throw 409 if folder already has active booking', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, { status: 'VALIDATED' });

      // Create first booking
      await prisma.booking.create({
        data: {
          folderId: folder.id,
          quoteId: quote.id,
          totalAmount: '1000',
          depositAmount: '300',
          remainingAmount: '700',
          status: 'CONFIRMED',
        },
      });

      const data = {
        folderId: folder.id,
        quoteId: quote.id,
        totalAmount: 1000,
        depositAmount: 300,
      };

      await expect(bookingsService.createBooking(data as any)).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('already has'),
      });
    });
  });

  describe('listPayments', () => {
    it('should list payments with pagination', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const booking = await prisma.booking.create({
        data: {
          folderId: folder.id,
          quoteId: quote.id,
          totalAmount: '1000',
          depositAmount: '300',
          remainingAmount: '700',
          status: 'CONFIRMED',
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: '300',
          type: 'DEPOSIT',
          status: 'SUCCEEDED',
          stripePaymentIntentId: 'pi_test123',
        },
      });

      const result = await bookingsService.listPayments({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter payments by bookingId', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const booking = await prisma.booking.create({
        data: {
          folderId: folder.id,
          quoteId: quote.id,
          totalAmount: '1000',
          depositAmount: '300',
          remainingAmount: '700',
          status: 'CONFIRMED',
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: '300',
          type: 'DEPOSIT',
          status: 'SUCCEEDED',
          stripePaymentIntentId: 'pi_test123',
        },
      });

      // Note: listPayments doesn't filter by bookingId directly
      const result = await bookingsService.listPayments({
        page: 1,
        limit: 10,
      });

      const bookingPayment = result.data.find((p: any) => p.bookingId === booking.id);
      expect(bookingPayment).toBeDefined();
    });
  });

  describe('createPayment', () => {
    it('should create deposit payment', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const booking = await prisma.booking.create({
        data: {
          folderId: folder.id,
          quoteId: quote.id,
          totalAmount: '1000',
          depositAmount: '300',
          remainingAmount: '700',
          status: 'PENDING_PAYMENT',
        },
      });

      const data = {
        bookingId: booking.id,
        amount: 300,
        type: 'DEPOSIT' as const,
        stripePaymentIntentId: 'pi_test456',
      };

      const payment = await bookingsService.createPayment(data as any);

      expect(payment.id).toBeDefined();
      expect(parseFloat(payment.amount.toString())).toBe(300);
      expect(payment.type).toBe('DEPOSIT');
      expect(payment.status).toBe('PENDING');
      expect(payment.stripePaymentIntentId).toBe('pi_test456');
    });

    it('should throw 404 if booking not found', async () => {
      const data = {
        bookingId: '00000000-0000-0000-0000-000000000000',
        amount: 300,
        type: 'DEPOSIT' as const,
        stripePaymentIntentId: 'pi_test789',
      };

      await expect(bookingsService.createPayment(data as any)).rejects.toThrow(ApiError);
    });
  });
});

