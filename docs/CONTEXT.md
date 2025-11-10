# CONTEXT — Vision & Modèle économique Moverz

## 1. Finalité business

Moverz réinvente le déménagement grâce à l'IA.

Objectif : **simplifier, automatiser et fiabiliser** la mise en relation entre particuliers et déménageurs professionnels.  
L'expérience utilisateur repose sur trois piliers :

1. **Simplicité** : envoi de quelques photos ou réponses rapides → estimation automatique.
2. **Transparence** : comparaison claire des meilleurs devis, fondée sur des données réelles.
3. **Confiance** : sélection d'entreprises fiables selon leurs avis publics et leur solidité financière.

Moverz agit comme **tiers de confiance digital** entre clients et déménageurs.

---

## 2. Parcours client (particulier)

1. **Arrivée sur un site Moverz local**
   - Ex : bordeaux-demenageur.fr
   - Découvre deux options :  
     a. *Estimation rapide* (formulaire simplifié)  
     b. *Inventaire IA* (analyse photo)

2. **Création automatique d'un dossier déménagement**
   - Données collectées : volume estimé, distance, options, dates, coordonnées.
   - Le dossier devient l'unité de référence pour tout le flux back-office.

3. **Collecte de devis (automatisée)**
   - Envoi automatique de 10 demandes de devis aux déménageurs pertinents.
   - Pour ceux avec grilles tarifaires → génération automatique du prix.
   - Pour les autres → parsing des réponses email.

4. **Consolidation des offres**
   - Agrégation des prix, disponibilités, avis Google, scores financiers (CreditSafe).
   - Calcul d'un *score global*.

5. **Présentation des 3 meilleures offres**
   - Interface claire, prix + réputation + garanties.
   - Le client choisit son déménageur.

6. **Paiement de l'acompte (30%)**
   - Transaction sécurisée via Stripe Connect.
   - Le client paie 30% d'acompte du montant total du déménagement.
   - Moverz prélève sa commission (5-15% de l'acompte), reverse le reste au déménageur.

7. **Mise en relation automatique**
   - Contact complet échangé uniquement après paiement.
   - Dossier marqué comme *confirmé* dans le back office.

---

## 3. Parcours déménageur (pro)

1. **Référencement**
   - Découvert automatiquement via Google Places API.
   - Si `>10 avis` et `note >= 4.0` → email automatique d'invitation à rejoindre Moverz.

2. **Création de compte**
   - Accès à son espace `/partner`.
   - Peut y :
     - Gérer sa grille tarifaire.
     - Consulter ses demandes.
     - Répondre à des devis.
     - Suivre paiements et historiques.

3. **Réception de dossiers**
   - Les dossiers sont attribués automatiquement selon zone, volume, et disponibilité.
   - Peut accepter/refuser, ou laisser Moverz calculer automatiquement.

4. **Paiement & facturation**
   - Reçoit la part correspondante à l'acompte après confirmation.
   - Les 70% restants sont payés directement par le client hors plateforme (ou via future extension).

---

## 4. Modèle économique Moverz

### Revenus

1. **Commission sur acompte client**  
   - 30% d'acompte payé sur la plateforme.  
   - Moverz prélève une **commission fixe ou variable** (5–15%) avant reversement au déménageur.

2. **Abonnements déménageurs (phase 2)**
   - Accès premium : visibilité accrue, alertes instantanées, data insights.

3. **Leads B2B / agences**
   - Revente de dossiers qualifiés à d'autres partenaires logistiques ou d'assurance.

---

### Coûts & scalabilité

- Coût marginal quasi nul (automatisation totale du back office).
- Les principaux coûts sont :
  - API externes (Google, CreditSafe, Stripe)
  - Hébergement / stockage
  - Relances email automatisées

---

## 5. Rôle du back office

Le back office est le **cœur opérationnel** :
- centralise tous les dossiers,
- orchestre les automatisations (devis, relances, sync Google),
- contrôle les paiements,
- fournit une interface simple à l'équipe et aux déménageurs.

Aucun outil tiers (CRM, tableur, Airtable) ne doit dupliquer ses fonctions.

---

## 6. Vision long terme

- Devenir **le Booking.com du déménagement**, avec un score IA combinant prix, réputation et fiabilité.
- Standardiser les échanges B2B : inventaires, devis, contrats, paiements.
- S'étendre à l'international avec la même logique (marchés francophones d'abord).

---

## 7. Historique des mises à jour

| Date | Task | Changement | Auteur |
|-------|------|-------------|---------|
| 2025-11-10 | P0-t002 | Création initiale du contexte business | gdetaisne |
| 2025-11-10 | Deepsearch | Clarification modèle paiement (commission 5-15%) | Cursor |

