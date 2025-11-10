import * as quotesService from '../../../src/services/quotes.service.js';
import { prisma } from '../../../src/db/client.js';
import { ApiError } from '../../../src/utils/ApiError.js';
import {
  createTestClient,
  createTestMover,
  createTestFolder,
  createTestQuote,
  cleanupTestData,
} from '../../helpers.js';

describe('Quotes Service', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('listQuotes', () => {
    it('should list quotes with pagination', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      await createTestQuote(folder.id, mover.id);
      await createTestQuote(folder.id, mover.id);

      const result = await quotesService.listQuotes({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter quotes by folderId', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder1 = await createTestFolder(client.id);
      const folder2 = await createTestFolder(client.id);
      await createTestQuote(folder1.id, mover.id);
      await createTestQuote(folder2.id, mover.id);

      const result = await quotesService.listQuotes({
        page: 1,
        limit: 10,
        folderId: folder1.id,
      });

      expect(result.data.every((q: any) => q.folderId === folder1.id)).toBe(true);
    });

    it('should filter quotes by moverId', async () => {
      const client = await createTestClient();
      const mover1 = await createTestMover();
      const mover2 = await createTestMover();
      const folder = await createTestFolder(client.id);
      await createTestQuote(folder.id, mover1.id);
      await createTestQuote(folder.id, mover2.id);

      const result = await quotesService.listQuotes({
        page: 1,
        limit: 10,
        moverId: mover1.id,
      });

      expect(result.data.every((q: any) => q.moverId === mover1.id)).toBe(true);
    });

    it('should filter quotes by status', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      await createTestQuote(folder.id, mover.id, { status: 'REQUESTED' });
      await createTestQuote(folder.id, mover.id, { status: 'VALIDATED' });

      const result = await quotesService.listQuotes({
        page: 1,
        limit: 10,
        status: 'VALIDATED',
      });

      expect(result.data.every((q: any) => q.status === 'VALIDATED')).toBe(true);
    });

    it('should order quotes by scoreTotal DESC', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      await createTestQuote(folder.id, mover.id, { 
        status: 'VALIDATED',
        scoreTotal: '50',
      });
      await createTestQuote(folder.id, mover.id, { 
        status: 'VALIDATED',
        scoreTotal: '90',
      });

      const result = await quotesService.listQuotes({
        page: 1,
        limit: 10,
      });

      const scores = result.data.map((q: any) => parseFloat(q.scoreTotal || '0'));
      expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
    });
  });

  describe('getQuotesByFolder', () => {
    it('should return quotes for a folder ordered by score', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      await createTestQuote(folder.id, mover.id, { scoreTotal: '70' });
      await createTestQuote(folder.id, mover.id, { scoreTotal: '95' });

      const quotes = await quotesService.getQuotesByFolder(folder.id);

      expect(quotes.length).toBe(2);
      const scores = quotes.map((q: any) => parseFloat(q.scoreTotal || '0'));
      expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
    });

    it('should throw 404 if folder not found', async () => {
      await expect(
        quotesService.getQuotesByFolder('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Folder not found',
      });
    });
  });

  describe('getQuoteById', () => {
    it('should return quote with full details', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const result = await quotesService.getQuoteById(quote.id);

      expect(result.id).toBe(quote.id);
      expect(result.mover).toBeDefined();
      expect(result.folder).toBeDefined();
    });

    it('should throw 404 if quote not found', async () => {
      await expect(
        quotesService.getQuoteById('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Quote not found',
      });
    });
  });

  describe('createQuote', () => {
    it('should create quote successfully', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);

      const data = {
        folderId: folder.id,
        moverId: mover.id,
        source: 'AUTO_GENERATED' as const,
        totalPrice: 1500,
        currency: 'EUR',
        validUntil: new Date('2026-01-15'),
      };

      const quote = await quotesService.createQuote(data as any);

      expect(quote.id).toBeDefined();
      expect(quote.folderId).toBe(folder.id);
      expect(quote.moverId).toBe(mover.id);
      expect(quote.status).toBe('REQUESTED');
    });

    it('should throw 404 if folder not found', async () => {
      const mover = await createTestMover();

      const data = {
        folderId: '00000000-0000-0000-0000-000000000000',
        moverId: mover.id,
        source: 'AUTO_GENERATED' as const,
        totalPrice: 1500,
        currency: 'EUR',
        validUntil: new Date('2026-01-15'),
      };

      await expect(quotesService.createQuote(data as any)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Folder not found',
      });
    });

    it('should throw 404 if mover not found', async () => {
      const client = await createTestClient();
      const folder = await createTestFolder(client.id);

      const data = {
        folderId: folder.id,
        moverId: '00000000-0000-0000-0000-000000000000',
        source: 'AUTO_GENERATED' as const,
        totalPrice: 1500,
        currency: 'EUR',
        validUntil: new Date('2026-01-15'),
      };

      await expect(quotesService.createQuote(data as any)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Mover not found',
      });
    });

    it('should throw 400 if mover is blacklisted', async () => {
      const client = await createTestClient();
      const mover = await createTestMover({ blacklisted: true, blacklistReason: 'Fraud' });
      const folder = await createTestFolder(client.id);

      const data = {
        folderId: folder.id,
        moverId: mover.id,
        source: 'AUTO_GENERATED' as const,
        totalPrice: 1500,
        currency: 'EUR',
        validUntil: new Date('2026-01-15'),
      };

      await expect(quotesService.createQuote(data as any)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Cannot create quote for blacklisted mover',
      });
    });
  });

  describe('updateQuote', () => {
    it('should update quote successfully', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const updated = await quotesService.updateQuote(quote.id, {
        totalPrice: 1800,
        notes: 'Updated pricing',
      } as any);

      expect(updated.id).toBe(quote.id);
      expect(parseFloat(updated.totalPrice.toString())).toBe(1800);
      expect(updated.notes).toBe('Updated pricing');
    });

    it('should throw 404 if quote not found', async () => {
      await expect(
        quotesService.updateQuote('00000000-0000-0000-0000-000000000000', {} as any)
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Quote not found',
      });
    });
  });

  describe('validateQuote', () => {
    it('should validate and approve quote', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      // Create admin user
      const user = await prisma.user.create({
        data: {
          email: 'admin@test.local',
          passwordHash: 'hashed',
          firstName: 'Admin',
          lastName: 'Test',
          role: 'ADMIN',
        },
      });

      const validated = await quotesService.validateQuote({
        quoteId: quote.id,
        validatedByUserId: user.id,
        approved: true,
      });

      expect(validated.status).toBe('VALIDATED');
      expect(validated.validatedByUserId).toBe(user.id);
      expect(validated.validatedAt).toBeDefined();
    });

    it('should reject quote with reason', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const user = await prisma.user.create({
        data: {
          email: 'admin2@test.local',
          passwordHash: 'hashed',
          firstName: 'Admin',
          lastName: 'Test',
          role: 'ADMIN',
        },
      });

      const rejected = await quotesService.validateQuote({
        quoteId: quote.id,
        validatedByUserId: user.id,
        approved: false,
        rejectionReason: 'Price too high',
      });

      expect(rejected.status).toBe('REJECTED');
      expect(rejected.rejectionReason).toBe('Price too high');
    });

    it('should throw 403 if user is not admin', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      const user = await prisma.user.create({
        data: {
          email: 'user@test.local',
          passwordHash: 'hashed',
          firstName: 'User',
          lastName: 'Test',
          role: 'MOVER_USER', // Not admin
        },
      });

      await expect(
        quotesService.validateQuote({
          quoteId: quote.id,
          validatedByUserId: user.id,
          approved: true,
        })
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'User not authorized to validate quotes',
      });
    });
  });

  describe('scoreQuote', () => {
    it('should calculate weighted score correctly', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      // Weights: Price 40%, Google 30%, Financial 20%, Litigations 10%
      // Score: 90*0.4 + 85*0.3 + 80*0.2 + 95*0.1 = 36 + 25.5 + 16 + 9.5 = 87
      const scored = await quotesService.scoreQuote({
        quoteId: quote.id,
        scorePrice: 90,
        scoreGoogle: 85,
        scoreFinancial: 80,
        scoreLitigations: 95,
      });

      expect(parseFloat(scored.scorePrice!.toString())).toBe(90);
      expect(parseFloat(scored.scoreGoogle!.toString())).toBe(85);
      expect(parseFloat(scored.scoreFinancial!.toString())).toBe(80);
      expect(parseFloat(scored.scoreLitigations!.toString())).toBe(95);
      expect(parseFloat(scored.scoreTotal!.toString())).toBe(87);
    });

    it('should use 100 for litigations if not provided', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      // No litigations score provided, should use 100
      // Score: 80*0.4 + 70*0.3 + 60*0.2 + 100*0.1 = 32 + 21 + 12 + 10 = 75
      const scored = await quotesService.scoreQuote({
        quoteId: quote.id,
        scorePrice: 80,
        scoreGoogle: 70,
        scoreFinancial: 60,
      });

      expect(parseFloat(scored.scoreTotal!.toString())).toBe(75);
    });

    it('should throw 404 if quote not found', async () => {
      await expect(
        quotesService.scoreQuote({
          quoteId: '00000000-0000-0000-0000-000000000000',
          scorePrice: 90,
          scoreGoogle: 85,
          scoreFinancial: 80,
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Quote not found',
      });
    });
  });

  describe('remindQuote', () => {
    it('should increment reminder count and update status', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, {
        status: 'REQUESTED',
        reminderCount: 0,
      });

      const reminded = await quotesService.remindQuote(quote.id);

      expect(reminded.status).toBe('REMINDED');
      expect(reminded.reminderCount).toBe(1);
      expect(reminded.lastRemindedAt).toBeDefined();
    });

    it('should increment reminder count for already reminded quote', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, {
        status: 'REMINDED',
        reminderCount: 1,
      });

      const reminded = await quotesService.remindQuote(quote.id);

      expect(reminded.reminderCount).toBe(2);
    });

    it('should throw 404 if quote not in remindable state', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, {
        status: 'VALIDATED', // Not remindable
      });

      await expect(
        quotesService.remindQuote(quote.id)
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Quote not found or not in remindable state',
      });
    });
  });

  describe('deleteQuote', () => {
    it('should soft delete quote', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      await quotesService.deleteQuote(quote.id);

      const deleted = await prisma.quote.findUnique({
        where: { id: quote.id },
      });
      expect(deleted?.deletedAt).toBeDefined();
    });

    it('should throw 400 if quote is selected by folder', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, {
        status: 'VALIDATED',
      });

      // Select the quote
      await prisma.folder.update({
        where: { id: folder.id },
        data: { selectedQuoteId: quote.id },
      });

      await expect(
        quotesService.deleteQuote(quote.id)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Cannot delete quote that is selected by a folder',
      });
    });

    it('should throw 400 if quote has booking', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id);

      // Create booking
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

      await expect(
        quotesService.deleteQuote(quote.id)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Cannot delete quote that has an associated booking',
      });
    });
  });
});

