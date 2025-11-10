import { faker } from '@faker-js/faker';
import { prisma } from '../../src/db/client.js';

/**
 * Test data factories
 * Generate realistic test data for all models
 */

export const factories = {
  /**
   * Create a test client
   */
  async createClient(overrides: any = {}) {
    return prisma.client.create({
      data: {
        email: overrides.email || faker.internet.email(),
        phone: overrides.phone || '0612345678',
        firstName: overrides.firstName || faker.person.firstName(),
        lastName: overrides.lastName || faker.person.lastName(),
        ...overrides,
      },
    });
  },

  /**
   * Create a test mover
   */
  async createMover(overrides: any = {}) {
    return prisma.mover.create({
      data: {
        companyName: overrides.companyName || faker.company.name(),
        siret: overrides.siret || faker.string.numeric(14),
        email: overrides.email || faker.internet.email(),
        phone: overrides.phone || '0612345678',
        address: overrides.address || faker.location.streetAddress(),
        city: overrides.city || faker.location.city(),
        postalCode: overrides.postalCode || faker.location.zipCode('#####'),
        googlePlaceId: overrides.googlePlaceId || `ChIJ_${faker.string.alphanumeric(10)}`,
        googleRating: overrides.googleRating || '4.5',
        googleReviewsCount: overrides.googleReviewsCount || faker.number.int({ min: 10, max: 200 }),
        coverageZones: overrides.coverageZones || '["75", "92", "93"]',
        status: overrides.status || 'ACTIVE',
        ...overrides,
      },
    });
  },

  /**
   * Create a test lead
   */
  async createLead(overrides: any = {}) {
    return prisma.lead.create({
      data: {
        source: overrides.source || 'paris-demenageur.fr',
        email: overrides.email || faker.internet.email(),
        phone: overrides.phone || '0612345678',
        firstName: overrides.firstName || faker.person.firstName(),
        lastName: overrides.lastName || faker.person.lastName(),
        originAddress: overrides.originAddress || faker.location.streetAddress(),
        originCity: overrides.originCity || faker.location.city(),
        originPostalCode: overrides.originPostalCode || faker.location.zipCode('#####'),
        destAddress: overrides.destAddress || faker.location.streetAddress(),
        destCity: overrides.destCity || faker.location.city(),
        destPostalCode: overrides.destPostalCode || faker.location.zipCode('#####'),
        estimatedVolume: overrides.estimatedVolume || '20',
        movingDate: overrides.movingDate || faker.date.future(),
        status: overrides.status || 'NEW',
        ...overrides,
      },
    });
  },

  /**
   * Create a test folder
   */
  async createFolder(clientId: string, overrides: any = {}) {
    return prisma.folder.create({
      data: {
        clientId,
        originAddress: overrides.originAddress || faker.location.streetAddress(),
        originCity: overrides.originCity || faker.location.city(),
        originPostalCode: overrides.originPostalCode || faker.location.zipCode('#####'),
        destAddress: overrides.destAddress || faker.location.streetAddress(),
        destCity: overrides.destCity || faker.location.city(),
        destPostalCode: overrides.destPostalCode || faker.location.zipCode('#####'),
        volume: overrides.volume || '20',
        distance: overrides.distance || '50',
        movingDate: overrides.movingDate || faker.date.future(),
        status: overrides.status || 'CREATED',
        ...overrides,
      },
    });
  },

  /**
   * Create a test quote
   */
  async createQuote(folderId: string, moverId: string, overrides: any = {}) {
    return prisma.quote.create({
      data: {
        folderId,
        moverId,
        source: overrides.source || 'AUTO_GENERATED',
        totalPrice: overrides.totalPrice || '1500',
        currency: overrides.currency || 'EUR',
        validUntil: overrides.validUntil || faker.date.future(),
        status: overrides.status || 'REQUESTED',
        ...overrides,
      },
    });
  },

  /**
   * Create a test user (admin/operator)
   */
  async createUser(overrides: any = {}) {
    return prisma.user.create({
      data: {
        email: overrides.email || faker.internet.email(),
        firstName: overrides.firstName || faker.person.firstName(),
        lastName: overrides.lastName || faker.person.lastName(),
        role: overrides.role || 'ADMIN',
        active: overrides.active !== undefined ? overrides.active : true,
        ...overrides,
      },
    });
  },

  /**
   * Create a test booking
   */
  async createBooking(folderId: string, quoteId: string, overrides: any = {}) {
    const totalAmount = overrides.totalAmount || '1500';
    const depositAmount = overrides.depositAmount || '450'; // 30%
    const remainingAmount = (parseFloat(totalAmount) - parseFloat(depositAmount)).toString();

    return prisma.booking.create({
      data: {
        folderId,
        quoteId,
        totalAmount,
        depositAmount,
        remainingAmount,
        status: overrides.status || 'PENDING_PAYMENT',
        ...overrides,
      },
    });
  },
};

