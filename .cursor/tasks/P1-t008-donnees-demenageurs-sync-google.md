# P1-t008 — Données déménageurs & sync Google

**Priorité : P1** — Nice to have qui deviendra P0. Sync auto pas bloquant MVP (peut être manuel au début).

## Contexte

Assurer que la liste des déménageurs et leurs notes Google soient
gérées proprement, mises à jour automatiquement, et utilisées pour :
- filtrer les partenaires
- déclencher des invitations automatiques.

## Objectifs

- [ ] Définir le modèle `mover` (dont `google_place_id`, rating, reviews_count).
- [ ] Définir la logique de découverte (Google Places) et de mise à jour régulière.
- [ ] Définir les critères de ciblage pour les emails automatiques (ex : >10 avis).
- [ ] Documenter les contraintes légales/API minimales.

## Périmètre

- Spéc des champs + workflows (sync, invitation).
- Pas de code d'appel API Google dans cette task.

## Implémentation

À compléter (fréquence sync, gestion quotas, logs).

## État d'avancement

- [ ] Modèle & workflows validés

**Statut : 📝 Spécification**

## Commits liés

*(à renseigner)*

## Notes futures

- Task pour implémentation des jobs BullMQ de sync Google.
- Task pour les templates emails d'invitation déménageurs.

