# P0-t014 — API Routes Backend (REST)

**Priorité : P0** — L'API backend est le cœur de communication entre le front et la base de données.

## Contexte

La base de données Moverz est opérationnelle (P0-t013 ✅) avec :
- Schema Prisma complet (12 tables)
- Données test cohérentes
- Validation Zod prête

**Objectif** : Créer l'API REST backend avec Express pour exposer les opérations CRUD sur les entités principales.

## Objectifs

### A. Setup Express & Architecture

- [ ] Installer Express + middlewares (cors, helmet, rate-limit)
- [ ] Structure modulaire (`src/routes/`, `src/controllers/`, `src/services/`)
- [ ] Configuration environnement (dotenv déjà OK)
- [ ] Error handler global
- [ ] Request logging (morgan ou pino)
- [ ] Health check endpoint (`GET /health`)

### B. Routes Folders (Dossiers)

- [ ] `POST /api/folders` : Créer dossier
  - Body validé par Zod (createFolderSchema)
  - Retour 201 + dossier créé
  
- [ ] `GET /api/folders` : Lister dossiers
  - Query params : `?clientId=uuid&status=CREATED&page=1&limit=10`
  - Pagination
  - Filtres (status, clientId, movingDate range)
  - Retour 200 + array

- [ ] `GET /api/folders/:id` : Détail dossier
  - Include : client, lead, quotes, booking
  - Retour 200 + dossier complet

- [ ] `PATCH /api/folders/:id` : Modifier dossier
  - Body validé par Zod (updateFolderSchema)
  - Retour 200 + dossier mis à jour

- [ ] `POST /api/folders/:id/select-quote` : Sélectionner quote
  - Body : `{ quoteId: uuid }`
  - Update `selectedQuoteId`
  - Retour 200

- [ ] `DELETE /api/folders/:id` : Soft delete
  - Set `deletedAt`
  - Retour 204

### C. Routes Quotes (Devis)

- [ ] `POST /api/quotes` : Créer quote
  - Body validé par Zod (createQuoteSchema)
  - Retour 201

- [ ] `GET /api/quotes` : Lister quotes
  - Filtres : `?folderId=uuid&status=VALIDATED&moverId=uuid`
  - Retour 200

- [ ] `GET /api/folders/:folderId/quotes` : Quotes d'un folder
  - Include mover data
  - Tri par scoreTotal DESC
  - Retour 200

- [ ] `PATCH /api/quotes/:id` : Modifier quote
  - Body validé par Zod (updateQuoteSchema)
  - Retour 200

- [ ] `POST /api/quotes/:id/validate` : Valider quote (admin)
  - Body : `{ validatedByUserId, approved, rejectionReason? }`
  - Update status → VALIDATED ou REJECTED
  - Retour 200

- [ ] `POST /api/quotes/:id/score` : Scorer quote (admin)
  - Body : `{ scorePrice, scoreGoogle, scoreFinancial, scoreLitigations? }`
  - Calcul scoreTotal (moyenne pondérée)
  - Retour 200

- [ ] `DELETE /api/quotes/:id` : Soft delete
  - Retour 204

### D. Routes Movers (Déménageurs)

- [ ] `POST /api/movers` : Créer mover
  - Body validé par Zod (createMoverSchema)
  - SIRET unique check
  - Retour 201

- [ ] `GET /api/movers` : Lister movers
  - Filtres : `?status=ACTIVE&city=Paris&postalCode=75`
  - Include : pricingGrids count, quotes count
  - Retour 200

- [ ] `GET /api/movers/:id` : Détail mover
  - Include : pricingGrids, users, stats (quotes count, bookings count)
  - Retour 200

- [ ] `PATCH /api/movers/:id` : Modifier mover
  - Body validé par Zod (updateMoverSchema)
  - Retour 200

- [ ] `POST /api/movers/:id/blacklist` : Blacklister mover (admin)
  - Body : `{ blacklisted: true/false, blacklistReason? }`
  - Retour 200

- [ ] `DELETE /api/movers/:id` : Soft delete
  - Retour 204

### E. Routes Clients

- [ ] `POST /api/clients` : Créer client
  - Body validé par Zod (createClientSchema)
  - Email unique check
  - Retour 201

- [ ] `GET /api/clients` : Lister clients
  - Filtres : `?email=...&phone=...`
  - Include : folders count
  - Retour 200

- [ ] `GET /api/clients/:id` : Détail client
  - Include : folders (avec status), bookings
  - Retour 200

- [ ] `PATCH /api/clients/:id` : Modifier client
  - Body validé par Zod (updateClientSchema)
  - Retour 200

- [ ] `POST /api/clients/:id/anonymize` : Anonymiser (RGPD)
  - Body : `{ reason }`
  - Set email → "deleted-{uuid}@anonymized.local"
  - Set phone → null, soft delete
  - Retour 200

### F. Routes Leads

- [ ] `POST /api/leads` : Créer lead
  - Body validé par Zod (createLeadSchema)
  - Retour 201

- [ ] `GET /api/leads` : Lister leads
  - Filtres : `?status=NEW&source=bordeaux-demenageur.fr`
  - Retour 200

- [ ] `POST /api/leads/:id/convert` : Convertir lead → folder
  - Créer Client si nécessaire (email unique)
  - Créer Folder
  - Update lead.status → CONVERTED
  - Retour 201 + folder créé

### G. Routes Bookings & Payments

- [ ] `POST /api/bookings` : Créer booking
  - Body : `{ folderId, quoteId, totalAmount, depositAmount }`
  - Validation : depositAmount = 30% totalAmount (Zod)
  - Retour 201

- [ ] `GET /api/bookings` : Lister bookings
  - Filtres : `?status=CONFIRMED&confirmedAt[gte]=2025-01-01`
  - Include : folder, quote, mover, payments
  - Retour 200

- [ ] `POST /api/payments` : Créer payment
  - Body validé par Zod (createPaymentSchema)
  - Calcul commissionAmount et moverAmount
  - Retour 201

- [ ] `GET /api/payments` : Lister payments (admin)
  - Filtres : `?status=SUCCEEDED&paidAt[gte]=2025-01-01`
  - Retour 200

### H. Middlewares & Utils

- [ ] Middleware `validateRequest(schema)` : Validation Zod automatique
- [ ] Middleware `authenticate` : JWT validation (si auth activé)
- [ ] Middleware `authorize(roles)` : Role-based access (ADMIN, OPERATOR, etc.)
- [ ] Error handler global : Format JSON uniforme `{ error, message, stack? }`
- [ ] Logger : Requêtes HTTP (IP, method, path, status, duration)
- [ ] Rate limiting : Max 100 req/min par IP

### I. Tests API (optionnel pour MVP)

- [ ] Setup Jest + Supertest
- [ ] Tests unitaires controllers
- [ ] Tests intégration routes (E2E)
- [ ] Coverage > 80%

## Périmètre

**IN scope** :
- Routes CRUD pour entités principales
- Validation Zod complète
- Error handling uniforme
- Pagination & filtres
- Soft delete

**OUT scope** :
- Authentification JWT complète (P0-t016 si besoin)
- Webhooks Stripe (P0-t015)
- Workers automatisations (P0-t015)
- Interface admin (P0-t006)
- Tests exhaustifs (nice-to-have, pas bloquant MVP)

## Implémentation

### Structure fichiers attendue

```
backend/
├── src/
│   ├── server.ts                 # Point d'entrée Express
│   ├── app.ts                    # Configuration Express app
│   │
│   ├── routes/
│   │   ├── index.ts              # Router principal
│   │   ├── folders.routes.ts
│   │   ├── quotes.routes.ts
│   │   ├── movers.routes.ts
│   │   ├── clients.routes.ts
│   │   ├── leads.routes.ts
│   │   ├── bookings.routes.ts
│   │   └── health.routes.ts
│   │
│   ├── controllers/
│   │   ├── folders.controller.ts
│   │   ├── quotes.controller.ts
│   │   ├── movers.controller.ts
│   │   ├── clients.controller.ts
│   │   ├── leads.controller.ts
│   │   └── bookings.controller.ts
│   │
│   ├── services/
│   │   ├── folders.service.ts    # Business logic
│   │   ├── quotes.service.ts
│   │   ├── movers.service.ts
│   │   ├── clients.service.ts
│   │   ├── leads.service.ts
│   │   └── bookings.service.ts
│   │
│   ├── middlewares/
│   │   ├── validateRequest.ts    # Zod validation
│   │   ├── errorHandler.ts       # Global error handler
│   │   ├── authenticate.ts       # JWT (future)
│   │   └── logger.ts             # Request logging
│   │
│   ├── utils/
│   │   ├── ApiError.ts           # Custom error class
│   │   ├── asyncHandler.ts       # Wrap async routes
│   │   └── pagination.ts         # Helpers pagination
│   │
│   └── types/
│       └── express.d.ts          # Extend Express types
│
└── package.json                  # Add Express deps
```

### Dependencies à ajouter

```bash
pnpm add express cors helmet morgan express-rate-limit
pnpm add -D @types/express @types/cors @types/morgan nodemon
```

### Example route structure

```typescript
// src/routes/folders.routes.ts
import { Router } from 'express';
import * as foldersController from '../controllers/folders.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createFolderSchema, updateFolderSchema } from '../schemas/index.js';

const router = Router();

router.post('/', validateRequest(createFolderSchema), foldersController.createFolder);
router.get('/', foldersController.listFolders);
router.get('/:id', foldersController.getFolder);
router.patch('/:id', validateRequest(updateFolderSchema), foldersController.updateFolder);
router.post('/:id/select-quote', foldersController.selectQuote);
router.delete('/:id', foldersController.deleteFolder);

export default router;
```

### Example controller

```typescript
// src/controllers/folders.controller.ts
import { Request, Response } from 'express';
import * as foldersService from '../services/folders.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createFolder = asyncHandler(async (req: Request, res: Response) => {
  const folder = await foldersService.createFolder(req.body);
  res.status(201).json(folder);
});

export const listFolders = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, clientId } = req.query;
  
  const result = await foldersService.listFolders({
    page: Number(page),
    limit: Number(limit),
    status: status as string,
    clientId: clientId as string,
  });
  
  res.json(result);
});

export const getFolder = asyncHandler(async (req: Request, res: Response) => {
  const folder = await foldersService.getFolderById(req.params.id);
  res.json(folder);
});
```

### Example service

```typescript
// src/services/folders.service.ts
import { prisma } from '../db/client.js';
import { CreateFolderInput } from '../schemas/index.js';
import { ApiError } from '../utils/ApiError.js';

export async function createFolder(data: CreateFolderInput) {
  // Check client exists
  const client = await prisma.client.findUnique({
    where: { id: data.clientId },
  });
  
  if (!client) {
    throw new ApiError(404, 'Client not found');
  }
  
  // Create folder
  return prisma.folder.create({
    data,
    include: {
      client: true,
      lead: true,
    },
  });
}

export async function listFolders(filters: {
  page: number;
  limit: number;
  status?: string;
  clientId?: string;
}) {
  const { page, limit, status, clientId } = filters;
  const skip = (page - 1) * limit;
  
  const where = {
    deletedAt: null,
    ...(status && { status }),
    ...(clientId && { clientId }),
  };
  
  const [folders, total] = await Promise.all([
    prisma.folder.findMany({
      where,
      skip,
      take: limit,
      include: {
        client: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { quotes: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.folder.count({ where }),
  ]);
  
  return {
    data: folders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### Error handler

```typescript
// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);
  
  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Resource already exists',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Resource not found',
      });
    }
  }
  
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors,
    });
  }
  
  // Custom ApiError
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }
  
  // Default
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
}
```

## État d'avancement

- [x] Setup Express & architecture
- [x] Routes Folders (6 endpoints)
- [x] Routes Quotes (8 endpoints — added /remind)
- [x] Routes Movers (6 endpoints)
- [x] Routes Clients (5 endpoints)
- [x] Routes Leads (4 endpoints — added GET /:id)
- [x] Routes Bookings & Payments (5 endpoints)
- [x] Middlewares (validation, error, logger, rate-limit)
- [x] Tests manuels réussis
- [ ] Documentation API (Swagger optionnel — hors scope P0)

**Statut : ✅ COMPLÉTÉ — 34 endpoints opérationnels**

### Résumé final

**Total : 34 endpoints implémentés**

- Express 5.1.0 + middlewares (cors, helmet, morgan, rate-limit)
- Architecture modulaire (routes/controllers/services)
- Validation Zod complète sur tous les endpoints
- Error handling uniforme (Prisma + Zod + custom errors)
- Pagination sur toutes les listes
- Soft delete partout
- Calculs financiers avec Decimal pour la précision

**Tests validés** :
- Health check : ✅ Database connected
- GET /api/movers : ✅ 5 movers avec pagination
- GET /api/folders : ✅ 3 folders
- GET /api/quotes : ✅ 10 quotes
- GET /api/bookings : ✅ 1 booking
- GET /api/leads : ✅ 3 leads
- GET /api/clients : ✅ 3 clients

**Commits** : 8 commits (setup + 6 modules + fix)

## Commits liés

*(à renseigner au fur et à mesure : date — sha — message)*

## Notes futures

### Prochaines tasks

- **P0-t015** : Workers automatisations (relances, scoring)
- **P0-t016** : Authentification JWT complète
- **P0-t006** : Interface admin (consomme cette API)

### Optimisations futures (hors P0)

- API versioning (`/api/v1/...`)
- GraphQL endpoint (alternative REST)
- Swagger/OpenAPI documentation auto-générée
- WebSockets pour notifications temps réel
- Caching Redis (queries fréquentes)
- Rate limiting par utilisateur (pas seulement par IP)
- API Gateway (si microservices)

### Points de vigilance

1. **Validation systématique** : Tous les body/query passent par Zod
2. **Soft delete partout** : Jamais de `prisma.delete()`, toujours `update({ deletedAt })`
3. **Include minimal** : Ne pas fetcher trop de relations (performances)
4. **Pagination obligatoire** : Toutes les listes avec page/limit
5. **Erreurs explicites** : Messages clairs pour le frontend

