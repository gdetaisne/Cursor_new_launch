# t009 — Cycle de vie des devis & automatisations

## Contexte

Standardiser comment les devis sont générés, collectés, suivis et utilisés
pour produire le top 3 pour le client.

## Objectifs

- [ ] Définir les statuts d'un devis (REQUESTED, RECEIVED, REMINDED, EXPIRED, etc.).
- [ ] Définir les règles d'assignation (10 déménageurs / dossier).
- [ ] Définir les règles de relance automatique (J+1, J+3, J+5…).
- [ ] Définir le calcul de score global (prix + Google + financier + litiges).
- [ ] Définir comment est générée la page Top 3 côté client.

## Périmètre

- Workflows métier, statuts, règles de scoring.
- Pas de code de worker ni UI finale ici.

## Implémentation

À compléter (tableau des statuts, délais, formules).

## État d'avancement

- [ ] Workflows & scoring validés

**Statut : 📝 Spécification**

## Commits liés

*(à renseigner)*

## Notes futures

- Task pour implémenter les jobs de relance BullMQ.
- Task pour implémenter la génération de la page d'offre client.
- Task pour ajuster le scoring selon retours terrain.

