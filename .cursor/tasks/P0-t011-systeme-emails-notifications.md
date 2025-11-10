# P0-t011 — Système emails & notifications

**Priorité : P0** — Sans emails automatisés, pas de relances déménageurs ni notifications client → flux bloqué.

## Contexte

Mettre en place le système d'emails automatisés et manuels pour orchestrer :
- Relances déménageurs (demandes de devis)
- Notifications clients (devis prêts, confirmation booking)
- Validation admin obligatoire avant envoi client

**Approche progressive** : automatisation partielle au début, validation manuelle systématique, automatisation complète ensuite.

## Objectifs

### A. Types d'emails

- [ ] **Relances déménageurs** (automatiques)
  - J+2 après envoi demande devis
  - J+4 si toujours pas de réponse
  - Configurable via interface admin

- [ ] **Notifications clients** (validation admin obligatoire)
  - Déclencheur : 5 jours OU 3 devis reçus (le premier qui arrive)
  - Email "Vos devis sont prêts" avec lien vers Top 3
  - Admin doit valider AVANT envoi

- [ ] **Emails transactionnels** (automatiques)
  - Confirmation paiement acompte
  - Mise en relation (contacts déménageur)
  - Rappels (J-1 prestation, etc.)

### B. Interface Admin

- [ ] **Dashboard emails**
  - Liste emails en attente de validation
  - Prévisualisation avant envoi
  - Logs tous emails envoyés (statut, date, destinataire)
  - Alertes si problèmes d'envoi

- [ ] **Configuration relances**
  - Modifier délais (J+2, J+4 → personnalisable)
  - Éditer templates (objet, corps)
  - Activer/désactiver relances par type

### C. Infrastructure technique

- [ ] Choisir provider email (recommandation : **Resend**)
  - API moderne et simple
  - Templates React en code
  - Logs/analytics intégrés
  - Gratuit jusqu'à 3000 emails/mois
  - RGPD friendly

- [ ] Alternative : Postmark (excellent deliverability) ou SendGrid/AWS SES (gros volume)

- [ ] **Gestion templates**
  - Stockage : fichiers React (avec Resend) ou DB
  - Variables dynamiques : {client_name}, {dossier_id}, {devis_count}
  - Preview mode pour tests

- [ ] **Queue système** (BullMQ recommandé)
  - Jobs asynchrones pour envois
  - Retry automatique si échec
  - Logs détaillés par job

### D. États et workflows

- [ ] **Table `email_logs`**
  - id, type, recipient, subject, status, sent_at, opened_at, clicked_at
  - Relation dossier_id, user_id
  - Statuts : PENDING, SENT, DELIVERED, BOUNCED, FAILED

- [ ] **Table `email_templates`** (optionnel si templates en code)
  - id, name, type, subject, body_html, variables, active

- [ ] **Workflow relances**
  ```
  Devis REQUEST → Attente J+2 → Email relance 1 → Attente J+2 → Email relance 2 → EXPIRED
  ```

- [ ] **Workflow notifications client**
  ```
  Devis collectés → Trigger (5j OU 3 devis) → Admin validation → Email Top 3
  ```

## Périmètre

- Spécification technique complète du système emails
- Choix infrastructure (provider, queue, templates)
- Modèle données (email_logs, workflows)
- **Aucune implémentation code** dans cette task

**Hors scope** :
- Invitations déménageurs (voir P1-t008, phase 2)
- SMS (future extension)

## Implémentation

À compléter :
1. Schéma détaillé `email_logs` et `email_templates`
2. Diagrammes workflows (relances, notifications)
3. Liste exhaustive variables templates
4. Mockups interface admin validation emails
5. Décision finale provider (deepsearch si besoin)

## État d'avancement

- [ ] Types d'emails listés et validés
- [ ] Interface admin spécifiée
- [ ] Infrastructure technique choisie
- [ ] Modèle données défini
- [ ] Workflows documentés

**Statut : 📝 Spécification**

## Commits liés

*(à renseigner)*

## Notes futures

- Task dédiée à l'implémentation provider email (SDK, webhooks)
- Task dédiée à l'implémentation BullMQ jobs
- Task dédiée aux templates React/HTML
- Task dédiée à l'interface admin validation
- Prévoir A/B testing des emails (phase 2)
- Prévoir analytics détaillées (taux ouverture, clics)

