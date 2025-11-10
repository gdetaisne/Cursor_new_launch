# P0-t006 — Portail Admin `/admin` (équipe Moverz)

**Priorité : P0** — Sans ce portail, l'équipe ne peut pas opérer.

## Contexte

Créer le back-office interne pour l'équipe Moverz.

**Objectif** : Superviser et valider TOUT ce qui se passe sur la plateforme.

**Priorité 1** ✅ — Sans ce portail, l'équipe ne peut pas opérer.

## Objectifs

- [ ] Lister les pages et vues clés pour `/admin` :
  - Dashboard monitoring (dossiers, devis, paiements, emails)
  - Vue flux financiers (commissions, reversements)
  - Validation manuelle notifications clients (avant envoi)
  - Configuration relances (délais J+2, J+4, contenus emails)
  - Détection problèmes/alertes
  - Timeline/statuts par dossier

- [ ] Définir les rôles admin (admin, operator si besoin)
- [ ] Définir la navigation et accès par rôle
- [ ] Prioriser les vues (MVP vs Nice-to-have)

## Périmètre

- Routes, structures pages, données affichées
- Règles d'accès et permissions
- **Aucun composant UI final** ou design détaillé ici
- **Aucune implémentation code** dans cette task

## Implémentation

### Sitemap `/admin`

```
/admin
├── /dashboard                 # Vue d'ensemble (stats, alertes)
├── /folders                   # Gestion dossiers
│   ├── /folders/:id           # Détail dossier + timeline
│   └── /folders/:id/quotes    # Devis du dossier
├── /quotes                    # Gestion devis
│   └── /quotes/:id            # Détail devis + validation
├── /movers                    # Gestion déménageurs
│   └── /movers/:id            # Détail déménageur + blacklist
├── /clients                   # Gestion clients
│   └── /clients/:id           # Détail client + RGPD
├── /leads                     # Gestion leads
│   └── /leads/:id/convert     # Conversion lead → folder
├── /payments                  # Flux financiers
├── /emails                    # Historique emails + validation
│   └── /emails/config         # Configuration relances
├── /automations               # Monitor automatisations
├── /logs                      # Audit logs (tout événement)
└── /settings                  # Configuration globale
```

---

### Vues MVP (Priorité P0)

#### 1. Dashboard (`/admin/dashboard`)

**Objectif** : Vue d'ensemble temps réel de l'activité plateforme.

**Contenu** :
- **KPIs** :
  - Dossiers actifs / Total dossiers
  - Devis en attente validation / Total devis
  - Paiements du jour / du mois
  - Taux conversion leads → dossiers
- **Alertes** :
  - Devis non reçus après J+4
  - Paiements échoués
  - Erreurs API (Google, Stripe, CreditSafe)
  - Déménageurs non répondants
- **Timeline récente** : 20 derniers événements (création dossier, devis reçu, paiement, email envoyé)
- **Graphiques** :
  - Volume de dossiers par semaine (bar chart)
  - Répartition statuts dossiers (pie chart)
  - CA journalier (line chart)

**Actions** :
- Cliquer sur une alerte → redirection vers l'entité concernée
- Filtrer timeline par type d'événement
- Exporter stats CSV

---

#### 2. Gestion Dossiers (`/admin/folders`)

**Objectif** : Liste et supervision de tous les dossiers clients.

**Contenu** :
- **Table paginée** (10/25/50 par page) :
  - Colonnes : ID, Client, Origine → Destination, Volume, Distance, Statut, Date création, Actions
  - Tri : par date, statut, volume
  - Filtres : statut (NEW, QUOTES_REQUESTED, TOP3_SENT, etc.), date range, client
- **Badges colorés** pour statuts :
  - 🟢 NEW : vert
  - 🟡 QUOTES_REQUESTED : jaune
  - 🟠 TOP3_SENT : orange
  - 🔵 QUOTE_SELECTED : bleu
  - ✅ BOOKING_CONFIRMED : vert foncé
- **Actions rapides** :
  - 👁️ Voir détail
  - ✏️ Modifier
  - 📧 Envoyer notification client
  - 🗑️ Soft delete

**Détail Dossier** (`/admin/folders/:id`) :
- **Onglets** :
  - **Overview** : Infos client, adresses, volume, distance, dates
  - **Quotes** : Liste des devis avec scores, validation, top 3
  - **Timeline** : Historique complet des statuts et actions
  - **Emails** : Historique des emails envoyés/reçus
  - **Payments** : Si booking confirmé, détails paiements
- **Timeline visuelle** :
  - Format vertical avec timestamps
  - Icônes par type d'événement (📬 lead créé, 📧 email envoyé, ✅ devis validé, 💳 paiement)
  - Afficher acteur (système, admin, opérateur)
  - Lien vers `AuditLog` pour détails JSON

---

#### 3. Gestion Devis (`/admin/quotes`)

**Objectif** : Valider, scorer et superviser tous les devis.

**Contenu** :
- **Table paginée** :
  - Colonnes : ID, Dossier, Déménageur, Prix total, Acompte, Statut, Score total, Date création, Actions
  - Filtres : statut (REQUESTED, RECEIVED, VALIDATED, etc.), déménageur, dossier, date range
  - Tri : par score, prix, date
- **Badges statuts** :
  - 🟡 REQUESTED : en attente
  - 🔵 RECEIVED : reçu, à valider
  - ✅ VALIDATED : validé admin
  - ⏰ REMINDED : relancé
  - ❌ EXPIRED : expiré
- **Actions rapides** :
  - ✅ Valider (si RECEIVED)
  - 🏆 Scorer manuellement
  - 📧 Relancer déménageur
  - 📄 Télécharger PDF

**Détail Devis** (`/admin/quotes/:id`) :
- **Infos dévis** : Prix, acompte, validité, PDF, notes
- **Déménageur** : Nom, SIRET, email, notes Google, CreditSafe
- **Scoring détaillé** :
  - 💰 Score Prix : 0-100
  - ⭐ Score Google : 0-100
  - 🏦 Score Financier : 0-100 (CreditSafe)
  - ⚖️ Score Litiges : 0-100
  - **Score Total** : moyenne pondérée
- **Validation manuelle** :
  - Bouton "Valider ce devis" (admin/operator uniquement)
  - Champ notes admin (visible en interne)
  - Confirmation avant validation
- **Historique** : Timeline des actions sur ce devis

---

#### 4. Gestion Déménageurs (`/admin/movers`)

**Objectif** : Superviser les déménageurs référencés, blacklist, sync Google.

**Contenu** :
- **Table paginée** :
  - Colonnes : Nom entreprise, SIRET, Email, Ville, Note Google, Avis, Statut, Actions
  - Filtres : statut (ACTIVE, BLACKLISTED), ville, note Google (>4.0, etc.)
  - Tri : par note, nombre d'avis, date création
- **Badges statuts** :
  - 🟢 ACTIVE : actif
  - 🔴 BLACKLISTED : blacklisté
- **Actions rapides** :
  - 👁️ Voir détail
  - ✏️ Modifier
  - 🚫 Blacklist / Unblacklist
  - 🔄 Sync Google (forcer refresh)

**Détail Déménageur** (`/admin/movers/:id`) :
- **Onglets** :
  - **Overview** : Infos entreprise, SIRET, adresse, contact
  - **Google Data** : Note, nombre d'avis, lien Google Maps, dernier sync
  - **CreditSafe** : Score financier, notes admin, dernière màj
  - **Pricing Grids** : Grilles tarifaires par zone
  - **Quotes** : Liste des devis envoyés par ce déménageur
  - **Blacklist** : Raison blacklist, date, historique
- **Actions** :
  - Modifier infos
  - Blacklist (popup raison)
  - Forcer sync Google
  - Ajouter/modifier grille tarifaire

---

#### 5. Gestion Clients (`/admin/clients`)

**Objectif** : Liste clients, anonymisation RGPD.

**Contenu** :
- **Table paginée** :
  - Colonnes : Email, Nom, Prénom, Téléphone, Dossiers, Date création, Actions
  - Filtres : anonymisé (oui/non), date inscription
  - Tri : par date, nombre de dossiers
- **Actions rapides** :
  - 👁️ Voir détail
  - ✏️ Modifier
  - 🔒 Anonymiser (RGPD)

**Détail Client** (`/admin/clients/:id`) :
- **Infos client** : Email, téléphone, nom, prénom, date création
- **Dossiers** : Liste des dossiers de ce client (avec statuts)
- **Anonymisation RGPD** :
  - Bouton "Anonymiser ce client"
  - Popup confirmation avec raison (demande client, inactivité, etc.)
  - Action irréversible, masque email/phone/nom

---

#### 6. Gestion Leads (`/admin/leads`)

**Objectif** : Convertir leads en dossiers + clients.

**Contenu** :
- **Table paginée** :
  - Colonnes : Source, Email, Nom, Origine → Destination, Volume estimé, Statut, Date, Actions
  - Filtres : statut (NEW, CONTACTED, CONVERTED), source, date range
  - Tri : par date, source
- **Badges statuts** :
  - 🆕 NEW : nouveau
  - 📞 CONTACTED : contacté
  - ✅ CONVERTED : converti
- **Actions rapides** :
  - 👁️ Voir détail
  - ✅ Convertir en dossier

**Conversion Lead** (`/admin/leads/:id/convert`) :
- **Formulaire** :
  - Volume ajusté (si estimation IA imprécise)
  - Date déménagement ajustée
  - Notes admin
- **Actions** :
  - Créer client (ou associer à client existant par email)
  - Créer dossier lié
  - Marquer lead comme CONVERTED

---

#### 7. Flux Financiers (`/admin/payments`)

**Objectif** : Superviser paiements, commissions, reversements.

**Contenu** :
- **Table paginée** :
  - Colonnes : Booking, Client, Déménageur, Type (DEPOSIT/REMAINING/REFUND), Montant, Commission, Montant déménageur, Statut, Date, Actions
  - Filtres : statut (PENDING, SUCCEEDED, FAILED, REFUNDED), type, date range
  - Tri : par date, montant
- **Badges statuts** :
  - 🟡 PENDING : en attente
  - ✅ SUCCEEDED : réussi
  - ❌ FAILED : échoué
  - 🔄 REFUNDED : remboursé
- **KPIs en haut** :
  - CA du jour / du mois
  - Commissions perçues
  - Reversements aux déménageurs
  - Paiements en attente
- **Actions** :
  - 👁️ Voir détail Stripe
  - 🔄 Tenter nouveau paiement (si FAILED)
  - 💸 Initier remboursement

---

### 8. Observabilité & Aucune Action Cachée

**Principe** : Aucune action système, humaine ou IA ne doit être invisible.

#### 8.1. Status Bar Globale

**Emplacement** : Top bar fixe en haut de toutes les pages `/admin`.

**Contenu** :
- **État DB** : 🟢 Connected / 🔴 Disconnected
- **Workers BullMQ** : 🟢 Active (3/3) / 🟡 Degraded (2/3) / 🔴 Down
- **API Externes** :
  - Google Places : 🟢 OK / 🔴 Error
  - Stripe : 🟢 OK / 🔴 Error
  - CreditSafe : 🟢 OK / 🔴 Error (si implémenté)
- **Erreurs temps réel** : Compteur des erreurs 500 dans les 5 dernières minutes
- **Clic sur un badge** → ouvre drawer avec détails (dernière erreur, logs, actions possibles)

---

#### 8.2. Activity Feed (`/admin/dashboard` + widget latéral)

**Objectif** : Timeline unifiée de TOUS les événements plateforme.

**Contenu** :
- **Stream en temps réel** (WebSocket ou polling 10s) :
  - 📬 Lead créé (source, email)
  - 📂 Dossier créé (client, origine → destination)
  - 📧 Email envoyé (type, destinataire, statut)
  - 📨 Devis reçu (déménageur, dossier, prix)
  - ✅ Devis validé (admin, dossier)
  - 💳 Paiement (booking, montant, statut)
  - 🤖 IA utilisée (type: estimation volume, parsing devis, suggestion email)
  - 🚫 Déménageur blacklisté (raison)
  - 🔄 Sync Google (déménageurs mis à jour)
  - ❌ Erreur API (service, message)
- **Affichage** :
  - Icône + message + timestamp + acteur (système, admin X, opérateur Y)
  - Clic sur événement → détails JSON (drawer)
  - Filtres : type d'événement, acteur, date
- **Export** : CSV des événements filtrés

**Règle** : Chaque événement correspond à une entrée `AuditLog` en base.

---

#### 8.3. Automations Monitor (`/admin/automations`)

**Objectif** : Liste de TOUTES les automatisations actives, état ON/OFF, supervision.

**Contenu** :
- **Table des automatisations** :
  - Nom : Relance déménageurs J+2
  - Type : Email automatique
  - Statut : 🟢 ON / 🔴 OFF
  - Dernière exécution : timestamp
  - Prochaine exécution : timestamp (si cron)
  - Succès / Échecs : compteurs
  - Actions : ▶️ Run Now | ⏸️ Pause | ⚙️ Config
- **Automatisations couvertes** :
  - Relance déménageurs (J+2, J+4)
  - Relance clients (après Top 3 envoyé)
  - Sync Google Places (quotidien)
  - Sync CreditSafe (hebdomadaire)
  - Génération devis automatique (si grille tarifaire)
  - Parsing emails devis
  - Calcul scoring (si nouveau devis reçu)
- **Détail d'une automation** :
  - Dernières exécutions (logs)
  - Configuration (délais, template email, filtres)
  - Historique des runs (succès/échecs)
  - Bouton "Run Now" (force exécution immédiate)

**Règle** : Toute exécution d'automation écrit dans `AuditLog` (actorType: SYSTEM).

---

### 9. Historique Global & Logs

#### 9.1. Table `AuditLog` (Prisma Schema)

**Ajout au schéma** :

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  
  // Acteur (qui a fait l'action)
  actorType   ActorType  // SYSTEM, USER, AI
  actorId     String?    // userId si USER, null si SYSTEM/AI
  
  // Entité affectée
  entityType  EntityType // FOLDER, QUOTE, MOVER, CLIENT, LEAD, BOOKING, PAYMENT, EMAIL
  entityId    String     // UUID de l'entité
  
  // Action
  action      String     // created, updated, deleted, validated, sent, failed, etc.
  details     Json?      // Détails JSON (avant/après, erreur, payload)
  
  // Statut
  status      LogStatus  @default(SUCCESS) // SUCCESS, FAILED, PENDING
  
  // Contexte
  timestamp   DateTime   @default(now())
  ip          String?    // IP de l'acteur (si USER)
  userAgent   String?    // User agent (si USER)
  
  @@index([entityType, entityId])
  @@index([actorType, actorId])
  @@index([timestamp])
  @@index([status])
}

enum ActorType {
  SYSTEM    // Worker, cron, automation
  USER      // Admin, operator
  AI        // IA assistant (email composer, estimation, parsing)
}

enum EntityType {
  FOLDER
  QUOTE
  MOVER
  CLIENT
  LEAD
  BOOKING
  PAYMENT
  EMAIL
  USER
  AUTOMATION
}

enum LogStatus {
  SUCCESS
  FAILED
  PENDING
}
```

---

#### 9.2. Vue `/admin/logs`

**Objectif** : Timeline complète paginée de tous les événements.

**Contenu** :
- **Table paginée** (50/100/200 par page) :
  - Colonnes : Timestamp, Acteur, Entité, Action, Statut, Détails, Actions
  - Filtres :
    - Type d'acteur (SYSTEM, USER, AI)
    - Entité (FOLDER, QUOTE, MOVER, etc.)
    - Action (created, updated, validated, sent, etc.)
    - Statut (SUCCESS, FAILED, PENDING)
    - Date range (picker)
    - Acteur spécifique (dropdown users)
  - Tri : par timestamp (desc par défaut)
- **Badges statuts colorés** :
  - ✅ SUCCESS : vert
  - ❌ FAILED : rouge
  - 🟡 PENDING : jaune
- **Détails JSON** :
  - Clic sur ligne → drawer latéral
  - Affichage formaté du JSON `details`
  - Lien vers l'entité concernée (ex: lien vers `/admin/folders/:id`)
- **Export** :
  - Bouton "Export CSV" (avec filtres appliqués)
  - Limite 10 000 lignes par export

---

#### 9.3. Politique de Rétention

**Durée** :
- **24 mois minimum** de rétention en base
- **Compression** : Logs > 6 mois → compressés (partition Postgres ou table séparée)
- **Backup** : Backup quotidien vers MinIO / S3 / Postgres backup

**Rotation** :
- Après 24 mois : archivage hors DB (S3 cold storage)
- Possibilité de restaurer si besoin (RGPD, litige, audit)

**Règle absolue** :
> **"Si une action n'apparaît pas dans `AuditLog`, c'est qu'elle n'a jamais eu lieu."**

---

#### 9.4. Intégration dans le Code

**Principe** : Chaque action critique doit écrire dans `AuditLog`.

**Exemples d'intégration** :
- **Création dossier** :
  ```typescript
  await prisma.auditLog.create({
    data: {
      actorType: 'USER',
      actorId: req.userId,
      entityType: 'FOLDER',
      entityId: folder.id,
      action: 'created',
      details: { folderData: folder },
      status: 'SUCCESS',
      ip: req.ip,
    },
  });
  ```

- **Relance automatique** :
  ```typescript
  await prisma.auditLog.create({
    data: {
      actorType: 'SYSTEM',
      actorId: null,
      entityType: 'QUOTE',
      entityId: quote.id,
      action: 'reminder_sent',
      details: { emailType: 'REMINDER_2', recipient: mover.email },
      status: 'SUCCESS',
    },
  });
  ```

- **IA utilisée** :
  ```typescript
  await prisma.auditLog.create({
    data: {
      actorType: 'AI',
      actorId: null,
      entityType: 'EMAIL',
      entityId: email.id,
      action: 'draft_generated',
      details: { prompt, draft, model: 'gpt-4' },
      status: 'SUCCESS',
    },
  });
  ```

---

### 10. AI Mail Composer (Assistance IA)

**Objectif** : Aider les admins à rédiger des emails contextualisés, mais **jamais envoyer automatiquement**.

#### 10.1. Disponibilité

**Où ?**
- **Détail Folder** (`/admin/folders/:id`) : Email client
- **Détail Quote** (`/admin/quotes/:id`) : Email déménageur (relance, confirmation)
- **Détail Mover** (`/admin/movers/:id`) : Email déménageur (invitation, notification)

**Trigger** :
- Bouton "✨ AI Compose" à côté du champ email
- Ouvre un drawer latéral `AIComposer`

---

#### 10.2. Interface `AIComposer`

**Contenu du drawer** :

1. **Contexte auto-rempli** (lecture seule, grisé) :
   - **Si Folder** :
     - Client : Jean Dupont (jean@example.com)
     - Déménagement : Bordeaux → Paris
     - Volume : 25 m³
     - Statut : QUOTES_REQUESTED
   - **Si Quote** :
     - Déménageur : Déménagements Pro (contact@demenpro.fr)
     - Dossier : Bordeaux → Paris (25 m³)
     - Devis : 1500€ (statut REQUESTED)
   - **Si Mover** :
     - Déménageur : TransportExpress (info@transportexpress.fr)
     - Note Google : 4.5/5
     - Statut : ACTIVE

2. **Type d'email** (dropdown) :
   - Relance client (Top 3 prêt)
   - Demande devis déménageur
   - Relance déménageur (J+2)
   - Confirmation booking client
   - Refus déménageur (blacklisté)
   - Email personnalisé (prompt libre)

3. **Prompt IA** (textarea) :
   - Pré-rempli selon le type choisi
   - Éditable par l'admin (ajout de détails spécifiques)
   - Exemple : "Rédige un email de relance professionnel et cordial pour demander un devis à ce déménageur."

4. **Génération** :
   - Bouton "✨ Générer Draft"
   - Appel API OpenAI/Anthropic (GPT-4 ou Claude)
   - Affichage du draft généré (markdown ou plaintext)

5. **Édition Draft** :
   - Textarea éditable (admin peut corriger, ajuster ton, ajouter/supprimer)
   - Preview en temps réel (si markdown)
   - Bouton "🔄 Regénérer" (si draft pas satisfaisant)

6. **Validation & Envoi** :
   - Bouton "📧 Envoyer" (uniquement si admin valide)
   - Popup confirmation :
     - "Envoyer cet email à jean@example.com ?"
     - "Sujet : Top 3 devis prêts pour votre déménagement"
     - Checkbox "Sauvegarder ce draft comme template"
   - **L'IA ne déclenche JAMAIS l'envoi seule**

---

#### 10.3. Historique IA Versionné

**Table `AIEmailDraft`** :

```prisma
model AIEmailDraft {
  id          String   @id @default(uuid())
  
  // Entité concernée
  entityType  EntityType // FOLDER, QUOTE, MOVER
  entityId    String
  
  // Contexte IA
  emailType   String     // relance_client, demande_devis, etc.
  prompt      String     @db.Text
  draftContent String    @db.Text
  model       String     // gpt-4, claude-3, etc.
  
  // Validation humaine
  validatedBy String?    // userId
  validatedAt DateTime?
  sentAt      DateTime?
  
  // Métadonnées
  createdAt   DateTime   @default(now())
  
  @@index([entityType, entityId])
  @@index([validatedBy])
}
```

**Fonctionnalités** :
- Vue `/admin/ai-drafts` : Liste tous les drafts générés
- Filtres : validé/non validé, envoyé/non envoyé, type
- Traçabilité : qui a accepté quel draft et quand
- Export CSV pour analyse

---

#### 10.4. Règles d'Utilisation IA

**Ce que l'IA fait** :
- ✅ Génère des drafts d'emails contextualisés
- ✅ Propose plusieurs variantes (si demandé)
- ✅ Adapte le ton (formel, cordial, urgent)
- ✅ Inclut les données du contexte (nom, adresses, prix)

**Ce que l'IA ne fait PAS** :
- ❌ Envoyer des emails automatiquement
- ❌ Prendre des décisions métier (valider un devis, blacklister)
- ❌ Accéder aux données sensibles non nécessaires (mots de passe, paiements)
- ❌ Modifier des données en base

**Responsabilité humaine** :
- L'admin **valide toujours** avant envoi
- L'admin **édite** le draft si nécessaire
- L'admin **assume** le contenu de l'email envoyé

---

### Nice-to-Have (Phase 2)

**Fonctionnalités non bloquantes pour MVP, mais à prioriser ensuite** :

- **Notifications push** (WebSocket) : Alertes temps réel dans `/admin` (nouveau devis, paiement, erreur)
- **Tableau de bord personnalisable** : Widgets drag-and-drop, KPIs choisis par user
- **Export avancé** : PDF/Excel des rapports (dossiers, paiements, déménageurs)
- **Recherche globale** : Barre de recherche en haut (`Cmd+K`) pour chercher dossier/client/déménageur par email/nom/ID
- **Raccourcis clavier** : Navigation rapide (`Cmd+1` → Dashboard, `Cmd+2` → Folders, etc.)
- **Dark mode** : Toggle light/dark (Tailwind dark:)
- **Webhooks admin** : Notifier un Slack/Discord quand événement critique (paiement échoué, déménageur blacklisté)
- **Graphiques avancés** : Recharts/Chart.js pour analytics poussés (CA par région, taux conversion par source lead, etc.)
- **Gestion users admin** : CRUD users admin/operator, gestion rôles
- **Audit trail par user** : "Voir toutes les actions de cet admin"

---

### 11. UI Style Guidelines (Apple "Liquid Glass")

**Inspiration** : Apple Glass UI / macOS Sonoma / iOS Translucency

#### 11.1. Principes de Design

**Objectif** : Interface moderne, fluide, apaisante, professionnelle.

**Caractéristiques** :
- **Fond** : Dégradé très doux (light mode: blanc→gris clair, dark mode: noir→gris foncé)
- **Cartes** : Translucides avec blur léger (8-20% opacity), border subtile (1px, couleur douce)
- **Coins arrondis** : 8px (petits éléments), 12px (cartes), 16px (modales)
- **Ombres** : Douces et diffuses (`shadow-lg`, `shadow-xl`)
- **Contrastes** : Forts pour la lisibilité (texte noir/blanc, badges colorés)
- **Typographie** : Inter ou SF Pro (Apple), poids 400-600, tailles 14-18px
- **Animations** : Légères (fade, slide) avec `transition-all duration-200 ease-in-out`

---

#### 11.2. Palette de Couleurs

**Light Mode** :
- **Background** : `bg-gradient-to-br from-white via-gray-50 to-gray-100`
- **Cartes** : `bg-white/80 backdrop-blur-sm border border-gray-200/50`
- **Texte** : `text-gray-900` (titres), `text-gray-600` (body)
- **Accents** :
  - Primary (actions) : `bg-blue-500 hover:bg-blue-600`
  - Success : `bg-green-500`
  - Warning : `bg-yellow-500`
  - Danger : `bg-red-500`

**Dark Mode** :
- **Background** : `bg-gradient-to-br from-gray-900 via-gray-800 to-black`
- **Cartes** : `bg-gray-800/80 backdrop-blur-sm border border-gray-700/50`
- **Texte** : `text-white` (titres), `text-gray-300` (body)
- **Accents** : Mêmes couleurs, ajustées pour le dark (`bg-blue-600`, etc.)

---

#### 11.3. Composants Clés

**Card** :
```tsx
<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
  {children}
</div>
```

**Button** :
```tsx
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg active:scale-95">
  Action
</button>
```

**Badge** :
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
  Active
</span>
```

**Modal/Drawer** :
```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto mt-20 border border-gray-200 dark:border-gray-700">
    {content}
  </div>
</div>
```

---

#### 11.4. Animations

**Fade In** :
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}
```

**Slide In (Drawer)** :
```css
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-slide-in {
  animation: slideIn 300ms ease-out;
}
```

**Hover Scale** :
```tsx
<div className="transition-transform duration-200 hover:scale-105">
  {content}
</div>
```

---

#### 11.5. Accessibilité & Performance

**Accessibilité** :
- **Contraste** : Respecter WCAG AA minimum (4.5:1 pour texte, 3:1 pour UI)
- **Focus visible** : `focus:ring-2 focus:ring-blue-500 focus:outline-none`
- **Keyboard navigation** : Tous les boutons/liens accessibles au clavier
- **Screen readers** : `aria-label` sur icônes, `role` appropriés
- **Couleurs** : Ne pas se fier uniquement aux couleurs (ajouter icônes/texte)

**Performance** :
- **Effets blur** : Limiter sur listes massives (> 100 éléments) → désactiver ou réduire
- **Animations** : `prefers-reduced-motion: reduce` (mode "Reduced motion" optionnel)
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
  ```
- **Lazy loading** : Charger images/composants lourds uniquement si visibles (Intersection Observer)

---

#### 11.6. Mode "Reduced Motion"

**Toggle dans settings** :
- Checkbox "Réduire les animations"
- Store dans localStorage
- Applique classe `no-animations` au body
  ```css
  .no-animations * {
    animation: none !important;
    transition: none !important;
  }
  ```

---

#### 11.7. Uniformité

**Règle** : Tous les écrans `/admin` suivent ces guidelines.

**Checklist** :
- [ ] Même palette de couleurs (light/dark)
- [ ] Même border-radius (8px, 12px, 16px)
- [ ] Même typographie (Inter/SF Pro)
- [ ] Même transitions (200ms ease-in-out)
- [ ] Même spacing (Tailwind 4/6/8/12/16)
- [ ] Même composants réutilisables (Button, Card, Badge, Modal)

**Design System** :
- Créer un dossier `components/ui/` avec composants de base
- Utiliser shadcn/ui (pré-configuré avec Tailwind + variantes)
- Documenter dans Storybook ou page `/admin/styleguide` (optionnel)

## État d'avancement

- [ ] Structure rédigée et validée
- [ ] Priorisation MVP/Phase 2 établie

**Statut : 📝 Spécification**

## Commits liés

*(à renseigner)*

## Notes futures

- Task dédiée à l'implémentation concrète du layout `/admin`
- Task dédiée à l'auth & gestion des sessions
- Cette task est **indépendante** du portail `/partner` (voir P2-t010)

