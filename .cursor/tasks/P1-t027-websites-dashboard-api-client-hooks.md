# P1-t027 — Websites Dashboard : API Client & Hooks

**Priorité : P1**

## Contexte

Créer API client Axios + React Query hooks pour dashboard websites.

## Objectifs

- [ ] API client Axios typé
- [ ] React Query hooks (useSEOMetrics, useConversionsMetrics, etc.)
- [ ] Cache automatique (TanStack Query)
- [ ] Error handling + retry logic
- [ ] Loading states

## Implémentation

### Structure

```
frontend/src/lib/
├── api/
│   └── analytics.ts              # API client Axios
├── hooks/
│   └── useAnalytics.ts           # React Query hooks
└── types/
    └── analytics.types.ts        # Types frontend (sync backend)
```

### TanStack Query déjà installé

✅ `@tanstack/react-query` déjà présent dans le projet

## État d'avancement

- [ ] API client Axios
- [ ] Hooks useSEOMetrics
- [ ] Hooks useConversionsMetrics
- [ ] Hooks useWebVitalsMetrics
- [ ] Hooks useDomainsOverview
- [ ] Types TypeScript
- [ ] Error handling
- [ ] Tests hooks

---

**Status** : ⏳ En attente
**Dépend de** : P1-t024 (API Routes)
**Prérequis pour** : P1-t025 (Pages), P1-t026 (Charts)

