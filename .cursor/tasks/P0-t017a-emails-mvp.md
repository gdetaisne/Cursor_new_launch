# P0-t017a — Système d'Emails MVP (Gmail SMTP)

**Status** : 🔥 In Progress  
**Priorité** : P0  
**Temps estimé** : 2h  
**Dépendances** : P0-t016 (Frontend MVP) ✅

---

## 🎯 Objectif

Implémenter un **système d'emails MVP fonctionnel** via Gmail SMTP :
- ✅ Service envoi backend (Nodemailer + Gmail)
- ✅ EmailLog pour tracking envoyés
- ✅ Routes `/api/emails/*`
- ✅ Page `/admin/emails` (liste envoyés)
- ✅ Connecter AIMailComposer frontend
- ❌ Pas d'emails entrants (Phase P0-t017b)
- ❌ Pas de templates modifiables (Phase P0-t017b)

---

## 📋 Phases (Simplifiées)

### **Phase 1 : Backend - Service Gmail SMTP** (30min)

#### 1.1 Installation
```bash
cd backend
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

#### 1.2 Variables ENV
Ajouter à `.env` :
```env
# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contact@moverz.com
SMTP_PASSWORD=your_app_password  # Gmail App Password

# Email settings
EMAIL_FROM=contact@moverz.com
EMAIL_FROM_NAME=Moverz
```

#### 1.3 Service `email.service.ts`
```typescript
import nodemailer from 'nodemailer';
import { prisma } from '../db/client.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(data: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId: string;
  folderId?: string;
  type?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text || stripHtml(data.html),
    });

    // Log dans EmailLog
    const emailLog = await prisma.emailLog.create({
      data: {
        type: data.type || 'OTHER',
        sentById: data.userId,
        recipientEmail: data.to,
        subject: data.subject,
        bodyHtml: data.html,
        bodyText: data.text,
        status: 'SENT',
        sentAt: new Date(),
        folderId: data.folderId,
        // messageId, inReplyTo, references seront ajoutés en Phase 2
      },
    });

    return { success: true, emailLogId: emailLog.id, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Log échec
    await prisma.emailLog.create({
      data: {
        type: data.type || 'OTHER',
        sentById: data.userId,
        recipientEmail: data.to,
        subject: data.subject,
        bodyHtml: data.html,
        status: 'FAILED',
        folderId: data.folderId,
      },
    });

    throw error;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
```

#### 1.4 Schema Zod `email.schema.ts`
```typescript
import { z } from 'zod';

export const sendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  folderId: z.string().optional(),
  type: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
```

#### 1.5 Controller `emails.controller.ts`
```typescript
import { Request, Response } from 'express';
import { sendEmail } from '../services/email.service.js';
import { sendEmailSchema } from '../schemas/email.schema.js';

export async function sendEmailHandler(req: Request, res: Response) {
  const data = sendEmailSchema.parse(req.body);
  
  const result = await sendEmail({
    to: data.to,
    subject: data.subject,
    html: data.body,
    userId: req.userId!, // From auth middleware
    folderId: data.folderId,
    type: data.type,
  });

  res.status(201).json(result);
}

export async function listEmailsHandler(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;

  const where: any = { deletedAt: null };
  if (status) {
    where.status = status;
  }

  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      include: {
        sentBy: { select: { id: true, email: true, name: true } },
        folder: { select: { id: true, originCity: true, destCity: true } },
      },
      orderBy: { sentAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.emailLog.count({ where }),
  ]);

  res.json({
    data: logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
```

#### 1.6 Routes `emails.routes.ts`
```typescript
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { sendEmailHandler, listEmailsHandler } from '../controllers/emails.controller.js';

const router = Router();

router.use(authenticate);

router.post('/send', sendEmailHandler);
router.get('/', listEmailsHandler);

export default router;
```

#### 1.7 Enregistrer routes
Modifier `backend/src/routes/index.ts` :
```typescript
import emailsRoutes from './emails.routes.js';

router.use('/api/emails', emailsRoutes);
```

---

### **Phase 2 : Frontend - Page Emails** (45min)

#### 2.1 Service API `api.ts`
```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

export async function sendEmail(data: {
  to: string;
  subject: string;
  body: string;
  folderId?: string;
  type?: string;
}) {
  return axios.post(`${API_BASE}/api/emails/send`, data, {
    headers: { 'x-user-id': 'admin' }, // TODO: real auth
  });
}

export async function fetchEmailLogs(filters: {
  page: number;
  limit: number;
  status?: string;
}) {
  return axios.get(`${API_BASE}/api/emails`, {
    params: filters,
    headers: { 'x-user-id': 'admin' },
  });
}
```

#### 2.2 Page `EmailsPage.tsx`
```typescript
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Search, Mail, CheckCircle, XCircle } from 'lucide-react';
import { fetchEmailLogs } from '../services/api';

export function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      const response = await fetchEmailLogs({ page: 1, limit: 50 });
      setEmails(response.data.data);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: emails.length,
    sent: emails.filter((e: any) => e.status === 'SENT').length,
    failed: emails.filter((e: any) => e.status === 'FAILED').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Emails
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Historique des emails envoyés
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Envoyés</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.sent}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Échoués</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {stats.failed}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Liste */}
      <Card variant="glass-strong" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Destinataire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Objet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Dossier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {emails.map((email: any) => (
                <tr key={email.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {email.recipientEmail}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {email.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {email.folder ? (
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {email.folder.originCity} → {email.folder.destCity}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(email.sentAt || email.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={email.status === 'SENT' ? 'success' : 'danger'}>
                      {email.status === 'SENT' ? 'Envoyé' : 'Échoué'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        )}

        {!loading && emails.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucun email envoyé</p>
          </div>
        )}
      </Card>
    </div>
  );
}
```

#### 2.3 Ajouter route
Modifier `frontend/src/routes/AppRouter.tsx` :
```typescript
import { EmailsPage } from '../pages/EmailsPage';

// Dans les routes /admin
<Route path="emails" element={<EmailsPage />} />
```

---

### **Phase 3 : Connecter AIMailComposer** (15min)

Modifier `frontend/src/components/ui/AIMailComposer.tsx` :
```typescript
import { sendEmail } from '../../services/api';

const handleSend = async () => {
  try {
    await sendEmail({
      to: context?.clientEmail || 'client@example.com',
      subject,
      body,
      folderId: context?.folderId,
      type: 'CLIENT_REMINDER',
    });
    
    alert('Email envoyé !'); // TODO: Toast notification
    onSend?.({ subject, body });
    onClose();
  } catch (error) {
    console.error('Erreur envoi email:', error);
    alert('Erreur lors de l\'envoi');
  }
};
```

---

### **Phase 4 : Tests** (30min)

#### 4.1 Setup Gmail App Password
1. Aller sur https://myaccount.google.com/security
2. Activer "2-Step Verification"
3. Créer "App Password"
4. Copier le mot de passe dans `.env`

#### 4.2 Test Backend
```bash
curl -X POST http://localhost:3001/api/emails/send \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email Moverz",
    "body": "<p>Bonjour,</p><p>Ceci est un test.</p>"
  }'
```

Vérifier :
- ✅ Email reçu dans inbox
- ✅ EmailLog créé en DB
- ✅ Status = SENT

#### 4.3 Test Frontend
1. Ouvrir `/admin/emails`
2. Vérifier liste des emails
3. Ouvrir un dossier
4. Ouvrir AIMailComposer
5. Générer un email
6. Envoyer
7. Vérifier email reçu
8. Recharger `/admin/emails` → nouvel email visible

---

## ✅ Critères de Succès

- [ ] Service email fonctionne (Nodemailer + Gmail)
- [ ] EmailLog écrit en DB
- [ ] Route POST `/api/emails/send` OK
- [ ] Route GET `/api/emails` OK
- [ ] Page `/admin/emails` affiche historique
- [ ] AIMailComposer connecté
- [ ] Email réel reçu en test
- [ ] Build prod OK

---

## 🚀 Commandes Rapides

```bash
# Backend
cd backend
pnpm add nodemailer @types/nodemailer

# Créer fichiers
touch src/services/email.service.ts
touch src/schemas/email.schema.ts
touch src/controllers/emails.controller.ts
touch src/routes/emails.routes.ts

# Frontend
cd ../frontend
mkdir -p src/services
touch src/services/api.ts
touch src/pages/EmailsPage.tsx

# Tester
cd ../backend
pnpm dev

# Autre terminal
curl -X POST http://localhost:3001/api/emails/send \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{"to":"test@example.com","subject":"Test","body":"<p>Hello</p>"}'
```

---

## ⏱️ Temps Estimé

| Phase | Temps |
|-------|-------|
| 1. Backend Service | 30min |
| 2. Frontend Page | 45min |
| 3. Connecter AIMailComposer | 15min |
| 4. Tests | 30min |
| **TOTAL** | **2h** |

---

## 📝 Notes

### Limites MVP
- ❌ Pas d'emails entrants (voir P0-t017b)
- ❌ Templates pas modifiables (fichiers statiques)
- ❌ Pas de relances auto
- ⚠️ Limite 500 emails/jour (Gmail)

### Next Steps (P0-t017b)
- Migration Resend
- Webhooks inbound
- Templates DB modifiables
- Relances automatiques BullMQ

---

**Créé le** : 2025-11-10  
**Status** : 🔥 Ready to implement

