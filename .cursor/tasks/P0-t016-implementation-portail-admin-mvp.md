# P0-t016 — Implémentation Portail Admin MVP

**Priorité : P0** — Premier portail frontend pour opérer la plateforme.

## Contexte

La spec **P0-t006** définit complètement le portail admin `/admin`.  
Le **backend est opérationnel** (34 endpoints REST, 148 tests, doc complète).

**Objectif** : Implémenter le portail admin MVP en React pour permettre à l'équipe Moverz de :
- Superviser les dossiers, devis, paiements
- Valider manuellement les actions critiques
- Observer toutes les actions système/humain/IA
- Bénéficier de l'assistance IA pour les emails

**Base** : Spec complète dans `P0-t006` (~830 lignes)

---

## Objectifs

### A. Setup Frontend (Vite + React + TypeScript)

- [ ] Initialiser projet Vite + React 18 + TypeScript
- [ ] Configurer Tailwind CSS + shadcn/ui (Apple Glass UI)
- [ ] Setup React Router v6 (routing `/admin`)
- [ ] Configurer React Query (API calls)
- [ ] Configurer Zustand (state management léger)
- [ ] Setup React Hook Form + Zod (validation côté client)
- [ ] Configurer ESLint + Prettier (conventions)
- [ ] Configurer `.env` (backend URL, API keys)

### B. Layout & Navigation

- [ ] Créer `AppLayout` (Sidebar + Header + Content)
- [ ] Créer `Sidebar` (navigation principale + logo)
- [ ] Créer `Header` (breadcrumbs, user menu, status bar)
- [ ] Créer `StatusBar` (DB, Workers, API externes)
- [ ] Implémenter routing React Router v6
- [ ] Créer page 404 custom
- [ ] Responsive mobile (drawer sidebar)

### C. Design System (Apple "Liquid Glass")

- [ ] Créer composants de base (`components/ui/`) :
  - Button (variants: primary, secondary, danger, ghost)
  - Card (translucide avec blur)
  - Badge (status colorés)
  - Input, Textarea, Select (form fields)
  - Modal, Drawer (overlays)
  - Table (paginée, triable, filtrable)
  - Spinner, Skeleton (loading states)
  - Alert, Toast (notifications)
- [ ] Appliquer palette light/dark mode
- [ ] Implémenter animations (fadeIn, slideIn)
- [ ] Configurer `prefers-reduced-motion`

### D. Dashboard (`/admin/dashboard`)

- [ ] Layout Dashboard (grid 3 colonnes responsive)
- [ ] Widget KPIs (4 cartes : dossiers, devis, paiements, taux conversion)
- [ ] Widget Alertes (liste paginée, filtres, redirection)
- [ ] Widget Timeline récente (20 derniers événements)
- [ ] Graphiques (bar chart, pie chart, line chart) avec Recharts
- [ ] Connexion API `/health` pour Status Bar
- [ ] Auto-refresh toutes les 30s (polling ou WebSocket)

### E. Gestion Dossiers (`/admin/folders`)

#### Liste Folders
- [ ] Table paginée (colonnes : ID, Client, Origine → Destination, Volume, Statut, Date, Actions)
- [ ] Filtres : statut, date range, client
- [ ] Tri : par date, statut, volume
- [ ] Badges colorés pour statuts (NEW, QUOTES_REQUESTED, TOP3_SENT, etc.)
- [ ] Actions : Voir, Modifier, Supprimer, Envoyer email

#### Détail Folder (`/admin/folders/:id`)
- [ ] Layout onglets (Overview, Quotes, Timeline, Emails, Payments)
- [ ] Onglet Overview : Infos client, adresses, volume, distance, dates
- [ ] Onglet Quotes : Table devis avec scores, validation, top 3
- [ ] Onglet Timeline : Timeline visuelle avec icônes + acteurs
- [ ] Onglet Emails : Liste emails envoyés/reçus
- [ ] Onglet Payments : Détails paiements si booking confirmé
- [ ] Bouton "✨ AI Compose" (drawer AI Mail Composer)

### F. Gestion Devis (`/admin/quotes`)

#### Liste Quotes
- [ ] Table paginée (colonnes : ID, Dossier, Déménageur, Prix, Statut, Score, Date, Actions)
- [ ] Filtres : statut, déménageur, dossier, date range
- [ ] Tri : par score, prix, date
- [ ] Badges statuts (REQUESTED, RECEIVED, VALIDATED, REMINDED, EXPIRED)
- [ ] Actions : Valider, Scorer, Relancer, Télécharger PDF

#### Détail Quote (`/admin/quotes/:id`)
- [ ] Infos devis (prix, acompte, validité, PDF, notes)
- [ ] Infos déménageur (nom, SIRET, email, Google, CreditSafe)
- [ ] Scoring détaillé (prix, Google, financier, litiges) → score total
- [ ] Validation manuelle (bouton + modal confirmation)
- [ ] Scoring manuel (formulaire + calcul auto du total)
- [ ] Historique timeline des actions

### G. Gestion Déménageurs (`/admin/movers`)

#### Liste Movers
- [ ] Table paginée (colonnes : Nom, SIRET, Email, Ville, Note Google, Avis, Statut, Actions)
- [ ] Filtres : statut (ACTIVE, BLACKLISTED), ville, note Google
- [ ] Tri : par note, avis, date création
- [ ] Badges statuts (ACTIVE, BLACKLISTED)
- [ ] Actions : Voir, Modifier, Blacklist/Unblacklist, Sync Google

#### Détail Mover (`/admin/movers/:id`)
- [ ] Layout onglets (Overview, Google Data, CreditSafe, Pricing Grids, Quotes, Blacklist)
- [ ] Onglet Overview : Infos entreprise, SIRET, adresse, contact
- [ ] Onglet Google : Note, avis, lien Maps, dernier sync, bouton "Sync Now"
- [ ] Onglet CreditSafe : Score financier, notes admin, dernière màj
- [ ] Onglet Pricing Grids : Liste grilles tarifaires, CRUD
- [ ] Onglet Quotes : Liste devis envoyés par ce déménageur
- [ ] Onglet Blacklist : Raison, date, historique, formulaire blacklist

### H. Gestion Clients (`/admin/clients`)

#### Liste Clients
- [ ] Table paginée (colonnes : Email, Nom, Prénom, Téléphone, Dossiers, Date, Actions)
- [ ] Filtres : anonymisé (oui/non), date inscription
- [ ] Tri : par date, nombre de dossiers
- [ ] Actions : Voir, Modifier, Anonymiser

#### Détail Client (`/admin/clients/:id`)
- [ ] Infos client (email, téléphone, nom, prénom, date création)
- [ ] Liste dossiers du client (avec statuts)
- [ ] Bouton "🔒 Anonymiser" (modal confirmation + raison RGPD)

### I. Gestion Leads (`/admin/leads`)

#### Liste Leads
- [ ] Table paginée (colonnes : Source, Email, Nom, Origine → Destination, Volume, Statut, Date, Actions)
- [ ] Filtres : statut (NEW, CONTACTED, CONVERTED), source, date range
- [ ] Tri : par date, source
- [ ] Badges statuts (NEW, CONTACTED, CONVERTED)
- [ ] Actions : Voir, Convertir

#### Conversion Lead (`/admin/leads/:id/convert`)
- [ ] Formulaire conversion :
  - Volume ajusté
  - Date déménagement ajustée
  - Notes admin
- [ ] Bouton "✅ Convertir" (créer client + folder)
- [ ] Redirection vers le folder créé après succès

### J. Flux Financiers (`/admin/payments`)

- [ ] Layout Payments :
  - KPIs en haut (CA jour/mois, commissions, reversements, en attente)
  - Table paginée (colonnes : Booking, Client, Déménageur, Type, Montant, Commission, Statut, Date, Actions)
- [ ] Filtres : statut (PENDING, SUCCEEDED, FAILED, REFUNDED), type, date range
- [ ] Tri : par date, montant
- [ ] Badges statuts (PENDING, SUCCEEDED, FAILED, REFUNDED)
- [ ] Actions : Voir détail Stripe, Réessayer paiement, Rembourser

### K. Observabilité

#### Status Bar Globale (Header)
- [ ] Badge DB : 🟢 Connected / 🔴 Disconnected
- [ ] Badge Workers : 🟢 Active (3/3) / 🟡 Degraded / 🔴 Down
- [ ] Badge API externes : Google, Stripe, CreditSafe (🟢/🔴)
- [ ] Compteur erreurs 500 (5 dernières minutes)
- [ ] Clic sur badge → drawer avec détails

#### Activity Feed (Sidebar widget ou `/admin/dashboard`)
- [ ] Stream temps réel (WebSocket ou polling 10s)
- [ ] Liste événements avec icônes + timestamps + acteurs
- [ ] Filtres : type d'événement, acteur, date
- [ ] Clic événement → drawer JSON détails
- [ ] Export CSV

#### Automations Monitor (`/admin/automations`)
- [ ] Table automatisations :
  - Nom, Type, Statut (ON/OFF), Dernière exec, Prochaine exec, Succès/Échecs, Actions
- [ ] Actions : Run Now, Pause, Config
- [ ] Détail automation (drawer) : logs, config, historique

### L. Logs (`/admin/logs`)

- [ ] Table paginée `AuditLog` (50/100/200 par page)
- [ ] Colonnes : Timestamp, Acteur, Entité, Action, Statut, Détails
- [ ] Filtres avancés :
  - Type acteur (SYSTEM, USER, AI)
  - Entité (FOLDER, QUOTE, MOVER, etc.)
  - Action (created, updated, validated, sent, etc.)
  - Statut (SUCCESS, FAILED, PENDING)
  - Date range picker
  - Acteur spécifique (dropdown users)
- [ ] Badges statuts colorés (SUCCESS, FAILED, PENDING)
- [ ] Clic ligne → drawer JSON détails + lien vers entité
- [ ] Export CSV (10 000 lignes max)

### M. AI Mail Composer

- [ ] Composant `AIComposer` (drawer latéral)
- [ ] Disponible sur pages : Folder détail, Quote détail, Mover détail
- [ ] Interface :
  - Contexte auto-rempli (lecture seule)
  - Dropdown type d'email
  - Textarea prompt IA (pré-rempli, éditable)
  - Bouton "✨ Générer Draft"
  - Textarea draft (éditable)
  - Bouton "🔄 Regénérer"
  - Bouton "📧 Envoyer" (modal confirmation)
- [ ] Intégration API OpenAI/Anthropic (backend endpoint `/api/ai/compose`)
- [ ] Historique drafts (`/admin/ai-drafts`)

### N. Settings (`/admin/settings`)

- [ ] Section Profil : Email, nom, photo
- [ ] Section Apparence : Toggle dark mode, reduced motion
- [ ] Section Email Templates : CRUD templates
- [ ] Section Relances : Config délais (J+2, J+4), contenus
- [ ] Section Notifications : Préférences push/email

---

## Périmètre

### IN Scope (MVP P0-t016)

**Frontend** :
- ✅ Setup Vite + React + TypeScript + Tailwind + shadcn/ui
- ✅ Layout (Sidebar, Header, Status Bar, routing)
- ✅ Design System Apple "Liquid Glass" (composants de base)
- ✅ Dashboard (KPIs, alertes, timeline, graphiques)
- ✅ Folders (liste, détail, timeline)
- ✅ Quotes (liste, détail, validation, scoring)
- ✅ Movers (liste, détail, blacklist)
- ✅ Clients (liste, détail, anonymisation)
- ✅ Leads (liste, conversion)
- ✅ Payments (liste, KPIs)
- ✅ Logs (AuditLog, filtres, export)
- ✅ AI Mail Composer (génération drafts, validation humaine)
- ✅ Status Bar (observabilité temps réel)
- ✅ Activity Feed (timeline unifiée)
- ✅ Automations Monitor (liste, Run Now)

**Connexion Backend** :
- ✅ React Query pour toutes les API calls
- ✅ Authentification mock (x-user-id header)
- ✅ Gestion erreurs (toasts, fallbacks)
- ✅ Pagination backend (offset-based)
- ✅ Filtres & tri côté serveur

**UX** :
- ✅ Loading states (spinners, skeletons)
- ✅ Empty states (illustrations, actions)
- ✅ Error states (retry, fallback)
- ✅ Responsive mobile (drawer sidebar, stacked layout)
- ✅ Animations légères (fade, slide)
- ✅ Dark mode (toggle)

### OUT Scope (Phase 2 ou autres tasks)

**Fonctionnalités avancées** :
- ❌ JWT Authentication complète (sera P0-t017 ou P0-t018)
- ❌ RBAC granulaire (admin, operator)
- ❌ Notifications push WebSocket temps réel (Nice-to-Have)
- ❌ Dashboard personnalisable (widgets drag-and-drop)
- ❌ Recherche globale (Cmd+K)
- ❌ Raccourcis clavier (Cmd+1, etc.)
- ❌ Export avancé (PDF, Excel)
- ❌ Webhooks admin (Slack, Discord)
- ❌ Graphiques analytics avancés (CA par région, etc.)
- ❌ Gestion users admin (CRUD, rôles)
- ❌ Tests E2E Cypress (sera P1)
- ❌ Storybook (sera P1)

**Intégrations** :
- ❌ Stripe Connect dashboard embed (sera P0-t017 Stripe)
- ❌ Google Places autocomplete (sera P1)
- ❌ CreditSafe API live (sera P1)
- ❌ Email sending service (Resend, etc.) (sera P0-t011)
- ❌ BullMQ dashboard embed (sera P1)

---

## Stack Technique

### Frontend

| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Build Tool** | Vite | 5.x | Rapide, HMR performant, config simple |
| **Framework** | React | 18.x | Hooks, Suspense, Concurrent rendering |
| **Language** | TypeScript | 5.x | Type safety, autocomplete, refactoring |
| **Styling** | Tailwind CSS | 3.x | Utility-first, Apple Glass UI facile |
| **Components** | shadcn/ui | Latest | Composants pré-stylés + customisables |
| **Routing** | React Router | 6.x | Standard, nested routes, loaders |
| **State** | Zustand | 4.x | Léger, simple, pas de boilerplate |
| **API Calls** | React Query | 5.x | Cache, refetch, mutations, loading states |
| **Forms** | React Hook Form | 7.x | Performance, validation, DX |
| **Validation** | Zod | 3.x | Type-safe, réutilisable (backend/frontend) |
| **Charts** | Recharts | 2.x | React-first, responsive, customisable |
| **Icons** | Lucide React | Latest | Moderne, léger, cohérent |
| **Date/Time** | date-fns | 3.x | Léger, tree-shakable, locale FR |

### Tooling

| Outil | Justification |
|-------|---------------|
| **ESLint** | Linting TypeScript + React |
| **Prettier** | Formatting uniforme |
| **Husky** | Pre-commit hooks (optionnel) |
| **pnpm** | Package manager rapide |

---

## Architecture Frontend

### Structure de dossiers

```
frontend/
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root component
│   │
│   ├── components/
│   │   ├── ui/                  # Design system (shadcn/ui)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── AppLayout.tsx    # Sidebar + Header + Content
│   │   │   ├── Sidebar.tsx      # Navigation principale
│   │   │   ├── Header.tsx       # Breadcrumbs + user menu + status
│   │   │   └── StatusBar.tsx    # DB, Workers, API externes
│   │   │
│   │   ├── dashboard/           # Dashboard widgets
│   │   │   ├── KPICard.tsx
│   │   │   ├── AlertsList.tsx
│   │   │   ├── TimelineFeed.tsx
│   │   │   └── Charts.tsx
│   │   │
│   │   ├── folders/             # Folders components
│   │   │   ├── FoldersTable.tsx
│   │   │   ├── FolderDetail.tsx
│   │   │   ├── FolderTimeline.tsx
│   │   │   └── FolderForm.tsx
│   │   │
│   │   ├── quotes/              # Quotes components
│   │   │   ├── QuotesTable.tsx
│   │   │   ├── QuoteDetail.tsx
│   │   │   ├── QuoteValidation.tsx
│   │   │   └── QuoteScoring.tsx
│   │   │
│   │   ├── movers/              # Movers components
│   │   │   ├── MoversTable.tsx
│   │   │   ├── MoverDetail.tsx
│   │   │   ├── MoverBlacklist.tsx
│   │   │   └── PricingGridForm.tsx
│   │   │
│   │   ├── clients/             # Clients components
│   │   │   ├── ClientsTable.tsx
│   │   │   ├── ClientDetail.tsx
│   │   │   └── ClientAnonymize.tsx
│   │   │
│   │   ├── leads/               # Leads components
│   │   │   ├── LeadsTable.tsx
│   │   │   ├── LeadDetail.tsx
│   │   │   └── LeadConversion.tsx
│   │   │
│   │   ├── payments/            # Payments components
│   │   │   ├── PaymentsTable.tsx
│   │   │   ├── PaymentKPIs.tsx
│   │   │   └── PaymentDetail.tsx
│   │   │
│   │   ├── logs/                # Logs components
│   │   │   ├── AuditLogsTable.tsx
│   │   │   ├── LogFilters.tsx
│   │   │   └── LogDetailDrawer.tsx
│   │   │
│   │   ├── ai/                  # AI components
│   │   │   ├── AIComposer.tsx   # Drawer AI Mail Composer
│   │   │   ├── AIPromptEditor.tsx
│   │   │   └── AIDraftsList.tsx
│   │   │
│   │   └── common/              # Shared components
│   │       ├── DataTable.tsx    # Generic paginated table
│   │       ├── Filters.tsx      # Generic filters
│   │       ├── EmptyState.tsx   # Empty state illustrations
│   │       ├── ErrorBoundary.tsx
│   │       └── Breadcrumbs.tsx
│   │
│   ├── pages/                   # Page components (routes)
│   │   ├── Dashboard.tsx
│   │   ├── Folders/
│   │   │   ├── FoldersList.tsx
│   │   │   └── FolderDetail.tsx
│   │   ├── Quotes/
│   │   │   ├── QuotesList.tsx
│   │   │   └── QuoteDetail.tsx
│   │   ├── Movers/
│   │   │   ├── MoversList.tsx
│   │   │   └── MoverDetail.tsx
│   │   ├── Clients/
│   │   │   ├── ClientsList.tsx
│   │   │   └── ClientDetail.tsx
│   │   ├── Leads/
│   │   │   ├── LeadsList.tsx
│   │   │   └── LeadConversion.tsx
│   │   ├── Payments/
│   │   │   └── PaymentsList.tsx
│   │   ├── Logs/
│   │   │   └── AuditLogs.tsx
│   │   ├── Automations/
│   │   │   └── AutomationsMonitor.tsx
│   │   ├── Settings/
│   │   │   └── Settings.tsx
│   │   └── NotFound.tsx
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useFolders.ts        # React Query hooks
│   │   ├── useQuotes.ts
│   │   ├── useMovers.ts
│   │   ├── useClients.ts
│   │   ├── useLeads.ts
│   │   ├── usePayments.ts
│   │   ├── useLogs.ts
│   │   ├── useAI.ts
│   │   ├── useStatusBar.ts      # Status bar polling
│   │   ├── useActivityFeed.ts   # Activity feed polling
│   │   └── useAuth.ts           # Auth mock
│   │
│   ├── lib/                     # Utilities
│   │   ├── api.ts               # Axios instance + interceptors
│   │   ├── queryClient.ts       # React Query client config
│   │   ├── utils.ts             # Helper functions (cn, formatDate, etc.)
│   │   └── constants.ts         # Constants (API_URL, statuses, etc.)
│   │
│   ├── store/                   # Zustand stores
│   │   ├── authStore.ts         # Auth state (userId, role)
│   │   ├── uiStore.ts           # UI state (sidebar open, dark mode)
│   │   └── filtersStore.ts      # Filters state (persist across pages)
│   │
│   ├── types/                   # TypeScript types
│   │   ├── api.types.ts         # API response types
│   │   ├── folder.types.ts
│   │   ├── quote.types.ts
│   │   ├── mover.types.ts
│   │   ├── client.types.ts
│   │   ├── lead.types.ts
│   │   ├── payment.types.ts
│   │   ├── log.types.ts
│   │   └── common.types.ts
│   │
│   ├── styles/
│   │   └── globals.css          # Tailwind imports + custom CSS
│   │
│   └── router.tsx               # React Router config
│
├── .env.example                 # Template env vars
├── .env                         # Actual env vars (gitignored)
├── .eslintrc.cjs                # ESLint config
├── .prettierrc                  # Prettier config
├── tailwind.config.js           # Tailwind + shadcn/ui config
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── package.json
└── pnpm-lock.yaml
```

---

## Implémentation — Phases Détaillées

### Phase 0 : Setup (Jour 1 — Matin, 3h)

**Objectif** : Projet frontend prêt à coder.

#### 0.1. Initialisation Vite + React + TypeScript

```bash
cd /Users/guillaumestehelin/Back_Office
pnpm create vite frontend -- --template react-ts
cd frontend
pnpm install
```

#### 0.2. Installation dépendances

```bash
# Styling
pnpm add tailwindcss postcss autoprefixer
pnpm add -D @tailwindcss/forms @tailwindcss/typography
npx tailwindcss init -p

# shadcn/ui setup
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react

# Routing
pnpm add react-router-dom

# State
pnpm add zustand

# API Calls
pnpm add @tanstack/react-query axios

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# Charts
pnpm add recharts

# Date
pnpm add date-fns

# Tooling
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -D prettier eslint-config-prettier eslint-plugin-react-hooks
```

#### 0.3. Configuration Tailwind + shadcn/ui

- Configurer `tailwind.config.js` (palette Apple Glass, dark mode, animations)
- Créer `src/styles/globals.css` (imports Tailwind + custom CSS)
- Setup shadcn/ui components de base (Button, Card, Badge, Input, Table, Modal, Drawer)

#### 0.4. Configuration ESLint + Prettier

- `.eslintrc.cjs` : React hooks, TypeScript, Prettier
- `.prettierrc` : Single quotes, 2 spaces, trailing comma

#### 0.5. Configuration `.env`

```bash
VITE_API_URL=http://localhost:3001
VITE_USER_ID=dev-admin-123
```

#### 0.6. Configuration React Query

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

#### 0.7. Configuration Axios

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': import.meta.env.VITE_USER_ID,
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally (toast, redirect, etc.)
    return Promise.reject(error);
  }
);

export default api;
```

**Durée** : 3h  
**Livrable** : Frontend setup complet, prêt à coder composants.

---

### Phase 1 : Layout & Navigation (Jour 1 — Après-midi, 4h)

**Objectif** : Structure de base fonctionnelle (Sidebar + Header + Routing).

#### 1.1. Créer `AppLayout`

- Sidebar (navigation principale)
- Header (breadcrumbs, user menu, status bar)
- Content area (children)
- Responsive (drawer sidebar sur mobile)

#### 1.2. Créer `Sidebar`

- Logo Moverz
- Navigation links (Dashboard, Folders, Quotes, Movers, Clients, Leads, Payments, Logs, Automations, Settings)
- Active state highlighting
- Collapse/expand (desktop)
- Drawer (mobile)

#### 1.3. Créer `Header`

- Breadcrumbs (auto-générés depuis route)
- User menu dropdown (nom, email, logout mock)
- Status Bar (DB, Workers, API externes) avec badges colorés
- Dark mode toggle

#### 1.4. Créer `StatusBar`

- Polling `/health` toutes les 30s
- Badges : DB (🟢/🔴), Workers (🟢/🟡/🔴), API (Google, Stripe)
- Clic badge → drawer détails (dernière erreur, logs)

#### 1.5. Setup React Router

```typescript
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
// ... autres imports

export const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'folders', element: <FoldersList /> },
      { path: 'folders/:id', element: <FolderDetail /> },
      // ... autres routes
    ],
  },
]);
```

**Durée** : 4h  
**Livrable** : Layout fonctionnel, navigation, routing, status bar.

---

### Phase 2 : Design System (Jour 2 — Matin, 3h)

**Objectif** : Composants UI de base réutilisables (Apple Glass style).

#### 2.1. Composants shadcn/ui

- `Button` : variants (primary, secondary, danger, ghost)
- `Card` : translucide avec blur (bg-white/80, backdrop-blur-sm)
- `Badge` : status colorés (SUCCESS, FAILED, PENDING, etc.)
- `Input`, `Textarea`, `Select` : form fields avec label + error state
- `Table` : thead + tbody avec hover, tri, pagination footer
- `Modal` : overlay + content + close button
- `Drawer` : slide from right, overlay
- `Spinner` : loading indicator
- `Skeleton` : loading placeholder
- `Alert`, `Toast` : notifications (success, error, warning, info)

#### 2.2. Palette & Dark Mode

- Tailwind config avec couleurs Apple Glass
- Dark mode toggle (localStorage persist)
- Classes dark: sur tous les composants

#### 2.3. Animations

- `fadeIn`, `slideIn` keyframes CSS
- `prefers-reduced-motion` media query
- Transitions hover sur cartes, boutons

**Durée** : 3h  
**Livrable** : Design system complet, cohérent, documenté.

---

### Phase 3 : Dashboard (Jour 2 — Après-midi, 4h)

**Objectif** : Page Dashboard avec KPIs, alertes, timeline, graphiques.

#### 3.1. Layout Dashboard

- Grid 3 colonnes responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
- 4 KPI cards en haut
- Widget alertes (col 1)
- Widget timeline (col 2)
- Graphiques (col 3 ou full width)

#### 3.2. Widget KPIs

- API calls : `GET /api/folders?status=ACTIVE`, `GET /api/quotes?status=VALIDATED`, etc.
- Cards avec icône, chiffre, label, variation (+X% vs hier)
- Loading skeleton pendant fetch

#### 3.3. Widget Alertes

- API call : `GET /api/alerts` (endpoint custom ou filtres)
- Liste paginée (5 alertes max)
- Clic → redirection vers entité (ex: `/admin/quotes/:id`)
- Types : devis non reçus, paiements échoués, erreurs API

#### 3.4. Widget Timeline

- API call : `GET /api/audit-logs?limit=20` (ou Activity Feed endpoint)
- Liste avec icônes, timestamps, acteurs
- Filtres rapides (type événement)
- Auto-refresh polling 30s

#### 3.5. Graphiques (Recharts)

- Bar chart : Volume dossiers par semaine
- Pie chart : Répartition statuts dossiers
- Line chart : CA journalier
- Responsive, tooltips, legends

**Durée** : 4h  
**Livrable** : Dashboard fonctionnel avec données réelles backend.

---

### Phase 4 : Gestion Folders (Jour 3, 6h)

**Objectif** : Liste + détail dossiers avec timeline.

#### 4.1. Liste Folders (`/admin/folders`)

- `GET /api/folders?page=1&limit=10&status=NEW`
- Table paginée (DataTable générique réutilisable)
- Colonnes : ID, Client, Origine → Destination, Volume, Statut, Date, Actions
- Filtres : statut (dropdown), date range (date picker), client (search)
- Tri : par date (default desc), statut, volume
- Badges colorés pour statuts
- Actions : 👁️ Voir, ✏️ Modifier, 🗑️ Supprimer, 📧 Email

#### 4.2. Détail Folder (`/admin/folders/:id`)

- `GET /api/folders/:id?include=client,quotes`
- Layout onglets (Tabs component)
- Onglet **Overview** :
  - Infos client (nom, email, téléphone)
  - Adresses origine/destination (cartes side-by-side)
  - Volume, distance, dates
  - Bouton "✏️ Modifier"
- Onglet **Quotes** :
  - Table devis (avec scores)
  - Badge "Top 3" si dans le top 3
  - Action "✅ Sélectionner" (si non sélectionné)
- Onglet **Timeline** :
  - Timeline verticale avec icônes
  - Timestamps + acteurs (système, admin X)
  - Lien vers AuditLog pour détails JSON
- Onglet **Emails** :
  - Liste emails envoyés/reçus (si endpoint disponible)
  - Statut (sent, delivered, opened, bounced)
- Onglet **Payments** :
  - Liste paiements si booking confirmé
  - KPIs : Total, Acompte, Commission, Montant déménageur

#### 4.3. Bouton AI Compose

- Bouton "✨ AI Compose" en haut de la page
- Ouvre drawer `AIComposer`
- Contexte pré-rempli : client, adresses, volume, statut

**Durée** : 6h  
**Livrable** : Folders liste + détail complet avec timeline.

---

### Phase 5 : Gestion Quotes (Jour 4 — Matin, 4h)

**Objectif** : Liste + détail devis avec validation et scoring.

#### 5.1. Liste Quotes (`/admin/quotes`)

- `GET /api/quotes?page=1&limit=10`
- Table paginée avec colonnes : ID, Dossier, Déménageur, Prix, Statut, Score, Date, Actions
- Filtres : statut, déménageur (search), dossier (search), date range
- Tri : par score (desc), prix (asc), date (desc)
- Badges statuts (REQUESTED, RECEIVED, VALIDATED, REMINDED, EXPIRED)
- Actions : ✅ Valider, 🏆 Scorer, 📧 Relancer, 📄 PDF

#### 5.2. Détail Quote (`/admin/quotes/:id`)

- `GET /api/quotes/:id?include=folder,mover`
- Infos devis : Prix, Acompte, Validité, PDF (lien téléchargement), Notes
- Infos déménageur : Nom, SIRET, Email, Note Google, Avis, CreditSafe score
- **Scoring détaillé** :
  - 4 cartes : Score Prix, Score Google, Score Financier, Score Litiges
  - Score Total (moyenne pondérée) avec jauge visuelle
- **Validation manuelle** :
  - Bouton "✅ Valider ce devis" (si statut RECEIVED)
  - Modal confirmation : "Valider ce devis pour le dossier X ?"
  - API call : `POST /api/quotes/:id/validate`
- **Scoring manuel** :
  - Formulaire avec 4 inputs (0-100)
  - Calcul auto du score total
  - API call : `POST /api/quotes/:id/score`
- **Historique** :
  - Timeline des actions (validé par X le Y, scoré par Z, etc.)

**Durée** : 4h  
**Livrable** : Quotes liste + détail avec validation/scoring fonctionnel.

---

### Phase 6 : Gestion Movers (Jour 4 — Après-midi, 3h)

**Objectif** : Liste + détail déménageurs avec blacklist.

#### 6.1. Liste Movers (`/admin/movers`)

- `GET /api/movers?page=1&limit=10`
- Table avec colonnes : Nom, SIRET, Email, Ville, Note Google, Avis, Statut, Actions
- Filtres : statut (ACTIVE, BLACKLISTED), ville (search), note Google (>4.0)
- Tri : par note (desc), avis (desc), date
- Badges statuts (ACTIVE, BLACKLISTED)
- Actions : 👁️ Voir, ✏️ Modifier, 🚫 Blacklist, 🔄 Sync Google

#### 6.2. Détail Mover (`/admin/movers/:id`)

- `GET /api/movers/:id?include=pricingGrids,quotes`
- Layout onglets (Overview, Google Data, CreditSafe, Pricing Grids, Quotes, Blacklist)
- Onglet **Overview** : Infos entreprise (SIRET, adresse, contact)
- Onglet **Google Data** :
  - Note, Avis, Lien Google Maps
  - Dernier sync (timestamp)
  - Bouton "🔄 Sync Now" → `POST /api/movers/:id/sync-google`
- Onglet **CreditSafe** : Score, Notes admin, Dernière màj
- Onglet **Pricing Grids** :
  - Table grilles tarifaires
  - CRUD (Create, Update, Delete)
- Onglet **Quotes** : Liste devis envoyés par ce déménageur
- Onglet **Blacklist** :
  - Si blacklisté : Raison, Date, Historique
  - Bouton "🚫 Blacklist" (modal raison) → `POST /api/movers/:id/blacklist`
  - Bouton "✅ Unblacklist" (si blacklisté)

**Durée** : 3h  
**Livrable** : Movers liste + détail avec blacklist/sync.

---

### Phase 7 : Clients, Leads, Payments (Jour 5 — Matin, 4h)

**Objectif** : 3 modules simples (liste + détail ou action spécifique).

#### 7.1. Gestion Clients (`/admin/clients`)

- Liste : `GET /api/clients?page=1&limit=10`
- Table avec colonnes : Email, Nom, Prénom, Téléphone, Dossiers, Date, Actions
- Détail : `GET /api/clients/:id?include=folders`
- Action Anonymiser : Modal confirmation + raison → `POST /api/clients/:id/anonymize`

#### 7.2. Gestion Leads (`/admin/leads`)

- Liste : `GET /api/leads?page=1&limit=10&status=NEW`
- Table avec colonnes : Source, Email, Nom, Origine → Destination, Volume, Statut, Date, Actions
- Conversion : Formulaire (volume ajusté, date ajustée, notes) → `POST /api/leads/:id/convert`
- Redirection vers folder créé après succès

#### 7.3. Flux Financiers (`/admin/payments`)

- KPIs en haut : CA jour/mois, Commissions, Reversements, En attente (4 cartes)
- Liste : `GET /api/payments?page=1&limit=10`
- Table avec colonnes : Booking, Client, Déménageur, Type, Montant, Commission, Statut, Date, Actions
- Filtres : statut (PENDING, SUCCEEDED, FAILED, REFUNDED), type, date range
- Actions : 👁️ Voir Stripe (modal ou lien), 🔄 Réessayer, 💸 Rembourser

**Durée** : 4h  
**Livrable** : Clients, Leads, Payments fonctionnels.

---

### Phase 8 : Logs & Automations (Jour 5 — Après-midi, 3h)

**Objectif** : Observabilité complète (AuditLog + Automations Monitor).

#### 8.1. Logs (`/admin/logs`)

- API call : `GET /api/audit-logs?page=1&limit=50`
- Table paginée (50/100/200 par page)
- Colonnes : Timestamp, Acteur, Entité, Action, Statut, Détails
- Filtres avancés :
  - Acteur type (SYSTEM, USER, AI) → dropdown
  - Entité (FOLDER, QUOTE, MOVER, etc.) → dropdown
  - Action (created, updated, validated, sent, etc.) → search
  - Statut (SUCCESS, FAILED, PENDING) → dropdown
  - Date range → date picker
  - Acteur spécifique (user) → dropdown (si endpoint `/api/users` disponible)
- Badges statuts colorés (✅ SUCCESS vert, ❌ FAILED rouge, 🟡 PENDING jaune)
- Clic ligne → drawer JSON détails (formaté, syntax highlight) + lien vers entité
- Export CSV (bouton) → download 10 000 lignes max

#### 8.2. Automations Monitor (`/admin/automations`)

- API call : `GET /api/automations` (endpoint custom ou mock statique)
- Table automatisations :
  - Colonnes : Nom, Type, Statut (ON/OFF), Dernière exec, Prochaine exec, Succès/Échecs, Actions
- Actions :
  - ▶️ Run Now → `POST /api/automations/:id/run`
  - ⏸️ Pause → `POST /api/automations/:id/pause`
  - ⚙️ Config → modal ou page dédiée
- Détail automation (drawer) :
  - Logs dernières exécutions
  - Configuration (délais, template email, filtres)
  - Historique (succès/échecs avec timestamps)

**Durée** : 3h  
**Livrable** : Logs + Automations fonctionnels.

---

### Phase 9 : AI Mail Composer (Jour 6 — Matin, 4h)

**Objectif** : Drawer IA pour générer des emails contextualisés.

#### 9.1. Composant `AIComposer` (Drawer)

- Props : `entityType` (FOLDER, QUOTE, MOVER), `entityId`, `context` (données entité)
- Layout drawer (slide from right, overlay)
- Sections :
  1. **Contexte** (lecture seule, grisé) :
     - Si Folder : Client, Origine → Destination, Volume, Statut
     - Si Quote : Déménageur, Dossier, Prix, Statut
     - Si Mover : Déménageur, Note Google, Statut
  2. **Type d'email** (dropdown) :
     - Relance client (Top 3 prêt)
     - Demande devis déménageur
     - Relance déménageur (J+2)
     - Confirmation booking client
     - Refus déménageur (blacklisté)
     - Email personnalisé (prompt libre)
  3. **Prompt IA** (textarea) :
     - Pré-rempli selon type choisi
     - Éditable par admin
  4. **Draft généré** (textarea) :
     - Affiché après génération
     - Éditable
     - Preview markdown (si applicable)
  5. **Actions** :
     - Bouton "✨ Générer Draft" → API call `POST /api/ai/compose`
     - Bouton "🔄 Regénérer" (si draft pas satisfaisant)
     - Bouton "📧 Envoyer" (modal confirmation) → API call `POST /api/emails/send`

#### 9.2. Backend endpoint `/api/ai/compose`

- Reçoit : `entityType`, `entityId`, `emailType`, `prompt`, `context`
- Appelle OpenAI/Anthropic (GPT-4 ou Claude)
- Retourne : `draft` (string), `model` (string)
- Sauvegarde dans `AIEmailDraft` table

#### 9.3. Intégration dans pages

- Bouton "✨ AI Compose" sur :
  - Folder détail (`/admin/folders/:id`)
  - Quote détail (`/admin/quotes/:id`)
  - Mover détail (`/admin/movers/:id`)
- Clic → ouvre drawer `AIComposer` avec contexte pré-rempli

#### 9.4. Historique drafts (`/admin/ai-drafts`)

- Liste : `GET /api/ai-drafts?page=1&limit=10`
- Table avec colonnes : Entité, Type email, Validé, Envoyé, Date, Actions
- Filtres : validé (oui/non), envoyé (oui/non), type
- Clic ligne → drawer détails (prompt, draft, model, validatedBy, sentAt)

**Durée** : 4h  
**Livrable** : AI Mail Composer fonctionnel, intégré, historique drafts.

---

### Phase 10 : Polish & Responsive (Jour 6 — Après-midi, 3h)

**Objectif** : UX finale, responsive, loading/error states.

#### 10.1. Loading States

- Spinners sur boutons (pendant API call)
- Skeletons sur tables/cartes (pendant fetch)
- Loading overlay sur pages complètes

#### 10.2. Error States

- Toast notifications (success, error, warning, info)
- Fallback UI si API down (illustration + bouton retry)
- Error boundaries React (catch JS errors)

#### 10.3. Empty States

- Illustrations + message + action si table vide
- Ex : "Aucun dossier trouvé. Créer un dossier ?"

#### 10.4. Responsive Mobile

- Sidebar → drawer (hamburger menu)
- Tables → scroll horizontal ou cards empilées
- Forms → full width, inputs stacked
- Modals → full screen sur mobile

#### 10.5. Dark Mode

- Toggle dans Header (icône lune/soleil)
- Persist dans localStorage
- Appliqué sur tous les composants

#### 10.6. Animations

- Fade in sur page mount
- Slide in sur drawers/modals
- Hover scale sur cartes
- Transitions douces (200ms)

**Durée** : 3h  
**Livrable** : UX polie, responsive, loading/error/empty states.

---

### Phase 11 : Tests & Debug (Jour 7, 6h)

**Objectif** : Tester tous les flows, corriger bugs, optimiser perfs.

#### 11.1. Tests Manuels

- Flow complet : Dashboard → Folder → Quote → Validation → Payment
- Tester tous les filtres, tri, pagination
- Tester formulaires (validation, error handling)
- Tester AI Composer (génération, édition, envoi)
- Tester Status Bar (polling, drawer détails)
- Tester Logs (filtres, export CSV)
- Tester Automations (Run Now, Pause)
- Tester responsive mobile (toutes pages)
- Tester dark mode (toggle, persist)

#### 11.2. Corrections Bugs

- Fixer bugs découverts pendant tests
- Corriger validations Zod si nécessaire
- Corriger API calls si endpoints changent

#### 11.3. Optimisation Perfs

- Lazy loading composants lourds (Charts, Tables)
- Memoization (`useMemo`, `useCallback`) si re-renders inutiles
- Debounce sur filtres search
- Infinite scroll ou pagination virtuelle si tables > 1000 lignes

#### 11.4. Accessibilité

- Focus visible sur tous les boutons/links
- aria-label sur icônes
- Keyboard navigation (Tab, Enter, Escape)
- Contraste colors WCAG AA

**Durée** : 6h  
**Livrable** : Frontend stable, testé, optimisé.

---

## Critères d'Acceptation

### Must-Have (Bloquants MVP)

**Fonctionnalités** :
1. ✅ **Dashboard fonctionnel** : KPIs, alertes, timeline, graphiques avec données backend réelles
2. ✅ **Folders complet** : Liste, détail, timeline visuelle, onglets (Overview, Quotes, Timeline, Emails, Payments)
3. ✅ **Quotes complet** : Liste, détail, validation manuelle, scoring manuel, historique
4. ✅ **Movers complet** : Liste, détail, blacklist/unblacklist, sync Google, pricing grids
5. ✅ **Clients complet** : Liste, détail, anonymisation RGPD
6. ✅ **Leads complet** : Liste, conversion en folder + client
7. ✅ **Payments complet** : KPIs, liste paginée, filtres, détails Stripe
8. ✅ **Logs complet** : AuditLog paginé, filtres avancés, détails JSON, export CSV
9. ✅ **AI Mail Composer fonctionnel** : Génération drafts, édition, validation humaine, historique
10. ✅ **Status Bar opérationnelle** : DB, Workers, API externes, polling 30s, drawer détails
11. ✅ **Automations Monitor** : Liste automatisations, Run Now, Pause, détails

**Technique** :
12. ✅ **Connexion backend** : Toutes les API calls fonctionnent (34 endpoints)
13. ✅ **Pagination** : Offset-based avec React Query
14. ✅ **Filtres & tri** : Côté serveur, URL query params
15. ✅ **Loading states** : Spinners, skeletons sur tous les composants
16. ✅ **Error handling** : Toasts, fallbacks, error boundaries
17. ✅ **Empty states** : Illustrations + messages + actions si tables vides
18. ✅ **Responsive mobile** : Drawer sidebar, tables adaptées, forms full width
19. ✅ **Dark mode** : Toggle, persist localStorage, appliqué partout
20. ✅ **Animations** : Fade, slide, hover (200ms), prefers-reduced-motion

**UX** :
21. ✅ **Navigation intuitive** : Sidebar, breadcrumbs, active states
22. ✅ **Forms validation** : React Hook Form + Zod, messages erreurs
23. ✅ **Modals confirmation** : Sur actions critiques (valider, supprimer, blacklist, anonymiser)
24. ✅ **Toasts notifications** : Success, error, warning, info
25. ✅ **Keyboard navigation** : Tab, Enter, Escape fonctionnent

### Nice-to-Have (Phase 2)

**Fonctionnalités** :
- ⏳ Settings avancés (profil, templates emails, config relances)
- ⏳ Notifications push WebSocket temps réel
- ⏳ Recherche globale (Cmd+K)
- ⏳ Raccourcis clavier (Cmd+1, Cmd+2, etc.)
- ⏳ Dashboard personnalisable (widgets drag-and-drop)
- ⏳ Export avancé (PDF, Excel)
- ⏳ Webhooks admin (Slack, Discord)
- ⏳ Graphiques analytics avancés (CA par région, etc.)
- ⏳ Gestion users admin (CRUD, rôles)

**Technique** :
- ⏳ JWT Authentication complète (login, register, refresh tokens)
- ⏳ RBAC granulaire (admin, operator)
- ⏳ Tests E2E Cypress (flows complets)
- ⏳ Storybook (documentation composants)
- ⏳ i18n (internationalisation FR/EN)
- ⏳ PWA (offline support)

---

## État d'avancement

- [ ] Phase 0 : Setup (3h)
- [ ] Phase 1 : Layout & Navigation (4h)
- [ ] Phase 2 : Design System (3h)
- [ ] Phase 3 : Dashboard (4h)
- [ ] Phase 4 : Gestion Folders (6h)
- [ ] Phase 5 : Gestion Quotes (4h)
- [ ] Phase 6 : Gestion Movers (3h)
- [ ] Phase 7 : Clients, Leads, Payments (4h)
- [ ] Phase 8 : Logs & Automations (3h)
- [ ] Phase 9 : AI Mail Composer (4h)
- [ ] Phase 10 : Polish & Responsive (3h)
- [ ] Phase 11 : Tests & Debug (6h)

**Total estimé** : ~47h (6 jours de travail intensif)

**Statut** : 📝 Spécification — Prêt pour implémentation

---

## Commits liés

*(à renseigner au fur et à mesure)*

---

## Notes Futures

### Après P0-t016

**Si P0-t016 réussi** :
- **P0-t017** : JWT Authentication + RBAC (login, register, roles)
- **P0-t018** : Intégration Stripe Connect (dashboard embed, webhooks)
- **P0-t011** : Système emails & notifications (Resend, BullMQ, templates)
- **P0-t012** : Génération/parsing devis (auto-génération, OCR parsing, validation manuelle)
- **P1-tXXX** : Tests E2E Cypress (flows critiques)
- **P1-tXXX** : WebSocket temps réel (Activity Feed, notifications push)
- **P1-tXXX** : Dashboard personnalisable (widgets drag-and-drop, localStorage persist)

### Questions à Résoudre

1. **AI API** : OpenAI ou Anthropic ? Quelle clé API ? (à définir en dev)
2. **WebSocket** : Socket.io ou native WebSocket ? (Phase 2)
3. **Charts lib** : Recharts suffit ou upgrade vers Chart.js/D3 ? (Recharts OK pour MVP)
4. **Deployment** : Vercel, Netlify, ou self-hosted ? (à définir)
5. **CI/CD** : GitHub Actions pour build + deploy auto ? (Phase 2)

---

## Estimation

**Temps estimé** : 6 jours de travail intensif (47h)

**Répartition** :
- **Jour 1** : Setup (3h) + Layout & Navigation (4h) = 7h
- **Jour 2** : Design System (3h) + Dashboard (4h) = 7h
- **Jour 3** : Gestion Folders (6h) + Début Quotes (1h) = 7h
- **Jour 4** : Gestion Quotes (3h) + Gestion Movers (3h) + Début Clients (1h) = 7h
- **Jour 5** : Clients, Leads, Payments (4h) + Logs & Automations (3h) = 7h
- **Jour 6** : AI Mail Composer (4h) + Polish & Responsive (3h) = 7h
- **Jour 7** : Tests & Debug (6h) = 6h

**Bloqueurs potentiels** :
- Configuration shadcn/ui peut être complexe (customisation Apple Glass)
- React Query learning curve si pas familier
- API backend peut changer (endpoints, formats) → ajustements
- AI API (OpenAI/Anthropic) peut être lente → fallback loading states
- Recharts customisation peut prendre du temps (graphiques complexes)

---

**Ready to build the admin portal? 🚀**

