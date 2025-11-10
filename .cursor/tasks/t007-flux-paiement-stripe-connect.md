# t007 — Flux de paiement & Stripe Connect

## Contexte

Formaliser le flux de paiement Moverz :
- le client paie un acompte (30 %)
- Moverz encaisse sur la plateforme
- reversement de la part déménageur
- déclenchement de la mise en relation.

## Objectifs

- [ ] Décrire précisément le parcours de paiement côté client.
- [ ] Choisir et documenter le mode Stripe Connect (destination charges / transfers).
- [ ] Définir les états `payments` et `bookings` dans la base.
- [ ] Définir la logique de webhooks et de sécurisation.

## Périmètre

- Spéc fonctionnelle + technique (états, événements).
- Pas d'appel Stripe réel ni de code d'intégration dans cette task.

## Implémentation

À compléter une fois les décisions prises (diagramme événements conseillé).

## État d'avancement

- [ ] Flux et états validés

**Statut : 📝 Spécification**

## Commits liés

*(à renseigner)*

## Notes futures

- Task dédiée à l'implémentation technique Stripe (SDK, webhooks).
- Task dédiée aux tests end-to-end paiements.

