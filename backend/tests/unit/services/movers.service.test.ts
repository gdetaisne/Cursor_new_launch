import * as moversService from '../../../src/services/movers.service.js';
import { prisma } from '../../../src/db/client.js';
import { ApiError } from '../../../src/utils/ApiError.js';
import {
  createTestMover,
  createTestClient,
  createTestFolder,
  createTestQuote,
  generateTestSiret,
  generateTestEmail,
  cleanupTestData,
} from '../../helpers.js';

describe('Movers Service', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('listMovers', () => {
    it('should list movers with pagination', async () => {
      await createTestMover();
      await createTestMover();

      const result = await moversService.listMovers({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter movers by status', async () => {
      await createTestMover({ status: 'ACTIVE' });
      await createTestMover({ status: 'PENDING' });

      const result = await moversService.listMovers({
        page: 1,
        limit: 10,
        status: 'ACTIVE',
      });

      expect(result.data.every((m: any) => m.status === 'ACTIVE')).toBe(true);
    });

    it('should filter movers by city (case-insensitive)', async () => {
      await createTestMover({ city: 'Paris' });
      await createTestMover({ city: 'Lyon' });

      const result = await moversService.listMovers({
        page: 1,
        limit: 10,
        city: 'paris', // Lowercase
      });

      expect(result.data.every((m: any) => 
        m.city.toLowerCase().includes('paris')
      )).toBe(true);
    });

    it('should filter movers by postalCode', async () => {
      await createTestMover({ postalCode: '75001' });
      await createTestMover({ postalCode: '69001' });

      const result = await moversService.listMovers({
        page: 1,
        limit: 10,
        postalCode: '75001',
      });

      expect(result.data.every((m: any) => m.postalCode === '75001')).toBe(true);
    });

    it('should include counts (pricingGrids, quotes, users)', async () => {
      const mover = await createTestMover();

      const result = await moversService.listMovers({
        page: 1,
        limit: 10,
      });

      const testMover = result.data.find((m: any) => m.id === mover.id);
      expect(testMover).toBeDefined();
      expect(testMover!._count).toBeDefined();
      expect(testMover!._count.pricingGrids).toBeDefined();
      expect(testMover!._count.quotes).toBeDefined();
      expect(testMover!._count.users).toBeDefined();
    });
  });

  describe('getMoverById', () => {
    it('should return mover with full details and stats', async () => {
      const mover = await createTestMover();

      const result = await moversService.getMoverById(mover.id);

      expect(result.id).toBe(mover.id);
      expect(result.pricingGrids).toBeDefined();
      expect(result.users).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.stats.quotesCount).toBeDefined();
      expect(result.stats.bookingsCount).toBeDefined();
    });

    it('should throw 404 if mover not found', async () => {
      await expect(
        moversService.getMoverById('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Mover not found',
      });
    });

    it('should throw 404 if mover is soft deleted', async () => {
      const mover = await createTestMover();
      
      await prisma.mover.update({
        where: { id: mover.id },
        data: { deletedAt: new Date() },
      });

      await expect(
        moversService.getMoverById(mover.id)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('createMover', () => {
    it('should create mover successfully', async () => {
      const data = {
        companyName: 'Test Mover Company',
        siret: generateTestSiret(),
        email: generateTestEmail(),
        phone: '0612345678',
        address: '123 Test St',
        city: 'Paris',
        postalCode: '75001',
        coverageZones: JSON.stringify(['75', '77', '78']),
      };

      const mover = await moversService.createMover(data as any);

      expect(mover.id).toBeDefined();
      expect(mover.status).toBe('PENDING'); // New movers start as PENDING
      expect(mover.companyName).toBe('Test Mover Company');
    });

    it('should throw 409 if SIRET already exists', async () => {
      const siret = generateTestSiret();
      await createTestMover({ siret });

      const data = {
        companyName: 'Another Company',
        siret, // Same SIRET
        email: generateTestEmail(),
        phone: '0612345679',
        address: '456 Test Ave',
        city: 'Lyon',
        postalCode: '69001',
        coverageZones: JSON.stringify(['69']),
      };

      await expect(moversService.createMover(data as any)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Mover with this SIRET already exists',
      });
    });

    it('should throw 409 if email already exists', async () => {
      const email = generateTestEmail();
      await createTestMover({ email });

      const data = {
        companyName: 'Another Company',
        siret: generateTestSiret(),
        email, // Same email
        phone: '0612345679',
        address: '456 Test Ave',
        city: 'Lyon',
        postalCode: '69001',
        coverageZones: JSON.stringify(['69']),
      };

      await expect(moversService.createMover(data as any)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Mover with this email already exists',
      });
    });
  });

  describe('updateMover', () => {
    it('should update mover successfully', async () => {
      const mover = await createTestMover();

      const updated = await moversService.updateMover(mover.id, {
        city: 'Marseille',
        googleRating: 4.8,
      } as any);

      expect(updated.id).toBe(mover.id);
      expect(updated.city).toBe('Marseille');
      expect(parseFloat(updated.googleRating?.toString() || '0')).toBe(4.8);
    });

    it('should throw 404 if mover not found', async () => {
      await expect(
        moversService.updateMover('00000000-0000-0000-0000-000000000000', {} as any)
      ).rejects.toThrow(ApiError);
    });

    it('should throw 409 if updating to duplicate SIRET', async () => {
      const mover1 = await createTestMover();
      const mover2 = await createTestMover();

      await expect(
        moversService.updateMover(mover2.id, { siret: mover1.siret } as any)
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Mover with this SIRET already exists',
      });
    });

    it('should throw 409 if updating to duplicate email', async () => {
      const mover1 = await createTestMover();
      const mover2 = await createTestMover();

      await expect(
        moversService.updateMover(mover2.id, { email: mover1.email } as any)
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Mover with this email already exists',
      });
    });

    it('should allow updating own SIRET (no change)', async () => {
      const mover = await createTestMover();

      const updated = await moversService.updateMover(mover.id, {
        siret: mover.siret,
        city: 'Nice',
      } as any);

      expect(updated.city).toBe('Nice');
    });
  });

  describe('blacklistMover', () => {
    it('should blacklist mover with reason', async () => {
      const mover = await createTestMover({ status: 'ACTIVE' });

      const blacklisted = await moversService.blacklistMover({
        moverId: mover.id,
        blacklisted: true,
        blacklistReason: 'Multiple complaints',
      });

      expect(blacklisted.blacklisted).toBe(true);
      expect(blacklisted.blacklistReason).toBe('Multiple complaints');
      expect(blacklisted.status).toBe('SUSPENDED');
    });

    it('should unblacklist mover', async () => {
      const mover = await createTestMover({
        status: 'SUSPENDED',
        blacklisted: true,
        blacklistReason: 'Old issue',
      });

      const unblacklisted = await moversService.blacklistMover({
        moverId: mover.id,
        blacklisted: false,
      });

      expect(unblacklisted.blacklisted).toBe(false);
      expect(unblacklisted.blacklistReason).toBeNull();
      expect(unblacklisted.status).toBe('ACTIVE');
    });

    it('should throw 400 if blacklisting without reason', async () => {
      const mover = await createTestMover();

      await expect(
        moversService.blacklistMover({
          moverId: mover.id,
          blacklisted: true,
          // No blacklistReason
        } as any)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Blacklist reason is required when blacklisting a mover',
      });
    });

    it('should throw 404 if mover not found', async () => {
      await expect(
        moversService.blacklistMover({
          moverId: '00000000-0000-0000-0000-000000000000',
          blacklisted: true,
          blacklistReason: 'Test',
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('deleteMover', () => {
    it('should soft delete mover', async () => {
      const mover = await createTestMover();

      await moversService.deleteMover(mover.id);

      const deleted = await prisma.mover.findUnique({
        where: { id: mover.id },
      });
      expect(deleted?.deletedAt).toBeDefined();
    });

    it('should throw 404 if mover not found', async () => {
      await expect(
        moversService.deleteMover('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(ApiError);
    });

    it('should throw 400 if mover has active quotes', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      await createTestQuote(folder.id, mover.id, { status: 'VALIDATED' });

      await expect(
        moversService.deleteMover(mover.id)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('active quote'),
      });
    });

    it('should throw 400 if mover has active bookings', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      // Quote must NOT be active (REJECTED or EXPIRED) to pass the first check
      const quote = await createTestQuote(folder.id, mover.id, { status: 'REJECTED' });

      // Create active booking
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
        moversService.deleteMover(mover.id)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('active booking'),
      });
    });

    it('should allow deletion if quotes are expired', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      await createTestQuote(folder.id, mover.id, { status: 'EXPIRED' });

      await expect(moversService.deleteMover(mover.id)).resolves.not.toThrow();
    });
  });
});

