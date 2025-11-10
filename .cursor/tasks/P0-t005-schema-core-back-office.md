# P0-t005 — Schéma core Back Office

**Priorité : P0** — Sans schéma DB, aucune donnée ne peut être stockée → rien ne marche.

## Contexte

Définir le modèle de données central dans PostgreSQL pour supporter le flux Moverz :

lead → dossier → devis → top 3 → paiement → mise en relation.

## Objectifs

- [ ] Décrire les tables core :
  - `leads` : prospects issus des 11 sites locaux
  - `folders` (dossiers) : dossier déménagement complet
  - `clients` : données clients
  - `movers` (déménageurs) : entreprises partenaires
  - `pricing_grids` : grilles tarifaires (m³ + distance)
  - `quotes` (devis) : devis collectés/générés
  - `bookings` : réservations confirmées
  - `payments` : paiements et reversements
  - `users` : comptes admin/partners
  - `roles` : permissions
- [ ] Définir les relations, clés, statuts et contraintes minimales.
- [ ] Servir de référence unique pour toutes les futures migrations.

## Périmètre

- Spécification fonctionnelle/technique du schéma.
- Aucune migration SQL ou code généré dans cette task.

## Implémentation

À compléter une fois le schéma détaillé.

## État d'avancement

- [ ] Schéma rédigé et validé

**Statut : 📝 Spécification**

## Commits liés

*(à renseigner au fur et à mesure : date — sha — message)*

## Notes futures

- Créer une task dédiée pour générer les migrations à partir de ce schéma.
- Créer une task dédiée aux index/perfs/archivage.

