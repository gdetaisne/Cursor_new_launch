import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  sendEmailHandler,
  listEmailsHandler,
} from '../controllers/emails.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Send email
router.post('/send', sendEmailHandler);

// List emails
router.get('/', listEmailsHandler);

export default router;

