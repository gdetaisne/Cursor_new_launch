# t002 — Documentation du contexte business Moverz

## Contexte

Le projet Back Office Moverz nécessite une documentation complète du contexte métier pour que toute l'équipe (dev, product, business) comprenne :
- La vision et le modèle économique
- Les parcours utilisateurs (clients et déménageurs)
- Le rôle central du back office
- Les objectifs long terme

Cette documentation servira de référence pour toutes les décisions techniques et fonctionnelles futures.

## Objectifs

1. Documenter la vision business complète de Moverz
2. Décrire les parcours client et déménageur
3. Expliquer le modèle économique et les revenus
4. Clarifier le rôle du back office dans l'écosystème
5. Établir la vision long terme

## Périmètre

### Fichiers créés
- `/docs/CONTEXT.md` : documentation complète du contexte business Moverz

### Contenu du document
- Finalité business (vision, piliers)
- Parcours client (7 étapes)
- Parcours déménageur (4 étapes)
- Modèle économique (revenus, coûts)
- Rôle du back office
- Vision long terme
- Historique des mises à jour

### Hors périmètre
- Implémentation technique
- Spécifications fonctionnelles détaillées (feront l'objet de tasks dédiées)

## Implémentation

### Document créé : CONTEXT.md

**Section 1 : Finalité business**
- Vision : réinventer le déménagement grâce à l'IA
- 3 piliers : Simplicité, Transparence, Confiance
- Moverz = tiers de confiance digital

**Section 2 : Parcours client (particulier)**
1. Arrivée sur site local (ex: bordeaux-demenageur.fr)
2. Estimation rapide ou Inventaire IA
3. Création automatique dossier déménagement
4. Collecte devis automatisée (10 déménageurs)
5. Consolidation offres + scoring
6. Présentation top 3
7. Paiement acompte 30% + mise en relation

**Section 3 : Parcours déménageur (pro)**
1. Référencement automatique (Google Places API)
2. Création compte `/partner`
3. Réception dossiers
4. Paiement & facturation

**Section 4 : Modèle économique**
- Revenus : Commission acompte (5-15%), Abonnements premium, Leads B2B
- Coûts : API externes, hébergement, emails
- Scalabilité : coût marginal quasi nul

**Section 5 : Rôle back office**
- Cœur opérationnel
- Centralisation dossiers
- Orchestration automatisations
- Contrôle paiements
- Source unique de vérité

**Section 6 : Vision long terme**
- Booking.com du déménagement
- Standardisation B2B
- Expansion internationale

## État d'avancement

- [x] Rédaction complète du document CONTEXT.md
- [x] Structure en 7 sections
- [x] Historique de mise à jour initialisé
- [x] Fichier créé dans /docs
- [x] Task t002 créée
- [x] Journal commits initialisé

**Statut : ✅ Terminé**

## Commits liés

- (à venir) `t002: Add business context documentation`

## Notes futures

Ce document CONTEXT.md doit être :
- Mis à jour à chaque évolution stratégique majeure
- Consulté avant toute task fonctionnelle
- Référencé dans les décisions d'architecture

Toute modification doit :
1. Créer ou référencer une task
2. Mettre à jour l'historique en bas du document
3. Être validée par l'équipe product/business

