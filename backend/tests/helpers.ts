/**
 * Test helper functions
 */

import { faker } from '@faker-js/faker';
import { prisma } from '../src/db/client.js';

/**
 * Generate unique email for testing
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${faker.string.alphanumeric(6)}@test.local`;
}

/**
 * Generate unique SIRET for testing
 */
export function generateTestSiret(): string {
  return faker.string.numeric(14);
}

/**
 * Generate unique phone number
 */
export function generateTestPhone(): string {
  return `06${faker.string.numeric(8)}`;
}

/**
 * Create test client
 */
export async function createTestClient(overrides?: Partial<any>) {
  return prisma.client.create({
    data: {
      email: generateTestEmail(),
      phone: generateTestPhone(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      ...overrides,
    },
  });
}

/**
 * Create test mover
 */
export async function createTestMover(overrides?: Partial<any>) {
  return prisma.mover.create({
    data: {
      companyName: faker.company.name(),
      siret: generateTestSiret(),
      email: generateTestEmail(),
      phone: generateTestPhone(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      postalCode: faker.location.zipCode('#####'),
      coverageZones: JSON.stringify(['75', '77', '78']),
      status: 'ACTIVE',
      ...overrides,
    },
  });
}

/**
 * Create test lead
 */
export async function createTestLead(overrides?: Partial<any>) {
  return prisma.lead.create({
    data: {
      source: 'test-source.fr',
      email: generateTestEmail(),
      phone: generateTestPhone(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      originAddress: faker.location.streetAddress(),
      originCity: faker.location.city(),
      originPostalCode: faker.location.zipCode('#####'),
      destAddress: faker.location.streetAddress(),
      destCity: faker.location.city(),
      destPostalCode: faker.location.zipCode('#####'),
      estimatedVolume: faker.number.float({ min: 10, max: 50, fractionDigits: 1 }).toString(),
      status: 'NEW',
      ...overrides,
    },
  });
}

/**
 * Create test folder
 */
export async function createTestFolder(clientId: string, overrides?: Partial<any>) {
  return prisma.folder.create({
    data: {
      clientId,
      originAddress: faker.location.streetAddress(),
      originCity: faker.location.city(),
      originPostalCode: faker.location.zipCode('#####'),
      destAddress: faker.location.streetAddress(),
      destCity: faker.location.city(),
      destPostalCode: faker.location.zipCode('#####'),
      volume: faker.number.float({ min: 10, max: 50, fractionDigits: 1 }).toString(),
      distance: faker.number.int({ min: 50, max: 500 }).toString(),
      movingDate: faker.date.future(),
      status: 'CREATED',
      ...overrides,
    },
  });
}

/**
 * Create test quote
 */
export async function createTestQuote(folderId: string, moverId: string, overrides?: Partial<any>) {
  return prisma.quote.create({
    data: {
      folderId,
      moverId,
      source: 'AUTO_GENERATED',
      totalPrice: faker.number.int({ min: 500, max: 2000 }).toString(),
      currency: 'EUR',
      validUntil: faker.date.future(),
      status: 'REQUESTED',
      ...overrides,
    },
  });
}

/**
 * Clean up test data (delete by email pattern)
 */
export async function cleanupTestData() {
  // Delete test clients (cascade will delete folders, etc.)
  await prisma.client.deleteMany({
    where: {
      email: {
        contains: '@test.local',
      },
    },
  });

  // Delete test movers
  await prisma.mover.deleteMany({
    where: {
      email: {
        contains: '@test.local',
      },
    },
  });

  // Delete test leads
  await prisma.lead.deleteMany({
    where: {
      email: {
        contains: '@test.local',
      },
    },
  });
}

