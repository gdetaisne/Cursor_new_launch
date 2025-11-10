# P1-t026 — Websites Dashboard : Composants Charts

**Priorité : P1**

## Contexte

Créer composants charts réutilisables (Recharts) pour dashboard websites.

## Objectifs

- [ ] SEOChart (line chart impressions/clics)
- [ ] ConversionsFunnelChart (funnel chart)
- [ ] WebVitalsGauge (gauge LCP/CLS/INP)
- [ ] ComparisonChart (comparaison multi-sites)
- [ ] Design system cohérent
- [ ] Responsive + dark mode ready

## Implémentation

### Structure

```
frontend/src/components/websites/charts/
├── SEOChart.tsx
├── ConversionsFunnelChart.tsx
├── WebVitalsGauge.tsx
├── ComparisonChart.tsx
└── BaseChart.tsx  # Wrapper Recharts avec config commune
```

### Recharts déjà installé

✅ Recharts est déjà présent dans le projet (`package.json`)

## État d'avancement

- [ ] SEOChart
- [ ] ConversionsFunnelChart
- [ ] WebVitalsGauge
- [ ] ComparisonChart
- [ ] BaseChart wrapper
- [ ] Responsive
- [ ] Dark mode

---

**Status** : ⏳ En attente
**Dépend de** : P1-t027 (Hooks pour données)
**Prérequis pour** : P1-t025 (Pages Frontend)

