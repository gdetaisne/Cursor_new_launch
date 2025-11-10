# P0-t009 — Cycle de vie des devis & automatisations

**Priorité : P0** — Sans collecte et scoring de devis, pas de top 3 pour le client → flux bloqué.

## Contexte

Standardiser comment les devis sont générés, collectés, suivis et utilisés
pour produire le top 3 pour le client.

## Objectifs

- [ ] Définir les statuts d'un devis (REQUESTED, RECEIVED, REMINDED, EXPIRED, etc.).
- [ ] Définir les règles d'assignation (10 déménageurs / dossier).
- [ ] Définir les règles de relance automatique (J+2, J+4).
- [ ] Définir le calcul de score global :
  - Prix (pondération)
  - Avis Google (rating + nombre)
  - Score financier (saisie manuelle admin via accès CreditSafe web, pas API)
  - Litiges/blacklist
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

