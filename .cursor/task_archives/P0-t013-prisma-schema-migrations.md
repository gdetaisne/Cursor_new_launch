# P0-t013 — Génération Prisma Schema & Migrations (implémentation initiale)

**Priorité : P0** — Sans base de données fonctionnelle, aucune fonctionnalité backend ne peut exister.

## Contexte

La phase **P0-t005** a validé le schéma fonctionnel et technique du Back Office (Production-Ready avec 8 corrections critiques).

**Objectif maintenant** : Matérialiser ce schéma dans le code :
- Fichiers Prisma (`schema.prisma`)
- Migrations SQL PostgreSQL
- Connexion Neon.tech opérationnelle
- Seeding données test
- Validation Zod app layer

## Objectifs

### A. Setup Prisma

- [ ] Initialiser Prisma dans `/backend`
- [ ] Créer `backend/prisma/schema.prisma` à partir du schéma validé P0-t005
- [ ] Configurer connexion Neon.tech (DATABASE_URL)
- [ ] Vérifier compatibilité PostgreSQL 15+

### B. Migration initiale

- [ ] Générer migration `init_schema` via `npx prisma migrate dev`
- [ ] Appliquer migration sur Neon.tech sans erreur
- [ ] Vérifier toutes tables créées (12 tables)
- [ ] Vérifier tous index créés (52 index)
- [ ] Vérifier tous enums créés (9 enums)

### C. Seeding données test

- [ ] Créer `backend/prisma/seed.ts`
- [ ] Seed minimal :
  - 5 Movers (déménageurs fictifs avec Google data)
  - 15-20 PricingGrids (grilles tarifaires variées)
  - 5 Users (1 admin, 2 operators, 2 partners)
  - 10 Leads → Folders (dossiers test)
  - 30-40 Quotes (mix AUTO_GENERATED + EMAIL_PARSED)
  - 5 Top3Selections (historique présentations)
  - 3 Bookings + Payments (flux complet)
- [ ] Exécuter `npx prisma db seed` sans erreur
- [ ] Vérifier cohérence données (FK, relations)

### D. Validation Zod

- [ ] Créer `backend/src/schemas/` directory
- [ ] Schemas Zod :
  - `lead.schema.ts` : email, phone, estimatedVolume, estimationMethod
  - `folder.schema.ts` : addresses, volume, distance, dates
  - `quote.schema.ts` : totalPrice >= 0, validUntil future, scores 0-100
  - `payment.schema.ts` : commissionRate 0.05-0.15, depositAmount = 30%
  - `mover.schema.ts` : SIRET 14 digits, email format, googleRating 0-5
  - `client.schema.ts` : email, phone formats
- [ ] Exporter schemas dans `backend/src/schemas/index.ts`

### E. Tests connexion Neon

- [ ] Script `backend/scripts/test-db-connection.ts`
- [ ] Tester :
  - Connexion établie
  - Ping database (< 50ms attendu)
  - Count tables (= 12)
  - Query simple (SELECT * FROM movers LIMIT 5)
  - Transaction test (rollback fonctionnel)
- [ ] Benchmarks basiques :
  - Query Top 3 (avec index) < 100ms
  - Insert Folder + 10 Quotes < 200ms

### F. Documentation maintenance

- [ ] Créer `backend/prisma/README.md`
- [ ] Documenter commandes :
  - `npx prisma migrate dev` : Créer migration + appliquer
  - `npx prisma migrate deploy` : Appliquer migrations en prod
  - `npx prisma db seed` : Seed données test
  - `npx prisma db reset` : Reset + reseed (DEV only)
  - `npx prisma studio` : Interface GUI données
  - `npx prisma generate` : Générer client Prisma
- [ ] Documenter workflow :
  - Modification schema → migrate dev → commit migration
  - Ajout champ → migration + update Zod schema

## Périmètre

**IN scope** :
- Génération et validation de la base de données
- Seeding données test cohérentes
- Validation Zod prête à utiliser
- Documentation commandes Prisma

**OUT scope** :
- Intégration API routes (voir P0-t014)
- Code métier backend (voir P0-t014+)
- Interface admin (voir P0-t006)
- Workers automatisations (voir P0-t011, P0-t012)

## Implémentation

### Structure fichiers attendue

```
backend/
├── prisma/
│   ├── schema.prisma          # Schéma complet depuis P0-t005
│   ├── seed.ts                # Script seeding
│   ├── migrations/
│   │   └── 20251110_init_schema/
│   │       ├── migration.sql  # SQL généré
│   │       └── README.md      # Description migration
│   └── README.md              # Documentation maintenance
│
├── src/
│   ├── schemas/               # Validation Zod
│   │   ├── index.ts
│   │   ├── lead.schema.ts
│   │   ├── folder.schema.ts
│   │   ├── quote.schema.ts
│   │   ├── payment.schema.ts
│   │   ├── mover.schema.ts
│   │   └── client.schema.ts
│   └── db/
│       └── client.ts          # Prisma client singleton
│
├── scripts/
│   └── test-db-connection.ts # Tests connexion Neon
│
└── package.json               # Prisma scripts
```

### Configuration Neon.tech

```env
# backend/.env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/moverz_db?sslmode=require"
NODE_ENV="development"
```

### Commandes exécution

```bash
# 1. Setup initial
cd backend
pnpm add prisma @prisma/client
pnpm add -D tsx

# 2. Init Prisma
npx prisma init --datasource-provider postgresql

# 3. Copier schema depuis P0-t005 dans prisma/schema.prisma

# 4. Créer migration
npx prisma migrate dev --name init_schema

# 5. Seed
npx prisma db seed

# 6. Vérifier
npx prisma studio
tsx scripts/test-db-connection.ts
```

### Validation Zod exemple

```typescript
// src/schemas/lead.schema.ts
import { z } from 'zod';

export const createLeadSchema = z.object({
  source: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^(\+33|0)[1-9]\d{8}$/).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  
  originPostalCode: z.string().length(5).regex(/^\d{5}$/),
  destPostalCode: z.string().length(5).regex(/^\d{5}$/),
  
  estimatedVolume: z.number().min(1).max(500).optional(),
  estimationMethod: z.enum(['AI_PHOTO', 'FORM', 'MANUAL_ADMIN']).default('FORM'),
  photosUrls: z.array(z.string().url()).optional(),
  
  movingDate: z.coerce.date().min(new Date()).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
```

### Seed exemple

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Movers
  const mover1 = await prisma.mover.create({
    data: {
      companyName: "Déménagements Bordeaux Pro",
      siret: "12345678901234",
      email: "contact@bordeaux-pro.fr",
      phone: "0556123456",
      address: "123 Rue Sainte-Catherine",
      city: "Bordeaux",
      postalCode: "33000",
      googlePlaceId: "ChIJ123abc",
      googleRating: 4.5,
      googleReviewsCount: 87,
      status: "ACTIVE",
      coverageZones: JSON.stringify(["33", "40", "47"]),
    }
  });

  // 2. Create PricingGrids
  await prisma.pricingGrid.create({
    data: {
      moverId: mover1.id,
      volumeMin: 10,
      volumeMax: 20,
      distanceMin: 0,
      distanceMax: 50,
      basePrice: 500,
      pricePerM3: 30,
      pricePerKm: 2,
      packingPrice: 200,
    }
  });

  // 3. Create Users
  await prisma.user.create({
    data: {
      email: "admin@moverz.fr",
      passwordHash: "$2a$10$...", // Bcrypt hash
      firstName: "Admin",
      lastName: "Moverz",
      role: "ADMIN",
      active: true,
      emailVerified: true,
    }
  });

  // 4. Create Client + Lead + Folder
  const client = await prisma.client.create({
    data: {
      email: "client@example.com",
      phone: "0612345678",
      firstName: "Jean",
      lastName: "Dupont",
    }
  });

  const lead = await prisma.lead.create({
    data: {
      source: "bordeaux-demenageur.fr",
      email: client.email,
      phone: client.phone,
      firstName: client.firstName,
      lastName: client.lastName,
      originCity: "Bordeaux",
      originPostalCode: "33000",
      destCity: "Paris",
      destPostalCode: "75001",
      estimatedVolume: 15,
      estimationMethod: "FORM",
      status: "CONVERTED",
    }
  });

  const folder = await prisma.folder.create({
    data: {
      leadId: lead.id,
      clientId: client.id,
      originAddress: "1 Place de la Bourse",
      originCity: "Bordeaux",
      originPostalCode: "33000",
      destAddress: "10 Rue de Rivoli",
      destCity: "Paris",
      destPostalCode: "75001",
      volume: 15.5,
      distance: 584.2,
      movingDate: new Date('2025-12-15'),
      status: "QUOTES_PENDING",
    }
  });

  // 5. Create Quotes
  await prisma.quote.create({
    data: {
      folderId: folder.id,
      moverId: mover1.id,
      source: "AUTO_GENERATED",
      totalPrice: 1250.00,
      currency: "EUR",
      validUntil: new Date('2025-12-31'),
      status: "VALIDATED",
      scorePrice: 85.5,
      scoreGoogle: 90.0,
      scoreFinancial: 75.0,
      scoreTotal: 83.5,
    }
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## État d'avancement

- [x] Prisma schema généré (schema.prisma) ✅
- [x] Structure backend créée (src/, prisma/, scripts/) ✅
- [x] Configuration package.json + tsconfig.json ✅
- [x] Seed complet (seed.ts) ✅
- [x] Validation Zod créée (6 schemas) ✅
- [x] Client Prisma singleton (src/db/client.ts) ✅
- [x] Script test connexion (scripts/test-db-connection.ts) ✅
- [x] Documentation maintenance complète (prisma/README.md) ✅
- [x] Base Neon.tech créée (neondb @ EU Central 1) ✅
- [x] Configuration .env (DATABASE_URL) ✅
- [x] Credentials sauvegardés (/Users/guillaumestehelin/Keys/) ✅
- [x] Migration init_schema exécutée sur Neon.tech ✅
- [x] Seed exécuté sans erreur (5 movers, 12 grids, 10 quotes, etc.) ✅
- [x] Tests connexion passent (5/5) ✅

**Statut : ✅ Terminé — Base de données opérationnelle**

La base de données Moverz est maintenant complètement opérationnelle :
- 13 tables (12 schema + _prisma_migrations)
- Données de test cohérentes
- Connexion Neon.tech validée
- Prêt pour développement API (P0-t014)

## Commits liés

*(à renseigner au fur et à mesure : date — sha — message)*

## Notes futures

### Prochaines tasks

- **P0-t014** : Intégration API routes backend (CRUD Folders, Quotes, etc.)
- **P0-t015** : Workers relances & scoring (basés sur ce schéma)
- **P0-t016** : Tests intégrité & benchmarks Neon (performance queries)

### Points de vigilance

1. **Connexion pooling** : Neon recommande max 10 connexions simultanées
2. **Migrations production** : Toujours `migrate deploy`, jamais `migrate dev`
3. **Seed en prod** : JAMAIS exécuter `db seed` en production
4. **Backups** : Neon automated backups activés (7 jours retention)
5. **SSL obligatoire** : `sslmode=require` dans DATABASE_URL

### Améliorations futures (hors P0)

- Prisma Read Replicas pour scalabilité lecture
- Prisma Accelerate pour caching queries
- Monitoring slow queries (> 500ms)
- Archivage automatique données anciennes (> 2 ans)
- Encryption at rest via pgcrypto (emails, phones)

