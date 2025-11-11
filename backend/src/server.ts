import { createApp } from './app.js';
import { prisma } from './db/client.js';
import { initializeBigQueryService } from './services/bigquery/index.js';

const PORT = process.env.PORT || 4000;

// Initialize BigQuery service (skip if credentials not available)
try {
  if (process.env.GCP_PROJECT_ID && process.env.BQ_DATASET && process.env.GCP_SA_KEY_JSON) {
    initializeBigQueryService();
    console.log('✅ BigQuery service initialized');
  } else {
    console.log('⚠️  BigQuery service not initialized (missing env variables)');
  }
} catch (error) {
  console.error('❌ BigQuery initialization failed:', error);
  console.log('⚠️  Continuing without BigQuery service');
}

const app = createApp();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Moverz Back Office API                               ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(44 - (process.env.NODE_ENV || 'development').length)}║
║   Port:        ${PORT}${' '.repeat(44 - String(PORT).length)}║
║   Health:      http://localhost:${PORT}/health${' '.repeat(22 - String(PORT).length)}║
║   API:         http://localhost:${PORT}/api${' '.repeat(25 - String(PORT).length)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ HTTP server closed');
  });

  await prisma.$disconnect();
  console.log('✅ Database connection closed');
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, log and continue
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

