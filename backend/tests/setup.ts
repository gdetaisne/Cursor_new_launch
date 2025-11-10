/**
 * Test setup file
 * Runs before all tests
 */

import { prisma } from '../src/db/client.js';

// Clean up database before all tests
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  
  // Verify database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data if needed
  // Note: Using Neon.tech, we don't want to delete seed data
  // So we'll only clean up data created during tests
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
  console.log('👋 Test environment cleaned up');
});
