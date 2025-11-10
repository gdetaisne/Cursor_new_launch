# P1-t025 — Websites Dashboard : Pages Frontend

**Priorité : P1**

## Contexte

Créer les pages React pour le dashboard websites dans le Back_Office frontend.

**Objectif** : Pages atomiques (<200 lignes), TanStack Query, composants réutilisables.

## Objectifs

- [ ] Page `/admin/websites` (dashboard global 11 sites)
- [ ] Page `/admin/websites/:domain` (détail site)
- [ ] Onglets: SEO, Conversions, Web Vitals
- [ ] Navigation fluide + filtres période
- [ ] Responsive design (mobile-first)
- [ ] Loading states + error states

## Implémentation

### Structure

```
frontend/src/
├── pages/
│   └── websites/
│       ├── WebsitesDashboard.tsx      # Page globale (grid 11 sites)
│       ├── SiteDetail.tsx             # Page détail site
│       ├── SEOTab.tsx                 # Onglet SEO
│       ├── ConversionsTab.tsx         # Onglet Conversions
│       └── WebVitalsTab.tsx           # Onglet Web Vitals
├── components/
│   └── websites/
│       ├── filters/
│       │   ├── SiteSelector.tsx       # Dropdown 11 sites
│       │   ├── DateRangePicker.tsx    # Sélecteur période
│       │   └── MetricSelector.tsx     # Sélecteur métrique
│       └── cards/
│           ├── MetricCard.tsx         # Card KPI réutilisable
│           └── SiteCard.tsx           # Card site (dashboard)
└── ...
```

### Routes React Router

```typescript
// frontend/src/routes/AppRouter.tsx
import { WebsitesDashboard } from '../pages/websites/WebsitesDashboard';
import { SiteDetail } from '../pages/websites/SiteDetail';

// Dans les routes /admin
<Route path="websites" element={<WebsitesDashboard />} />
<Route path="websites/:domain" element={<SiteDetail />} />
```

### Sidebar

```typescript
// frontend/src/components/layout/Sidebar.tsx
import { Globe } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Dossiers', href: '/admin/folders', icon: FolderOpen },
  { name: 'Devis', href: '/admin/quotes', icon: FileText },
  { name: 'Déménageurs', href: '/admin/movers', icon: Truck },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Leads', href: '/admin/leads', icon: UserPlus },
  { name: 'Websites', href: '/admin/websites', icon: Globe },  // ✅ NOUVEAU
  { name: 'Paiements', href: '/admin/payments', icon: CreditCard },
  // ...
];
```

## État d'avancement

- [ ] Page WebsitesDashboard
- [ ] Page SiteDetail
- [ ] Onglets SEO/Conversions/Web Vitals
- [ ] Composants filtres
- [ ] Composants cards
- [ ] Navigation dans Sidebar
- [ ] Routes React Router
- [ ] Loading + error states

## Commits liés

_(à remplir)_

---

**Status** : ⏳ En attente
**Dépend de** : P1-t024 (API Routes), P1-t026 (Charts), P1-t027 (Hooks)

