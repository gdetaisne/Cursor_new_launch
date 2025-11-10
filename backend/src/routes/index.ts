import { Router } from 'express';
import healthRoutes from './health.routes.js';
import foldersRoutes from './folders.routes.js';
// Import other routes here when created
// import quotesRoutes from './quotes.routes.js';
// import moversRoutes from './movers.routes.js';
// import clientsRoutes from './clients.routes.js';
// import leadsRoutes from './leads.routes.js';
// import bookingsRoutes from './bookings.routes.js';

const router = Router();

// Health check
router.use('/health', healthRoutes);

// API routes
router.use('/api/folders', foldersRoutes);
// router.use('/api/quotes', quotesRoutes);
// router.use('/api/movers', moversRoutes);
// router.use('/api/clients', clientsRoutes);
// router.use('/api/leads', leadsRoutes);
// router.use('/api/bookings', bookingsRoutes);

export default router;

