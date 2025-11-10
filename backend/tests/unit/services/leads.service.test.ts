import * as leadsService from '../../../src/services/leads.service.js';
import { prisma } from '../../../src/db/client.js';
import { ApiError } from '../../../src/utils/ApiError.js';
import {
  createTestLead,
  createTestClient,
  generateTestEmail,
  generateTestPhone,
  cleanupTestData,
} from '../../helpers.js';

describe('Leads Service', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('listLeads', () => {
    it('should list leads with pagination', async () => {
      await createTestLead();
      await createTestLead();

      const result = await leadsService.listLeads({
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter leads by status', async () => {
      await createTestLead({ status: 'NEW' });
      await createTestLead({ status: 'CONVERTED' });

      const result = await leadsService.listLeads({
        page: 1,
        limit: 10,
        status: 'NEW',
      });

      expect(result.data.every((l: any) => l.status === 'NEW')).toBe(true);
    });

    it('should filter leads by source', async () => {
      await createTestLead({ source: 'paris-demenageur.fr' });
      await createTestLead({ source: 'lyon-demenageur.fr' });

      const result = await leadsService.listLeads({
        page: 1,
        limit: 10,
        source: 'paris-demenageur.fr',
      });

      expect(result.data.every((l: any) => l.source === 'paris-demenageur.fr')).toBe(true);
    });

    it('should not return soft deleted leads', async () => {
      const lead = await createTestLead();
      
      await prisma.lead.update({
        where: { id: lead.id },
        data: { deletedAt: new Date() },
      });

      const result = await leadsService.listLeads({
        page: 1,
        limit: 100,
      });

      expect(result.data.find((l: any) => l.id === lead.id)).toBeUndefined();
    });

    it('should order leads by createdAt DESC', async () => {
      await createTestLead();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await createTestLead();

      const result = await leadsService.listLeads({
        page: 1,
        limit: 10,
      });

      // Newest first
      expect(new Date(result.data[0].createdAt).getTime())
        .toBeGreaterThanOrEqual(new Date(result.data[1].createdAt).getTime());
    });
  });

  describe('getLeadById', () => {
    it('should return lead with full details', async () => {
      const lead = await createTestLead();

      const result = await leadsService.getLeadById(lead.id);

      expect(result.id).toBe(lead.id);
      expect(result.email).toBe(lead.email);
      expect(result.source).toBeDefined();
    });

    it('should throw 404 if lead not found', async () => {
      await expect(
        leadsService.getLeadById('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Lead not found',
      });
    });

    it('should throw 404 if lead is soft deleted', async () => {
      const lead = await createTestLead();
      
      await prisma.lead.update({
        where: { id: lead.id },
        data: { deletedAt: new Date() },
      });

      await expect(
        leadsService.getLeadById(lead.id)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('createLead', () => {
    it('should create lead successfully', async () => {
      const data = {
        source: 'test-source.fr',
        email: generateTestEmail(),
        phone: generateTestPhone(),
        firstName: 'Jean',
        lastName: 'Dupont',
        originAddress: '10 rue de Paris',
        originCity: 'Paris',
        originPostalCode: '75001',
        destAddress: '20 rue de Lyon',
        destCity: 'Lyon',
        destPostalCode: '69001',
        estimatedVolume: 25.5,
        movingDate: new Date('2026-03-15'),
      };

      const lead = await leadsService.createLead(data as any);

      expect(lead.id).toBeDefined();
      expect(lead.status).toBe('NEW');
      expect(lead.source).toBe('test-source.fr');
      expect(lead.email).toBe(data.email);
      expect(parseFloat(lead.estimatedVolume?.toString() || '0')).toBe(25.5);
    });

    it('should create lead with AI estimation method', async () => {
      const data = {
        source: 'test-source.fr',
        email: generateTestEmail(),
        firstName: 'Jean',
        lastName: 'Dupont',
        originAddress: '10 rue de Paris',
        originCity: 'Paris',
        originPostalCode: '75001',
        destAddress: '20 rue de Lyon',
        destCity: 'Lyon',
        destPostalCode: '69001',
        estimationMethod: 'AI_PHOTO' as const,
        photosUrls: JSON.stringify(['https://s3.amazonaws.com/photo1.jpg']),
        aiEstimationConfidence: 92.5,
        estimatedVolume: 30,
      };

      const lead = await leadsService.createLead(data as any);

      expect(lead.estimationMethod).toBe('AI_PHOTO');
      expect(lead.photosUrls).toBeDefined();
      expect(parseFloat(lead.aiEstimationConfidence?.toString() || '0')).toBe(92.5);
    });

    it('should create lead without optional fields', async () => {
      const data = {
        source: 'test-source.fr',
        email: generateTestEmail(),
        firstName: 'Jean',
        lastName: 'Dupont',
        originAddress: '10 rue de Paris',
        originCity: 'Paris',
        originPostalCode: '75001',
        destAddress: '20 rue de Lyon',
        destCity: 'Lyon',
        destPostalCode: '69001',
        // No phone, no estimatedVolume, no movingDate
      };

      const lead = await leadsService.createLead(data as any);

      expect(lead.id).toBeDefined();
      expect(lead.phone).toBeNull();
      expect(lead.estimatedVolume).toBeNull();
      expect(lead.movingDate).toBeNull();
    });
  });

  describe('convertLead', () => {
    it('should convert lead to folder successfully', async () => {
      const lead = await createTestLead({ status: 'NEW' });

      const result = await leadsService.convertLead(lead.id);

      expect(result.lead).toBeDefined();
      expect(result.lead!.id).toBe(lead.id);
      expect(result.lead!.status).toBe('CONVERTED');
      expect(result.lead!.convertedAt).toBeDefined();
      expect(result.client).toBeDefined();
      expect(result.client.email).toBe(lead.email);
    });

    it('should create new client if email does not exist', async () => {
      const lead = await createTestLead();

      const result = await leadsService.convertLead(lead.id);

      expect(result.client.email).toBe(lead.email);
      expect(result.client.firstName).toBe(lead.firstName);
      expect(result.client.lastName).toBe(lead.lastName);
    });

    it('should reuse existing client if email already exists', async () => {
      const existingClient = await createTestClient();
      const lead = await createTestLead({ email: existingClient.email });

      const result = await leadsService.convertLead(lead.id);

      expect(result.client.id).toBe(existingClient.id);
    });

    it('should throw 404 if lead not found', async () => {
      await expect(
        leadsService.convertLead('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Lead not found',
      });
    });

    it('should throw 400 if lead already converted', async () => {
      const lead = await createTestLead({ status: 'CONVERTED', convertedAt: new Date() });

      await expect(
        leadsService.convertLead(lead.id)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Lead already converted',
      });
    });
  });
});

