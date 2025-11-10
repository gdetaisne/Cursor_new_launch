# Moverz Back Office — Backend API

> **API REST TypeScript pour la gestion du Back Office Moverz**  
> Express.js + Prisma + PostgreSQL (Neon.tech) + Zod

[![Node](https://img.shields.io/badge/node-≥20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/prisma-5.22.0-2D3748.svg)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/tests-148%2F148-success.svg)](./tests/)

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Commandes](#-commandes)
- [API Routes](#-api-routes)
- [Tests](#-tests)
- [Sécurité](#-sécurité)
- [Base de données](#-base-de-données)
- [Développement](#-développement)
- [Production](#-production)

---

## 🎯 Vue d'ensemble

Le backend Moverz est une API REST qui gère l'intégralité du flux métier :

```
Lead → Dossier → Collecte Devis → Top 3 → Paiement → Mise en relation
```

### Fonctionnalités principales

✅ **Gestion des leads** : Capture et conversion en dossiers  
✅ **Gestion des dossiers** : Suivi du parcours client  
✅ **Collecte des devis** : Automatisation et scoring  
✅ **Gestion des déménageurs** : Référencement, notes, blacklist  
✅ **Paiement Stripe** : Gestion acomptes et reversements  
✅ **Validation Zod** : Typage fort et sécurité des données  
✅ **Tests unitaires** : 148 tests (90% coverage)  
✅ **Sécurité POC** : Helmet + Rate Limiting + Zod

---

## 🏗️ Architecture

```
backend/
├── src/
│   ├── app.ts                  # Configuration Express
│   ├── server.ts               # Bootstrap serveur
│   ├── controllers/            # Handlers HTTP
│   ├── services/               # Logique métier
│   ├── routes/                 # Routage API
│   ├── middlewares/            # Error handler, validation
│   ├── schemas/                # Validation Zod
│   ├── utils/                  # Helpers (ApiError, pagination)
│   └── db/                     # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # Modèle de données (12 models, 9 enums)
│   ├── seed.ts                 # Données de test
│   └── migrations/             # Historique SQL
├── tests/
│   ├── unit/                   # Tests services + utils
│   ├── integration/            # Tests E2E (TODO)
│   └── helpers.ts              # Factories & cleanup
└── scripts/
    └── test-db-connection.ts   # Test connexion Neon
```

### Stack technique

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Runtime** | Node.js 20+ | Environnement d'exécution |
| **Framework** | Express 5 | API REST |
| **ORM** | Prisma 5 | Accès base de données |
| **Database** | PostgreSQL (Neon.tech) | Base de données serverless |
| **Validation** | Zod 3 | Schémas de validation |
| **Testing** | Jest 30 + Supertest | Tests unitaires & E2E |
| **Security** | Helmet + Rate Limit | Headers HTTP + anti-bruteforce |
| **Types** | TypeScript 5 | Typage statique |

---

## 🚀 Installation

### Prérequis

- **Node.js** ≥ 20.0.0
- **pnpm** (ou npm/yarn)
- **PostgreSQL** (Neon.tech ou local)

### Étapes

```bash
# 1. Cloner le repo
cd backend/

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos credentials Neon.tech

# 4. Générer le client Prisma
pnpm db:generate

# 5. Exécuter les migrations
pnpm db:migrate

# 6. Seed la base de données
pnpm db:seed

# 7. Tester la connexion
pnpm db:test

# 8. Lancer le serveur
pnpm dev
```

Le serveur démarre sur **http://localhost:3001** 🚀

---

## ⚙️ Configuration

### Variables d'environnement (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT (TODO: à implémenter)
# JWT_SECRET=your-secret-key
# JWT_EXPIRES_IN=7d

# Stripe (TODO: à implémenter)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

### Configuration recommandée Neon.tech

```bash
DATABASE_URL="postgresql://neondb_owner:xxx@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

Voir [`ENV_SETUP.md`](./ENV_SETUP.md) pour les détails.

---

## 📦 Commandes

### Développement

```bash
pnpm dev              # Lance le serveur en mode watch (tsx)
pnpm build            # Compile TypeScript → dist/
pnpm start            # Lance le serveur compilé (prod)
pnpm type-check       # Vérifier les types sans compiler
```

### Base de données

```bash
pnpm db:migrate       # Créer une nouvelle migration (dev)
pnpm db:migrate:deploy # Appliquer les migrations (prod)
pnpm db:seed          # Peupler la base avec des données de test
pnpm db:reset         # Reset complet (drop + migrate + seed)
pnpm db:studio        # Ouvrir Prisma Studio (UI)
pnpm db:generate      # Regénérer le client Prisma
pnpm db:test          # Tester la connexion + perfs
```

### Tests

```bash
pnpm test             # Exécuter tous les tests
pnpm test:watch       # Mode watch (re-run automatique)
pnpm test:coverage    # Générer le rapport de couverture
pnpm test:api         # Test rapide de santé API (curl)
```

### Prisma

```bash
pnpm prisma:format    # Formater schema.prisma
npx prisma migrate dev --name <name>  # Créer une migration
npx prisma db push    # Sync schema sans migration (dev uniquement)
```

---

## 🛣️ API Routes

**Base URL** : `http://localhost:3001`

### Endpoints disponibles

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Health** | `GET /health` | Statut API + DB |
| **Folders** | 6 endpoints | Gestion dossiers clients |
| **Quotes** | 8 endpoints | Gestion devis déménageurs |
| **Movers** | 6 endpoints | Référencement déménageurs |
| **Clients** | 5 endpoints | Gestion clients (RGPD) |
| **Leads** | 4 endpoints | Capture et conversion leads |
| **Bookings** | 3 endpoints | Réservations confirmées |
| **Payments** | 2 endpoints | Paiements Stripe |

**Total** : **34 endpoints REST**

📖 **Documentation complète** : [`API.md`](./API.md)

### Exemple rapide

```bash
# Health check
curl http://localhost:3001/health

# Créer un lead
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "source": "bordeaux-demenageur.fr",
    "email": "client@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "originCity": "Bordeaux",
    "originPostalCode": "33000",
    "destCity": "Paris",
    "destPostalCode": "75001"
  }'

# Lister les dossiers (pagination)
curl "http://localhost:3001/api/folders?page=1&limit=10"
```

---

## 🧪 Tests

### Couverture actuelle

- ✅ **148 tests unitaires** (services + utils)
- 🔄 Tests E2E (34 endpoints) — TODO
- 📊 **Coverage** : ~90% services, ~95% utils

### Structure des tests

```
tests/
├── unit/
│   ├── services/        # 6 modules × ~20 tests
│   │   ├── folders.service.test.ts    (19 tests)
│   │   ├── quotes.service.test.ts     (27 tests)
│   │   ├── movers.service.test.ts     (25 tests)
│   │   ├── clients.service.test.ts    (19 tests)
│   │   ├── leads.service.test.ts      (16 tests)
│   │   └── bookings.service.test.ts   (14 tests)
│   └── utils/
│       ├── pagination.test.ts         (15 tests)
│       └── ApiError.test.ts           (13 tests)
├── integration/         # TODO: Tests E2E
├── helpers.ts           # Factories & cleanup
└── setup.ts             # Jest config
```

### Lancer les tests

```bash
# Tous les tests
pnpm test

# Mode watch (dev)
pnpm test:watch

# Avec coverage
pnpm test:coverage

# Test spécifique
pnpm test folders.service

# Verbose
pnpm test -- --verbose
```

### Exemple de sortie

```
PASS  tests/unit/services/folders.service.test.ts
PASS  tests/unit/services/quotes.service.test.ts
PASS  tests/unit/services/movers.service.test.ts
PASS  tests/unit/services/clients.service.test.ts
PASS  tests/unit/services/leads.service.test.ts
PASS  tests/unit/services/bookings.service.test.ts
PASS  tests/unit/utils/pagination.test.ts
PASS  tests/unit/utils/ApiError.test.ts

Test Suites: 8 passed, 8 total
Tests:       148 passed, 148 total
Snapshots:   0 total
Time:        64.321 s
```

---

## 🛡️ Sécurité

### Protections actives (POC Level)

✅ **Helmet** : Headers HTTP sécurisés  
✅ **Rate Limiting** : 1000 req/15min par IP  
✅ **Zod Validation** : Typage strict + sanitization  
✅ **CORS** : Configuré avec credentials  
✅ **Payload Limit** : 10mb max (anti-DOS)

### Ce qui n'est PAS implémenté (POC)

❌ **JWT Authentication** : Mock `x-user-id` en dev  
❌ **RBAC** : Pas de rôles admin/operator/mover  
❌ **Logs structurés** : Morgan basic uniquement  
❌ **Monitoring** : Pas de Sentry/DataDog

📖 **Détails complets** : [`SECURITY.md`](./SECURITY.md)

### Checklist Production

Avant mise en prod, implémenter :
- [ ] JWT auth + RBAC
- [ ] Rate limit strict (100/15min)
- [ ] Logs structurés (Pino/Winston)
- [ ] Monitoring (Sentry)
- [ ] HTTPS obligatoire
- [ ] Secrets management (Vault)
- [ ] Audit logs (table dédiée)

---

## 🗃️ Base de données

### Modèle de données (Prisma)

**12 models** couvrant tout le flux métier :

```prisma
// Core business
Lead          # Capture initiale
Client        # Données client (RGPD)
Folder        # Dossier déménagement
Mover         # Déménageurs référencés
PricingGrid   # Grilles tarifaires
Quote         # Devis collectés
Top3Selection # Snapshot top 3 figé
Booking       # Réservation confirmée
Payment       # Paiements Stripe

// Support
User          # Équipe Moverz
EmailLog      # Historique emails
EmailTemplate # Templates d'emails
```

**9 enums** : LeadStatus, FolderStatus, EstimationMethod, QuoteStatus, BookingStatus, PaymentStatus, PaymentType, UserRole, EmailType

### Migrations

```bash
# Créer une migration
pnpm db:migrate --name add_new_field

# Appliquer les migrations (prod)
pnpm db:migrate:deploy

# Reset complet (dev uniquement)
pnpm db:reset
```

### Seed data

Le script `prisma/seed.ts` génère :
- 5 Movers
- 12 PricingGrids
- 5 Users (admin, operator)
- 3 Clients + Folders
- 10 Quotes (divers statuts)
- 1 Top3Selection
- 1 Booking + 1 Payment

```bash
pnpm db:seed
```

📖 **Documentation Prisma** : [`prisma/README.md`](./prisma/README.md)

---

## 🔧 Développement

### Workflow recommandé

1. **Créer une branche**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Modifier le schéma Prisma** (si nécessaire)
   ```bash
   # Éditer prisma/schema.prisma
   pnpm db:migrate --name my_migration
   pnpm db:generate
   ```

3. **Créer les Zod schemas** (`src/schemas/`)
   ```typescript
   export const mySchema = z.object({
     field: z.string().min(1),
   });
   ```

4. **Implémenter le service** (`src/services/`)
   ```typescript
   export async function myService() {
     return prisma.myModel.create({ ... });
   }
   ```

5. **Créer le controller** (`src/controllers/`)
   ```typescript
   export const myController = asyncHandler(async (req, res) => {
     const data = await myService();
     res.json(data);
   });
   ```

6. **Ajouter la route** (`src/routes/`)
   ```typescript
   router.post('/', validateRequest({ body: mySchema }), myController);
   ```

7. **Écrire les tests** (`tests/unit/services/`)
   ```typescript
   describe('myService', () => {
     it('should work', async () => { ... });
   });
   ```

8. **Lancer les tests**
   ```bash
   pnpm test
   pnpm test:coverage
   ```

9. **Commit & push**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

### Hot reload

Le serveur redémarre automatiquement à chaque modification :

```bash
pnpm dev
# → tsx watch src/server.ts
```

### Debug TypeScript

```bash
# Vérifier les types
pnpm type-check

# Build pour voir les erreurs
pnpm build
```

### Prisma Studio

Interface graphique pour explorer la base :

```bash
pnpm db:studio
# → http://localhost:5555
```

---

## 🚀 Production

### Build & Deploy

```bash
# 1. Build TypeScript
pnpm build

# 2. Appliquer les migrations
pnpm db:migrate:deploy

# 3. Lancer le serveur
pnpm start
```

### Variables d'environnement (prod)

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
PORT=3001
CORS_ORIGIN=https://app.moverz.fr
# + JWT_SECRET, STRIPE_SECRET_KEY, etc.
```

### Docker (optionnel)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm db:generate
CMD ["pnpm", "start"]
```

### Health checks

```bash
# Kubernetes/Docker readiness probe
curl http://localhost:3001/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-11-10T...",
#   "database": "connected",
#   "environment": "production"
# }
```

---

## 📚 Documentation complémentaire

| Fichier | Description |
|---------|-------------|
| [`API.md`](./API.md) | Documentation complète des 34 endpoints |
| [`SECURITY.md`](./SECURITY.md) | Protections actives & checklist prod |
| [`prisma/README.md`](./prisma/README.md) | Commandes Prisma & migrations |
| [`ENV_SETUP.md`](./ENV_SETUP.md) | Configuration variables d'environnement |
| [`../docs/CONTEXT.md`](../docs/CONTEXT.md) | Vision business Moverz |
| [`../docs/TASKS_RULES.md`](../docs/TASKS_RULES.md) | Workflow & règles de dev |

---

## 🤝 Contribution

### Standards de code

- **TypeScript strict** : Pas de `any` sauf cas exceptionnels
- **Zod validation** : Obligatoire sur tous les endpoints
- **Tests unitaires** : Chaque service doit être testé
- **Commits conventionnels** : `feat:`, `fix:`, `docs:`, etc.
- **Nomenclature** : camelCase (TS), snake_case (SQL)

### Règles projet

1. **Aucune modification sans task** (voir `/.cursor/tasks/`)
2. **Toujours tester avant de commit**
3. **Documenter les breaking changes**
4. **Respecter l'architecture modulaire**

---

## 📞 Support

- **Issues GitHub** : [github.com/gdetaisne/Back_Office](https://github.com/gdetaisne/Back_Office)
- **Documentation interne** : `/docs/`
- **Logs backend** : `pnpm dev` (mode verbose)

---

## 📝 Changelog

| Version | Date | Changements |
|---------|------|-------------|
| **0.1.0** | 2025-11-10 | Initial release (POC) |
| | | • 34 endpoints REST |
| | | • 148 tests unitaires |
| | | • Sécurité POC (Helmet + Rate Limit) |
| | | • PostgreSQL Neon.tech |

---

## 📄 Licence

Propriétaire — Moverz © 2025

---

**Made with ❤️ by the Moverz Team**

