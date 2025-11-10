# P0-t015 — Sécurisation & Tests Backend

**Priorité : P0** — Avant d'ajouter de nouvelles features, sécuriser et tester le socle existant.

## Contexte

L'API Backend est fonctionnelle (34 endpoints opérationnels, P0-t014 ✅), mais avant d'aller plus loin, il faut :
1. **Tester** tous les endpoints de manière systématique
2. **Sécuriser** les inputs et les données sensibles
3. **Documenter** l'API pour l'équipe
4. **Vérifier** les edge cases et error scenarios
5. **Optimiser** les performances si nécessaire

**Objectif** : Avoir un backend **production-ready** et **robuste**.

---

## Objectifs

### A. Tests Automatisés (Jest + Supertest)

#### Setup
- [ ] Installer Jest + Supertest + ts-jest
- [ ] Configurer Jest pour TypeScript + ESM
- [ ] Setup test database (Neon test env ou SQLite)
- [ ] Script `pnpm test` et `pnpm test:watch`

#### Tests Unitaires (Services)
- [ ] `folders.service.test.ts` : CRUD + select-quote + delete
- [ ] `quotes.service.test.ts` : Create, validate, score, remind
- [ ] `movers.service.test.ts` : Create (SIRET unique), blacklist
- [ ] `clients.service.test.ts` : Create (email unique), anonymize
- [ ] `leads.service.test.ts` : Convert lead → folder + client
- [ ] `bookings.service.test.ts` : 30% deposit validation, commission calc

#### Tests Intégration (Routes E2E)
- [ ] `folders.routes.test.ts` : 6 endpoints (POST, GET, PATCH, DELETE, select-quote)
- [ ] `quotes.routes.test.ts` : 8 endpoints (validate, score, remind)
- [ ] `movers.routes.test.ts` : 6 endpoints (blacklist scenario)
- [ ] `clients.routes.test.ts` : 5 endpoints (anonymize RGPD)
- [ ] `leads.routes.test.ts` : 4 endpoints (convert scenario)
- [ ] `bookings.routes.test.ts` : 5 endpoints (deposit + payments)

#### Tests Edge Cases
- [ ] Invalid UUIDs → 400 Bad Request
- [ ] Missing required fields → 400 Validation Error
- [ ] Duplicate SIRET/email → 409 Conflict
- [ ] Foreign key violations → 400
- [ ] Soft deleted resources → 404 Not Found
- [ ] Negative amounts → 400
- [ ] Invalid deposit percentage (≠ 30%) → 400
- [ ] Pagination edge cases (page 0, limit > max)

#### Coverage Target
- [ ] **Services : > 80%** (business logic critique)
- [ ] **Controllers : > 70%** (request handling)
- [ ] **Routes : 100%** (tous les endpoints testés)

---

### B. Sécurité Renforcée

#### Input Sanitization
- [ ] Ajouter `express-validator` ou `xss` pour sanitization
- [ ] Bloquer scripts XSS dans tous les champs texte
- [ ] Valider/sanitizer les emails (trim, lowercase)
- [ ] Limiter longueur des strings (max 500 chars pour notes, etc.)

#### Données Sensibles
- [ ] Masquer emails/phones dans les logs (morgan custom tokens)
- [ ] Chiffrer `blacklistReason` et `creditSafeNotes` si sensibles
- [ ] Ajouter `select: false` sur champs sensibles si besoin
- [ ] Audit des includes : ne jamais exposer mots de passe users

#### Rate Limiting Granulaire
- [ ] Rate limit plus strict sur `/api/quotes` (50 req/min)
- [ ] Rate limit très strict sur `/api/bookings` (20 req/min)
- [ ] Rate limit sur `/api/clients/:id/anonymize` (5 req/min)
- [ ] Whitelist IPs admin si besoin

#### CORS & Headers
- [ ] Restreindre CORS_ORIGIN en production (pas de wildcard)
- [ ] Ajouter CSP headers (Content-Security-Policy)
- [ ] Configurer `helmet` plus strictement (HSTS, X-Frame-Options)

#### Authentification Basique (Placeholder)
- [ ] Middleware `authenticate` : vérifier `x-user-id` header en dev
- [ ] Middleware `authorize(roles)` : vérifier role user (ADMIN, OPERATOR)
- [ ] Protéger routes admin : `/validate`, `/score`, `/blacklist`, `/anonymize`
- [ ] Documenter que JWT complet sera P0-t016

---

### C. Documentation API

#### README Backend
- [ ] Créer `/backend/README.md` avec :
  - Architecture overview
  - Setup instructions (install, migrate, seed)
  - Environment variables
  - Scripts (dev, test, build, start)
  - API endpoints summary

#### API Documentation
- [ ] Créer `/backend/docs/API.md` avec tous les endpoints :
  - Request format (body, query, params)
  - Response format (success, errors)
  - Examples `curl` pour chaque endpoint
  - Status codes possibles (200, 201, 400, 404, 409, 500)

#### Postman/Insomnia Collection
- [ ] Exporter collection Postman avec :
  - 34 endpoints pré-configurés
  - Environment variables (BASE_URL, x-user-id)
  - Tests scripts (status code, response schema)
  - Scenarios (create lead → convert → create booking)

#### OpenAPI/Swagger (Optionnel)
- [ ] Installer `swagger-ui-express` + `swagger-jsdoc`
- [ ] Générer spec OpenAPI 3.0 à partir des routes
- [ ] Endpoint `/api-docs` avec Swagger UI
- [ ] Auto-sync avec code (JSDoc comments)

---

### D. Edge Cases & Error Scenarios

#### Validation Renforcée
- [ ] Test : Create folder avec `clientId` inexistant → 404
- [ ] Test : Select quote avec `quoteId` d'un autre folder → 400
- [ ] Test : Create booking avec quote non VALIDATED → 400
- [ ] Test : Delete mover avec quotes actives → 400
- [ ] Test : Delete client avec bookings actifs → 400
- [ ] Test : Anonymize client déjà anonymisé → 409
- [ ] Test : Convert lead déjà converti → 400

#### Race Conditions
- [ ] Vérifier unicité SIRET avec transactions si besoin
- [ ] Vérifier unicité email avec `findUnique` + catch P2002
- [ ] Tester création simultanée de 2 clients même email

#### Decimal Precision
- [ ] Vérifier calculs commission (5%, 10%, 15%) sur montants réels
- [ ] Tester dépôt 30% sur montants avec centimes (ex: 123.45€)
- [ ] Vérifier arrondis (Math.round vs toFixed vs Decimal)

#### Database Constraints
- [ ] Test : Update folder.status avec valeur invalide → Prisma error
- [ ] Test : Create quote avec enum source invalide → 400
- [ ] Test : Dates dans le passé (movingDate, validUntil) → 400

---

### E. Performance & Optimisation

#### Benchmarks
- [ ] Test : GET /api/folders avec 100+ folders → <500ms
- [ ] Test : GET /api/quotes avec 1000+ quotes → <1s (pagination)
- [ ] Test : GET /api/movers/:id avec stats complexes → <300ms

#### Query Optimization
- [ ] Vérifier tous les `include` : sont-ils nécessaires ?
- [ ] Ajouter `select` pour limiter les champs retournés si trop volumineux
- [ ] Vérifier indexes Prisma sur colonnes filtrées (status, email, etc.)

#### Caching (Optionnel)
- [ ] Ajouter cache Redis pour `/api/movers` (données quasi-statiques)
- [ ] Cache TTL 5 min pour listes, invalidation sur mutation
- [ ] Stratégie cache-aside ou write-through

---

### F. Monitoring & Logs

#### Logs Structurés
- [ ] Remplacer `console.log` par logger structuré (Pino ou Winston)
- [ ] Format JSON en production : `{ level, timestamp, message, context }`
- [ ] Niveaux : ERROR, WARN, INFO, DEBUG
- [ ] Contexte : `userId`, `folderId`, `moverId`, etc.

#### Error Tracking
- [ ] Installer Sentry ou équivalent (optionnel pour MVP)
- [ ] Capturer unhandled rejections
- [ ] Capturer errors 500 avec stack trace
- [ ] Grouper errors par type (Prisma, Validation, etc.)

#### Health Checks Avancés
- [ ] `/health` : Ajouter checks :
  - Database connectivity (timeout 5s)
  - Database query performance (SELECT 1)
  - Disk space (si local)
  - Memory usage
- [ ] `/health/ready` : Readiness probe (K8s compatible)
- [ ] `/health/live` : Liveness probe

#### Metrics (Optionnel)
- [ ] Endpoint `/metrics` (Prometheus format)
- [ ] Métriques : requests_total, request_duration, db_queries, errors

---

## Périmètre

**IN scope** :
- Tests automatisés (Jest + Supertest)
- Sécurité input/output (sanitization, rate-limit)
- Documentation complète (README, API.md, Postman)
- Edge cases validation
- Performance basique

**OUT scope** :
- Authentification JWT complète (→ P0-t016)
- Workers/Automatisations (→ P0-t016 ou P0-t017)
- Interface Admin (→ P0-t006)
- CI/CD pipeline (→ P1)
- Load testing avancé (→ P1)

---

## Implémentation

### Structure Tests

```
backend/
├── src/
│   └── ... (existing)
├── tests/
│   ├── setup.ts                    # Test setup + DB
│   ├── helpers.ts                  # Test helpers
│   │
│   ├── unit/
│   │   ├── services/
│   │   │   ├── folders.service.test.ts
│   │   │   ├── quotes.service.test.ts
│   │   │   ├── movers.service.test.ts
│   │   │   ├── clients.service.test.ts
│   │   │   ├── leads.service.test.ts
│   │   │   └── bookings.service.test.ts
│   │   └── utils/
│   │       ├── pagination.test.ts
│   │       └── ApiError.test.ts
│   │
│   └── integration/
│       ├── folders.routes.test.ts
│       ├── quotes.routes.test.ts
│       ├── movers.routes.test.ts
│       ├── clients.routes.test.ts
│       ├── leads.routes.test.ts
│       └── bookings.routes.test.ts
│
├── jest.config.js
└── .env.test
```

### Dependencies à Ajouter

```bash
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
pnpm add -D @faker-js/faker    # Pour générer données test
pnpm add helmet-csp xss         # Sécurité
pnpm add pino pino-pretty       # Logging structuré
```

---

## État d'avancement

**Phase 1 : Tests (Priorité Haute)**
- [ ] Setup Jest + test database
- [ ] Tests unitaires services (6 modules)
- [ ] Tests intégration routes (6 modules)
- [ ] Coverage > 80%

**Phase 2 : Sécurité (Priorité Haute)**
- [ ] Input sanitization (XSS)
- [ ] Rate limiting granulaire
- [ ] Données sensibles (logs, masking)
- [ ] Auth basique (x-user-id + roles)

**Phase 3 : Documentation (Priorité Moyenne)**
- [ ] README backend
- [ ] API.md avec exemples
- [ ] Postman collection
- [ ] Swagger (optionnel)

**Phase 4 : Robustesse (Priorité Moyenne)**
- [ ] Edge cases validés
- [ ] Error scenarios testés
- [ ] Performance benchmarks

**Phase 5 : Monitoring (Priorité Basse)**
- [ ] Logs structurés (Pino)
- [ ] Health checks avancés
- [ ] Metrics (optionnel)

**Statut : 📝 Spécification — Prêt pour implémentation**

---

## Commits liés

*(à renseigner au fur et à mesure)*

---

## Critères d'Acceptation

### Must-Have (Bloquants MVP)
1. ✅ **80%+ code coverage** sur services et routes critiques
2. ✅ **Tous les endpoints testés** (34/34) avec scénarios success + error
3. ✅ **Input sanitization** sur tous les champs texte (XSS protection)
4. ✅ **Documentation API** complète (README + API.md + exemples curl)
5. ✅ **Edge cases validés** (unicité, FK, soft delete, validations métier)
6. ✅ **Auth basique fonctionnelle** (x-user-id + roles pour routes admin)

### Nice-to-Have (Post-MVP)
- ⏳ Postman collection exportée
- ⏳ Swagger UI sur `/api-docs`
- ⏳ Logs structurés (Pino)
- ⏳ Health checks avancés
- ⏳ Cache Redis pour movers

---

## Notes Futures

### Après P0-t015

**Si P0-t015 réussi** :
- **P0-t016** : Authentification JWT complète (login, register, refresh tokens)
- **P0-t017** : Workers & Automatisations (BullMQ, emails, webhooks Stripe)
- **P0-t006** : Interface Admin (React + API consommée)

**Améliorations Continues** :
- CI/CD avec tests automatiques (GitHub Actions)
- Load testing (k6 ou Artillery)
- Database migrations versioning strict
- Monitoring production (Sentry, Datadog)

### Questions à Résoudre

1. **Test DB** : Utiliser Neon.tech test env ou SQLite en mémoire ?
   - Neon : Plus proche de prod, mais nécessite connexion
   - SQLite : Rapide, isolé, mais différences PostgreSQL

2. **Auth basique** : x-user-id header suffit en dev, ou implémenter API key ?
   - x-user-id : Simple, rapide pour tester
   - API key : Plus sécurisé, meilleure séparation

3. **Coverage target réaliste** : 80% ou 90% ?
   - 80% : Réaliste pour MVP
   - 90% : Idéal mais time-consuming

---

## Estimation

**Temps estimé** : 2-3 jours de travail intensif

- **Jour 1** : Setup tests + tests services (6 modules)
- **Jour 2** : Tests routes E2E + edge cases
- **Jour 3** : Sécurité (sanitization, rate-limit, auth) + Documentation

**Bloqueurs potentiels** :
- Configuration Jest avec ESM + TypeScript peut être complexe
- Test database setup (Neon vs SQLite)
- Coverage > 80% nécessite tests exhaustifs

---

**Ready to secure the foundation? 🛡️**

