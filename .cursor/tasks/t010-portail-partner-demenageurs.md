# t010 — Portail Partner `/partner` (déménageurs)

## Contexte

Créer le portail autonome pour les déménageurs partenaires.

**Objectif** : Permettre aux déménageurs de gérer leur activité sur Moverz.

**Priorité 2** ⏸️ — Peut attendre, pas bloquant pour le MVP (gestion manuelle possible au début).

## Objectifs

- [ ] Lister les pages et vues clés pour `/partner` :
  - Saisie/modification grilles tarifaires (m³ + distance)
  - Vue demandes de devis reçues
  - Historique dossiers
  - Suivi paiements reçus
  - Profil entreprise

- [ ] Définir les rôles partner (mover_owner, mover_user si multi-utilisateurs)
- [ ] Définir la navigation et accès par rôle
- [ ] Définir structure grilles tarifaires (paliers m³ x distance)

## Périmètre

- Routes, structures pages, données affichées
- Règles d'accès et permissions
- Modèle de données grilles tarifaires
- **Aucun composant UI final** ou design détaillé ici
- **Aucune implémentation code** dans cette task

## Implémentation

À compléter : sitemap /partner, structure grilles tarifaires (JSON/DB), wireframes

## État d'avancement

- [ ] Structure rédigée et validée
- [ ] Modèle grilles tarifaires défini

**Statut : 📝 Spécification (Phase 2)**

## Commits liés

*(à renseigner)*

## Notes futures

- Task dédiée à l'implémentation concrète du layout `/partner`
- Task dédiée au formulaire saisie grilles tarifaires
- Cette task est **indépendante** du portail `/admin` (voir t006)
- Au début, saisie grilles peut se faire manuellement via admin ou SQL

