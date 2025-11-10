import * as clientsService from '../../../src/services/clients.service.js';
import { prisma } from '../../../src/db/client.js';
import { ApiError } from '../../../src/utils/ApiError.js';
import {
  createTestClient,
  createTestFolder,
  generateTestEmail,
  generateTestPhone,
  cleanupTestData,
} from '../../helpers.js';

describe('Clients Service', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('listClients', () => {
    it('should list clients with pagination', async () => {
      await createTestClient();
      await createTestClient();

      const result = await clientsService.listClients({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter clients by email (case-insensitive)', async () => {
      const client = await createTestClient({ email: 'john@test.local' });

      const result = await clientsService.listClients({
        page: 1,
        limit: 10,
        email: 'JOHN', // Uppercase
      });

      expect(result.data.some((c: any) => c.id === client.id)).toBe(true);
    });

    it('should filter clients by phone', async () => {
      const phone = generateTestPhone();
      const client = await createTestClient({ phone });

      const result = await clientsService.listClients({
        page: 1,
        limit: 10,
        phone,
      });

      expect(result.data.some((c: any) => c.id === client.id)).toBe(true);
    });

    it('should include folder counts', async () => {
      const client = await createTestClient();
      await createTestFolder(client.id);
      await createTestFolder(client.id);

      const result = await clientsService.listClients({
        page: 1,
        limit: 10,
      });

      const testClient = result.data.find((c: any) => c.id === client.id);
      expect(testClient).toBeDefined();
      expect(testClient!._count).toBeDefined();
      expect(testClient!._count.folders).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getClientById', () => {
    it('should return client with full details and folders', async () => {
      const client = await createTestClient();
      await createTestFolder(client.id);

      const result = await clientsService.getClientById(client.id);

      expect(result.id).toBe(client.id);
      expect(result.folders).toBeDefined();
      expect(Array.isArray(result.folders)).toBe(true);
      expect(result.folders.length).toBeGreaterThanOrEqual(1);
    });

    it('should throw 404 if client not found', async () => {
      await expect(
        clientsService.getClientById('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Client not found',
      });
    });

    it('should throw 404 if client is soft deleted', async () => {
      const client = await createTestClient();
      
      await prisma.client.update({
        where: { id: client.id },
        data: { deletedAt: new Date() },
      });

      await expect(
        clientsService.getClientById(client.id)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('createClient', () => {
    it('should create client successfully', async () => {
      const data = {
        email: generateTestEmail(),
        phone: generateTestPhone(),
        firstName: 'John',
        lastName: 'Doe',
      };

      const client = await clientsService.createClient(data as any);

      expect(client.id).toBeDefined();
      expect(client.email).toBe(data.email);
      expect(client.firstName).toBe('John');
      expect(client.lastName).toBe('Doe');
    });

    it('should create client with optional phone', async () => {
      const data = {
        email: generateTestEmail(),
        firstName: 'Jane',
        lastName: 'Smith',
        // No phone
      };

      const client = await clientsService.createClient(data as any);

      expect(client.id).toBeDefined();
      expect(client.phone).toBeNull();
    });

    it('should throw 409 if email already exists', async () => {
      const email = generateTestEmail();
      await createTestClient({ email });

      const data = {
        email, // Same email
        phone: generateTestPhone(),
        firstName: 'Another',
        lastName: 'Person',
      };

      await expect(clientsService.createClient(data as any)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Client with this email already exists',
      });
    });
  });

  describe('updateClient', () => {
    it('should update client successfully', async () => {
      const client = await createTestClient();

      const updated = await clientsService.updateClient(client.id, {
        firstName: 'UpdatedName',
        phone: '0699999999',
      } as any);

      expect(updated.id).toBe(client.id);
      expect(updated.firstName).toBe('UpdatedName');
      expect(updated.phone).toBe('0699999999');
    });

    it('should throw 404 if client not found', async () => {
      await expect(
        clientsService.updateClient('00000000-0000-0000-0000-000000000000', {} as any)
      ).rejects.toThrow(ApiError);
    });

    it('should throw 409 if updating to duplicate email', async () => {
      const client1 = await createTestClient();
      const client2 = await createTestClient();

      await expect(
        clientsService.updateClient(client2.id, { email: client1.email } as any)
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Client with this email already exists',
      });
    });

    it('should allow updating own email (no change)', async () => {
      const client = await createTestClient();

      const updated = await clientsService.updateClient(client.id, {
        email: client.email,
        firstName: 'NewName',
      } as any);

      expect(updated.firstName).toBe('NewName');
    });
  });

  describe('anonymizeClient', () => {
    it('should anonymize client (RGPD)', async () => {
      const client = await createTestClient({
        email: 'realuser@example.com',
        phone: '0612345678',
        firstName: 'John',
        lastName: 'Doe',
      });

      const anonymized = await clientsService.anonymizeClient(client.id, 'RGPD request');

      expect(anonymized.id).toBe(client.id);
      expect(anonymized.email).toMatch(/^deleted-[a-f0-9-]+@anonymized\.local$/);
      expect(anonymized.phone).toBeNull();
      expect(anonymized.firstName).toBe('Anonymized');
      expect(anonymized.lastName).toBe('User');
    });

    it('should throw 404 if client not found', async () => {
      await expect(
        clientsService.anonymizeClient('00000000-0000-0000-0000-000000000000', 'Test reason')
      ).rejects.toThrow(ApiError);
    });

    it('should throw 404 if client already anonymized', async () => {
      const client = await createTestClient();
      
      // Anonymize once
      await clientsService.anonymizeClient(client.id, 'First request');

      // Try again (should fail with 404 since anonymized clients are soft-deleted)
      await expect(
        clientsService.anonymizeClient(client.id, 'Second request')
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Client not found',
      });
    });

    it('should preserve folders after anonymization', async () => {
      const client = await createTestClient();
      const folder = await createTestFolder(client.id);

      await clientsService.anonymizeClient(client.id, 'RGPD compliance');

      // Folder should still exist
      const folderStillExists = await prisma.folder.findUnique({
        where: { id: folder.id },
      });
      expect(folderStillExists).toBeDefined();
      expect(folderStillExists!.clientId).toBe(client.id);
    });

    it('should prevent listing anonymized client in regular queries', async () => {
      const client = await createTestClient();
      await clientsService.anonymizeClient(client.id, 'User request');

      const result = await clientsService.listClients({
        page: 1,
        limit: 100,
      });

      // Client should not appear in list
      expect(result.data.find((c: any) => c.id === client.id)).toBeUndefined();
    });
  });
});

