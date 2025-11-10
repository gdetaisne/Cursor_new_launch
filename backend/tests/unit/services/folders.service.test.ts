import * as foldersService from '../../../src/services/folders.service.js';
import { prisma } from '../../../src/db/client.js';
import { ApiError } from '../../../src/utils/ApiError.js';
import {
  createTestClient,
  createTestLead,
  createTestFolder,
  createTestQuote,
  createTestMover,
  cleanupTestData,
} from '../../helpers.js';

describe('Folders Service', () => {
  // Clean up after each test
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('listFolders', () => {
    it('should list folders with pagination', async () => {
      const client = await createTestClient();
      await createTestFolder(client.id);
      await createTestFolder(client.id);

      const result = await foldersService.listFolders({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBeGreaterThanOrEqual(2);
    });

    it('should filter folders by status', async () => {
      const client = await createTestClient();
      await createTestFolder(client.id, { status: 'CREATED' });
      await createTestFolder(client.id, { status: 'TOP3_READY' });

      const result = await foldersService.listFolders({
        page: 1,
        limit: 10,
        status: 'CREATED',
      });

      expect(result.data.every((f: any) => f.status === 'CREATED')).toBe(true);
    });

    it('should filter folders by clientId', async () => {
      const client1 = await createTestClient();
      const client2 = await createTestClient();
      await createTestFolder(client1.id);
      await createTestFolder(client2.id);

      const result = await foldersService.listFolders({
        page: 1,
        limit: 10,
        clientId: client1.id,
      });

      expect(result.data.every((f: any) => f.client.id === client1.id)).toBe(true);
    });

    it('should not return soft deleted folders', async () => {
      const client = await createTestClient();
      const folder = await createTestFolder(client.id);
      
      await prisma.folder.update({
        where: { id: folder.id },
        data: { deletedAt: new Date() },
      });

      const result = await foldersService.listFolders({
        page: 1,
        limit: 10,
      });

      expect(result.data.find((f: any) => f.id === folder.id)).toBeUndefined();
    });
  });

  describe('getFolderById', () => {
    it('should return folder with full details', async () => {
      const client = await createTestClient();
      const folder = await createTestFolder(client.id);

      const result = await foldersService.getFolderById(folder.id);

      expect(result.id).toBe(folder.id);
      expect(result.client).toBeDefined();
      expect(result.client.id).toBe(client.id);
    });

    it('should throw 404 if folder not found', async () => {
      await expect(
        foldersService.getFolderById('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(ApiError);
      
      await expect(
        foldersService.getFolderById('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Folder not found',
      });
    });

    it('should throw 404 if folder is soft deleted', async () => {
      const client = await createTestClient();
      const folder = await createTestFolder(client.id);
      
      await prisma.folder.update({
        where: { id: folder.id },
        data: { deletedAt: new Date() },
      });

      await expect(
        foldersService.getFolderById(folder.id)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('createFolder', () => {
    it('should create folder successfully', async () => {
      const client = await createTestClient();
      
      const data = {
        clientId: client.id,
        originAddress: '123 Test St',
        originCity: 'Paris',
        originPostalCode: '75001',
        originElevator: false,
        destAddress: '456 Test Ave',
        destCity: 'Lyon',
        destPostalCode: '69001',
        destElevator: true,
        volume: 25,
        distance: 450,
        movingDate: new Date('2026-01-15'),
        flexibleDate: false,
        needPacking: true,
        needStorage: false,
        needInsurance: false,
      };

      const folder = await foldersService.createFolder(data as any);

      expect(folder.id).toBeDefined();
      expect(folder.clientId).toBe(client.id);
      expect(folder.status).toBe('CREATED');
      expect(folder.originCity).toBe('Paris');
    });

    it('should throw 404 if client not found', async () => {
      const data = {
        clientId: '00000000-0000-0000-0000-000000000000',
        originAddress: '123 Test St',
        originCity: 'Paris',
        originPostalCode: '75001',
        originElevator: false,
        destAddress: '456 Test Ave',
        destCity: 'Lyon',
        destPostalCode: '69001',
        destElevator: false,
        volume: 25,
        distance: 450,
        movingDate: new Date('2026-01-15'),
      } as any;

      await expect(foldersService.createFolder(data)).rejects.toThrow(ApiError);
    });

    it('should convert lead when leadId provided', async () => {
      const client = await createTestClient();
      const lead = await createTestLead({ email: client.email });

      const data = {
        clientId: client.id,
        leadId: lead.id,
        originAddress: lead.originAddress,
        originCity: lead.originCity,
        originPostalCode: lead.originPostalCode,
        originElevator: false,
        destAddress: lead.destAddress,
        destCity: lead.destCity,
        destPostalCode: lead.destPostalCode,
        destElevator: false,
        volume: lead.estimatedVolume ? parseFloat(lead.estimatedVolume.toString()) : 20,
        distance: 100,
        movingDate: lead.movingDate || new Date(),
      } as any;

      await foldersService.createFolder(data);

      // Check lead was updated
      const updatedLead = await prisma.lead.findUnique({ where: { id: lead.id } });
      expect(updatedLead?.status).toBe('CONVERTED');
      expect(updatedLead?.convertedAt).toBeDefined();
    });

    it('should throw 409 if lead already converted', async () => {
      const client = await createTestClient();
      const lead = await createTestLead({ email: client.email });
      
      // First conversion
      await foldersService.createFolder({
        clientId: client.id,
        leadId: lead.id,
        originAddress: lead.originAddress,
        originCity: lead.originCity,
        originPostalCode: lead.originPostalCode,
        originElevator: false,
        destAddress: lead.destAddress,
        destCity: lead.destCity,
        destPostalCode: lead.destPostalCode,
        destElevator: false,
        volume: 20,
        distance: 100,
        movingDate: new Date(),
      } as any);

      // Second conversion should fail
      await expect(
        foldersService.createFolder({
          clientId: client.id,
          leadId: lead.id,
          originAddress: lead.originAddress,
          originCity: lead.originCity,
          originPostalCode: lead.originPostalCode,
          originElevator: false,
          destAddress: lead.destAddress,
          destCity: lead.destCity,
          destPostalCode: lead.destPostalCode,
          destElevator: false,
          volume: 20,
          distance: 100,
          movingDate: new Date(),
        } as any)
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Lead already converted to folder',
      });
    });
  });

  describe('updateFolder', () => {
    it('should update folder successfully', async () => {
      const client = await createTestClient();
      const folder = await createTestFolder(client.id);

      const updated = await foldersService.updateFolder(folder.id, {
        volume: 30,
        needPacking: true,
      } as any);

      expect(updated.id).toBe(folder.id);
      expect(parseFloat(updated.volume.toString())).toBe(30);
      expect(updated.needPacking).toBe(true);
    });

    it('should throw 404 if folder not found', async () => {
      await expect(
        foldersService.updateFolder('00000000-0000-0000-0000-000000000000', {})
      ).rejects.toThrow(ApiError);
    });
  });

  describe('selectQuote', () => {
    it('should select validated quote for folder', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, {
        status: 'VALIDATED',
      });

      const updated = await foldersService.selectQuote(folder.id, quote.id);

      expect(updated.selectedQuoteId).toBe(quote.id);
      expect(updated.status).toBe('AWAITING_PAYMENT');
    });

    it('should throw 404 if folder not found', async () => {
      await expect(
        foldersService.selectQuote('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(ApiError);
    });

    it('should throw 404 if quote not validated', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, {
        status: 'REQUESTED', // Not validated
      });

      await expect(
        foldersService.selectQuote(folder.id, quote.id)
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Quote not found or not validated',
      });
    });
  });

  describe('deleteFolder', () => {
    it('should soft delete folder', async () => {
      const client = await createTestClient();
      const folder = await createTestFolder(client.id);

      await foldersService.deleteFolder(folder.id);

      const deleted = await prisma.folder.findUnique({
        where: { id: folder.id },
      });
      expect(deleted?.deletedAt).toBeDefined();
    });

    it('should throw 404 if folder not found', async () => {
      await expect(
        foldersService.deleteFolder('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(ApiError);
    });

    it('should throw 400 if folder has active booking', async () => {
      const client = await createTestClient();
      const mover = await createTestMover();
      const folder = await createTestFolder(client.id);
      const quote = await createTestQuote(folder.id, mover.id, { status: 'VALIDATED' });
      
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
        foldersService.deleteFolder(folder.id)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Cannot delete folder with active booking',
      });
    });
  });
});

