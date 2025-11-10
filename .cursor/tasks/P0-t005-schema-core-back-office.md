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

### Vue d'ensemble

Le schéma suit le flux métier Moverz :
```
Lead (site local) → Folder (dossier) → Quotes (10 devis) → Booking → Payment → Mise en relation
```

### Schéma Prisma complet

```prisma
// ============================================
// CORE ENTITIES
// ============================================

// Table: leads
// Prospects issus des 11 sites locaux (bordeaux-demenageur.fr, etc.)
// Rôle : Capture initiale du besoin client avant qualification en Folder
model Lead {
  id                String            @id @default(uuid())
  
  // Identification
  source            String            // Site source (ex: "bordeaux-demenageur.fr")
  
  // Données contact (sensibles : email, phone)
  email             String
  phone             String?
  firstName         String
  lastName          String
  
  // Données déménagement (estimation)
  originAddress     String
  originCity        String
  originPostalCode  String
  destAddress       String
  destCity          String
  destPostalCode    String
  
  // Estimation volume
  estimatedVolume      Decimal?         @db.Decimal(6,2)  // m³ estimé
  estimationMethod     EstimationMethod @default(FORM)    // Comment estimé
  photosUrls           String?          @db.Text          // JSON array URLs S3 si AI_PHOTO
  aiEstimationConfidence Decimal?       @db.Decimal(5,2)  // 0-100 si IA utilisée
  
  movingDate        DateTime?         // Date souhaitée déménagement
  
  // Métadonnées
  status            LeadStatus  @default(NEW)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  convertedAt       DateTime?   // Quand converti en Folder
  
  // Soft delete
  deletedAt         DateTime?
  
  // Relations
  folder            Folder?     // Un lead devient un folder (1:1)
  
  @@index([status, createdAt])
  @@index([source])
  @@index([email])
  @@index([deletedAt])
}

enum EstimationMethod {
  AI_PHOTO      // Analyse photos IA
  FORM          // Formulaire simplifié
  MANUAL_ADMIN  // Saisie manuelle admin
}

enum LeadStatus {
  NEW           // Nouveau lead
  CONTACTED     // Contacté par équipe
  CONVERTED     // Converti en dossier
  ABANDONED     // Abandonné (pas intéressé, hors zone, etc.)
}

// Table: clients
// Informations complètes du client
// Rôle : Entité client unique pour plusieurs dossiers (relation 1:n)
model Client {
  id                String      @id @default(uuid())
  
  // Identité (données sensibles)
  email             String      @unique
  phone             String
  firstName         String
  lastName          String
  
  // Métadonnées
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Soft delete
  deletedAt         DateTime?
  
  // Relations
  folders           Folder[]    // Un client peut avoir plusieurs dossiers
  
  @@index([email])
  @@index([deletedAt])
}

// Table: folders (dossiers)
// Dossier de déménagement complet
// Rôle : Unité centrale du flux métier Lead → Folder → Quotes → Booking → Payment
model Folder {
  id                String        @id @default(uuid())
  
  // Relations principales
  leadId            String?       @unique
  lead              Lead?         @relation(fields: [leadId], references: [id], onDelete: SetNull)
  clientId          String
  client            Client        @relation(fields: [clientId], references: [id], onDelete: Restrict)
  
  // Choix client (avant paiement)
  selectedQuoteId   String?       @unique  // Quote choisi par client (avant Booking)
  selectedQuote     Quote?        @relation("SelectedQuote", fields: [selectedQuoteId], references: [id], onDelete: SetNull)
  
  // Adresses complètes
  originAddress     String
  originCity        String
  originPostalCode  String        // Index pour filtrer par zone
  originFloor       Int?
  originElevator    Boolean       @default(false)
  
  destAddress       String
  destCity          String
  destPostalCode    String        // Index pour filtrer par zone
  destFloor         Int?
  destElevator      Boolean       @default(false)
  
  // Volume et distance (types Decimal pour précision)
  volume            Decimal       @db.Decimal(6,2)  // m³ final
  distance          Decimal       @db.Decimal(7,2)  // km calculé
  
  // Traçabilité ajustement volume
  volumeAdjustedBy      String?               // UserId qui a ajusté
  volumeAdjustedAt      DateTime?
  volumeAdjustmentReason String?              // Pourquoi ajusté
  
  // Dates
  movingDate        DateTime
  flexibleDate      Boolean       @default(false)
  
  // Options supplémentaires
  needPacking       Boolean       @default(false)
  needStorage       Boolean       @default(false)
  needInsurance     Boolean       @default(false)
  specialItems      String?       @db.Text  // JSON: piano, œuvres d'art, etc.
  
  // Workflow
  status            FolderStatus  @default(CREATED)
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  quotesRequestedAt DateTime?     // Quand demandes devis envoyées
  top3ReadyAt       DateTime?     // Quand top 3 prêt
  confirmedAt       DateTime?     // Quand booking confirmé
  
  // Soft delete
  deletedAt         DateTime?
  
  // Relations
  quotes            Quote[]       @relation("FolderQuotes")
  booking           Booking?
  top3Selections    Top3Selection[]  // Historique top 3 présentés
  
  @@index([status, createdAt])
  @@index([clientId])
  @@index([movingDate])
  @@index([originPostalCode])  // Filtre zone départ
  @@index([destPostalCode])    // Filtre zone arrivée
  @@index([deletedAt])
}

enum FolderStatus {
  CREATED           // Dossier créé
  QUOTES_REQUESTED  // 10 demandes envoyées
  QUOTES_PENDING    // En attente devis
  TOP3_READY        // Top 3 prêt, attente validation admin
  SENT_TO_CLIENT    // Top 3 envoyé au client
  AWAITING_PAYMENT  // Client a choisi, attente paiement
  CONFIRMED         // Payé et confirmé
  COMPLETED         // Déménagement effectué
  CANCELLED         // Annulé
}

// ============================================
// MOVERS & PRICING
// ============================================

// Table: movers (déménageurs)
// Rôle : Entreprises partenaires Moverz (relation 1:n avec Quotes, Bookings, Users)
model Mover {
  id                String        @id @default(uuid())
  
  // Identification entreprise
  companyName       String
  siret             String        @unique @db.VarChar(14)  // Longueur fixe SIRET
  email             String        @unique
  phone             String
  
  // Adresse siège
  address           String
  city              String
  postalCode        String
  
  // Google Places
  googlePlaceId     String?       @unique
  googleRating      Decimal?      @db.Decimal(3,2)  // 0-5.00
  googleReviewsCount Int?
  
  // Scoring financier (saisie manuelle admin via accès web CreditSafe)
  creditSafeScore   Int?          // 0-100, saisi manuellement par admin
  creditSafeNotes   String?       @db.Text  // Notes admin sur solidité financière
  
  // Zone de couverture
  coverageZones     String        @db.Text  // JSON: array de codes postaux ou départements
  
  // Statut
  status            MoverStatus   @default(PENDING)
  blacklisted       Boolean       @default(false)
  blacklistReason   String?       @db.Text
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  lastSyncedAt      DateTime?     // Dernière sync Google Places
  
  // Soft delete
  deletedAt         DateTime?
  
  // Relations
  pricingGrids      PricingGrid[]
  quotes            Quote[]       @relation("MoverQuotes")
  bookings          Booking[]
  users             User[]        // Comptes partner de ce déménageur (1:n)
  
  @@index([status])
  @@index([googlePlaceId])
  @@index([siret])
  @@index([city])  // Recherche par ville
  @@index([deletedAt])
}

enum MoverStatus {
  PENDING       // En attente validation
  ACTIVE        // Actif
  INACTIVE      // Inactif (temporaire)
  SUSPENDED     // Suspendu (problème)
}

// Table: pricing_grids
// Grilles tarifaires déménageurs (m³ x distance)
// Rôle : Permet génération automatique de devis (Quote.source = AUTO_GENERATED)
model PricingGrid {
  id                String      @id @default(uuid())
  
  // Relation
  moverId           String
  mover             Mover       @relation(fields: [moverId], references: [id], onDelete: Restrict)
  
  // Paliers volume (m³) - Decimal pour précision
  volumeMin         Decimal     @db.Decimal(6,2)  // m³ min (ex: 10.00)
  volumeMax         Decimal     @db.Decimal(6,2)  // m³ max (ex: 20.00)
  
  // Paliers distance (km)
  distanceMin       Decimal     @db.Decimal(7,2)  // km min (ex: 0.00)
  distanceMax       Decimal     @db.Decimal(7,2)  // km max (ex: 50.00)
  
  // Prix (montants financiers en Decimal)
  basePrice         Decimal     @db.Decimal(10,2)  // Prix de base
  pricePerM3        Decimal     @db.Decimal(10,2)  // Prix par m³ supplémentaire
  pricePerKm        Decimal     @db.Decimal(10,2)  // Prix par km supplémentaire
  
  // Options
  packingPrice      Decimal?    @db.Decimal(10,2)  // Prix emballage
  storagePrice      Decimal?    @db.Decimal(10,2)  // Prix stockage (par jour)
  insurancePrice    Decimal?    @db.Decimal(10,2)  // Prix assurance
  
  // Métadonnées
  active            Boolean     @default(true)
  validFrom         DateTime    @default(now())
  validUntil        DateTime?   // NULL = pas d'expiration
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Soft delete
  deletedAt         DateTime?
  
  // Relations
  quotes            Quote[]     // Quotes générées depuis cette grille
  
  @@index([moverId, active])
  @@index([volumeMin, volumeMax, distanceMin, distanceMax])
  @@index([deletedAt])
}

// ============================================
// QUOTES
// ============================================

// Table: quotes (devis)
// Rôle : Devis collectés (auto, parsed, manual) pour un Folder - relation 1:n
model Quote {
  id                String        @id @default(uuid())
  
  // Relations (FK correctes)
  folderId          String
  folder            Folder        @relation("FolderQuotes", fields: [folderId], references: [id], onDelete: Restrict)
  moverId           String
  mover             Mover         @relation("MoverQuotes", fields: [moverId], references: [id], onDelete: Restrict)
  
  // Source
  source            QuoteSource
  
  // Pour AUTO_GENERATED (FK vers PricingGrid)
  pricingGridId     String?
  pricingGrid       PricingGrid?  @relation(fields: [pricingGridId], references: [id], onDelete: SetNull)
  
  // Pour EMAIL_PARSED
  rawEmailId        String?       // Lien vers email brut (S3 ou autre)
  parsedData        String?       @db.Text  // JSON: données extraites
  confidenceScore   Decimal?      @db.Decimal(5,2)  // 0-100.00, confiance parsing
  
  // Données devis (montants en Decimal)
  totalPrice        Decimal       @db.Decimal(10,2)
  currency          String        @default("EUR") @db.VarChar(3)
  validUntil        DateTime      // Index pour requêtes "expirés aujourd'hui"
  
  // Détails
  breakdown         String?       @db.Text  // JSON: détail calcul
  notes             String?       @db.Text  // Notes déménageur
  
  // Workflow
  status            QuoteStatus   @default(REQUESTED)
  reminderCount     Int           @default(0)  // Remplace REMINDED_1, REMINDED_2
  lastRemindedAt    DateTime?
  
  // Validation admin (FK correcte vers User)
  validatedByUserId String?
  validatedByUser   User?         @relation("QuoteValidator", fields: [validatedByUserId], references: [id], onDelete: SetNull)
  validatedAt       DateTime?
  rejectionReason   String?       @db.Text
  
  // Scoring (pour top 3) - Decimal pour précision
  scorePrice        Decimal?      @db.Decimal(5,2)  // 0-100.00
  scoreGoogle       Decimal?      @db.Decimal(5,2)  // 0-100.00
  scoreFinancial    Decimal?      @db.Decimal(5,2)  // 0-100.00
  scoreLitigations  Decimal?      @db.Decimal(5,2)  // 0-100.00
  scoreTotal        Decimal?      @db.Decimal(5,2)  // Moyenne pondérée
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  requestedAt       DateTime      @default(now())
  receivedAt        DateTime?
  
  // Soft delete
  deletedAt         DateTime?
  
  // Relations
  booking           Booking?
  folderSelected    Folder?       @relation("SelectedQuote")  // Si choisi par client
  top3Selections    Top3Selection[]  // Historique apparitions dans top 3
  
  @@index([folderId, status])
  @@index([folderId, scoreTotal])  // Composite pour requête top 3
  @@index([moverId])
  @@index([status])
  @@index([validUntil])  // Requêtes "quotes expirés"
  @@index([deletedAt])
}

enum QuoteSource {
  AUTO_GENERATED    // Généré depuis grille tarifaire
  EMAIL_PARSED      // Parsé depuis email réponse
  MANUAL            // Saisi manuellement par admin
}

enum QuoteStatus {
  REQUESTED         // Demande envoyée au déménageur
  REMINDED          // Relance envoyée (reminderCount indique combien)
  EMAIL_RECEIVED    // Email reçu, pas encore parsé
  PARSED_PENDING    // Parsé, attente validation admin
  VALIDATED         // Validé, prêt pour scoring
  REJECTED          // Rejeté par admin
  PARSING_FAILED    // Échec parsing, intervention manuelle
  EXPIRED           // Expiré (pas de réponse ou validUntil dépassé)
  SELECTED          // Choisi par le client
}

// ============================================
// TOP 3 SELECTION (snapshot figé)
// ============================================

// Table: top3_selections
// Rôle : Snapshot figé des 3 meilleurs devis présentés au client (traçabilité)
model Top3Selection {
  id              String   @id @default(uuid())
  
  // Relation
  folderId        String
  folder          Folder   @relation(fields: [folderId], references: [id], onDelete: Restrict)
  
  // Les 3 quotes présentés (snapshot au moment présentation)
  quote1Id        String
  quote1          Quote    @relation(fields: [quote1Id], references: [id], onDelete: Restrict)
  quote2Id        String
  quote2          Quote    @relation(fields: [quote2Id], references: [id], onDelete: Restrict)
  quote3Id        String
  quote3          Quote    @relation(fields: [quote3Id], references: [id], onDelete: Restrict)
  
  // Snapshot scores au moment présentation (figés, ne changent plus)
  quote1ScoreTotal     Decimal  @db.Decimal(5,2)
  quote1Price          Decimal  @db.Decimal(10,2)
  quote2ScoreTotal     Decimal  @db.Decimal(5,2)
  quote2Price          Decimal  @db.Decimal(10,2)
  quote3ScoreTotal     Decimal  @db.Decimal(5,2)
  quote3Price          Decimal  @db.Decimal(10,2)
  
  // Tracking client
  selectedQuoteId String?  // Lequel le client a choisi
  clientViewedAt  DateTime?
  clientSelectedAt DateTime?
  
  // Métadonnées
  presentedAt     DateTime @default(now())
  
  @@index([folderId])
  @@index([presentedAt])
}

// ============================================
// BOOKINGS & PAYMENTS
// ============================================

// Table: bookings (réservations confirmées)
// Rôle : Réservation confirmée liant Folder + Quote sélectionné + Payment (relation 1:1:1)
model Booking {
  id                String        @id @default(uuid())
  
  // Relations (moverId supprimé - redondant avec quote.moverId)
  folderId          String        @unique
  folder            Folder        @relation(fields: [folderId], references: [id], onDelete: Restrict)
  quoteId           String        @unique
  quote             Quote         @relation(fields: [quoteId], references: [id], onDelete: Restrict)
  
  // Montants (Decimal pour précision financière)
  totalAmount       Decimal       @db.Decimal(10,2)  // Montant total devis
  depositAmount     Decimal       @db.Decimal(10,2)  // Acompte 30%
  remainingAmount   Decimal       @db.Decimal(10,2)  // 70% restants
  
  // Statut
  status            BookingStatus @default(PENDING_PAYMENT)
  
  // Contact échangé
  contactExchangedAt DateTime?    // Quand contacts échangés (après paiement)
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  confirmedAt       DateTime?     // Quand paiement reçu
  completedAt       DateTime?     // Quand déménagement effectué
  cancelledAt       DateTime?
  cancellationReason String?      @db.Text
  
  // Soft delete
  deletedAt         DateTime?
  
  // Relations
  payments          Payment[]     // 1:n (acompte + éventuels autres paiements)
  
  @@index([status])
  @@index([confirmedAt])  // Rapports par période
  @@index([deletedAt])
}

enum BookingStatus {
  PENDING_PAYMENT   // En attente paiement acompte
  CONFIRMED         // Payé et confirmé
  IN_PROGRESS       // En cours (jour du déménagement)
  COMPLETED         // Terminé
  CANCELLED         // Annulé
  DISPUTED          // Litige
}

// Table: payments
// Rôle : Paiements Stripe (acompte 30%, reversements déménageur, remboursements) - données sensibles
model Payment {
  id                String          @id @default(uuid())
  
  // Relations
  bookingId         String
  booking           Booking         @relation(fields: [bookingId], references: [id], onDelete: Restrict)
  
  // Type
  type              PaymentType
  
  // Montants (Decimal pour précision financière)
  amount            Decimal         @db.Decimal(10,2)
  currency          String          @default("EUR") @db.VarChar(3)
  
  // Commission Moverz (seulement pour DEPOSIT) - sensible
  commissionRate    Decimal?        @db.Decimal(4,2)  // 0.05-0.15 (5-15%)
  commissionAmount  Decimal?        @db.Decimal(10,2)
  moverAmount       Decimal?        @db.Decimal(10,2)  // Montant reversé au déménageur
  
  // Stripe (sensible)
  stripePaymentIntentId String?     @unique
  stripeTransferId      String?     @unique
  idempotencyKey        String?     @unique  // Anti-doublon webhooks
  
  // Statut
  status            PaymentStatus   @default(PENDING)
  
  // Métadonnées
  paidAt            DateTime?       // Index pour rapports financiers
  transferredAt     DateTime?       // Quand reversé au déménageur
  refundedAt        DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  // Soft delete
  deletedAt         DateTime?
  
  @@index([bookingId])
  @@index([status])
  @@index([paidAt])  // Rapports financiers par période
  @@index([stripePaymentIntentId])
  @@index([deletedAt])
}

enum PaymentType {
  DEPOSIT           // Acompte 30% sur plateforme
  REMAINING         // 70% restants (hors plateforme ou extension future)
  REFUND            // Remboursement
}

enum PaymentStatus {
  PENDING           // En attente
  PROCESSING        // En traitement
  SUCCEEDED         // Réussi
  TRANSFERRED       // Reversé au déménageur
  FAILED            // Échoué
  REFUNDED          // Remboursé
  DISPUTED          // Contesté
}

// ============================================
// USERS & AUTH
// ============================================

// Table: users
// Rôle : Comptes admin/operator/partner - données sensibles (email, passwordHash)
model User {
  id                String      @id @default(uuid())
  
  // Auth (sensible)
  email             String      @unique
  passwordHash      String      // Bcrypt
  
  // Profil
  firstName         String
  lastName          String
  phone             String?
  
  // Rôle
  role              UserRole
  
  // Pour PARTNER (FK vers Mover)
  moverId           String?
  mover             Mover?      @relation(fields: [moverId], references: [id], onDelete: Restrict)
  
  // Statut
  active            Boolean     @default(true)
  emailVerified     Boolean     @default(false)
  
  // Métadonnées
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  lastLoginAt       DateTime?
  
  // Soft delete
  deletedAt         DateTime?
  
  // Relations (FK correctes)
  validatedQuotes   Quote[]     @relation("QuoteValidator")  // Quotes validées par cet admin
  sentEmails        EmailLog[]  @relation("SentBy")
  
  @@index([email])
  @@index([role, active])
  @@index([moverId])
  @@index([deletedAt])
}

enum UserRole {
  ADMIN             // Admin Moverz (accès total)
  OPERATOR          // Opérateur Moverz (accès limité)
  MOVER_OWNER       // Propriétaire entreprise déménagement
  MOVER_USER        // Employé entreprise déménagement
}

// ============================================
// EMAILS
// ============================================

// Table: email_logs
// Rôle : Tracking emails envoyés (quotes, top3, paiements, relances)
model EmailLog {
  id                String        @id @default(uuid())
  
  // Type
  type              EmailType
  
  // Destinataire (sensible)
  recipient         String
  
  // Contenu
  subject           String
  bodyHtml          String        @db.Text
  
  // Relations (FK correctes)
  folderId          String?
  folder            Folder?       @relation(fields: [folderId], references: [id], onDelete: SetNull)
  moverId           String?
  mover             Mover?        @relation(fields: [moverId], references: [id], onDelete: SetNull)
  
  // Envoyé par (FK correcte vers User)
  sentBy            String?
  sentByUser        User?         @relation("SentBy", fields: [sentBy], references: [id], onDelete: SetNull)
  
  // Statut
  status            EmailStatus   @default(PENDING)
  
  // Tracking
  sentAt            DateTime?
  deliveredAt       DateTime?
  openedAt          DateTime?
  clickedAt         DateTime?
  bouncedAt         DateTime?
  failedAt          DateTime?
  errorMessage      String?       @db.Text
  
  // Provider
  providerMessageId String?       // ID Resend/Postmark
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@index([type, status])
  @@index([folderId])
  @@index([moverId])
  @@index([recipient])
  @@index([sentAt])  // Rapports emails par période
}

enum EmailType {
  QUOTE_REQUEST     // Demande devis à déménageur
  QUOTE_REMINDER    // Relance déménageur
  CLIENT_TOP3       // Top 3 au client
  PAYMENT_CONFIRMATION // Confirmation paiement
  CONTACT_EXCHANGE  // Échange coordonnées
  MOVER_INVITATION  // Invitation déménageur (Phase 2)
}

enum EmailStatus {
  PENDING           // En attente envoi
  AWAITING_VALIDATION // Attente validation admin
  SENT              // Envoyé
  DELIVERED         // Délivré
  OPENED            // Ouvert
  CLICKED           // Cliqué
  BOUNCED           // Rebondi
  FAILED            // Échoué
}

// Table: email_templates (optionnel, si templates en DB)
model EmailTemplate {
  id                String      @id @default(uuid())
  
  // Identification
  name              String      @unique
  type              EmailType
  
  // Contenu
  subject           String
  bodyHtml          String      @db.Text
  variables         String      // JSON: liste variables disponibles
  
  // Statut
  active            Boolean     @default(true)
  
  // Métadonnées
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  lastUsedAt        DateTime?
  
  @@index([type, active])
}
```

### Relations clés

**Flux principal** :
```
Lead → Folder → Quote (x10) → Booking → Payment
       ↓         ↓             ↓
     Client    Mover         Mover
```

**Authentification** :
```
User (ADMIN/OPERATOR) → Accès complet
User (MOVER_*) → Mover → PricingGrid, Quote
```

**Emails** :
```
EmailLog → Folder (client notification)
EmailLog → Mover (quote request/reminder)
```

### Contraintes et règles métier

1. **Lead → Folder** : Un lead ne peut devenir qu'un seul folder (`@unique`)
2. **Folder → Booking** : Un folder ne peut avoir qu'un seul booking (`@unique`)
3. **Quote → Booking** : Un quote ne peut être lié qu'à un seul booking (`@unique`)
4. **Folder → SelectedQuote** : Un folder peut sélectionner un quote avant booking (`@unique`)
5. **onDelete: Restrict** : Suppression Mover/Folder bloquée si relations actives (protection données)
6. **onDelete: SetNull** : Suppression Lead/PricingGrid/User → FK devient null (historique préservé)
7. **Soft delete** : Tous les modèles core ont `deletedAt` pour audit/RGPD
8. **SIRET unique** : Un déménageur = un SIRET unique (VarChar(14))
9. **Email unique** : Client email unique, User email unique
10. **Montants Decimal** : Tous montants financiers en Decimal(10,2) pour précision
11. **FK complètes** : Toutes relations ont FK explicites (Quote.validatedByUserId, etc.)

### Index de performance

Les index sont positionnés sur :
- Colonnes de recherche fréquente (status, email, siret)
- Clés étrangères (folderId, moverId, clientId)
- Colonnes de tri (createdAt, scoreTotal, movingDate)
- Colonnes de filtrage composite (status + createdAt)

## État d'avancement

- [x] Schéma rédigé et validé
- [x] Relations définies
- [x] Index de performance positionnés
- [x] Contraintes métier documentées
- [ ] Validation technique avec équipe dev
- [ ] Ajustements selon retours

**Statut : ✅ Spécification complète — En attente validation**

## Commits liés

*(à renseigner au fur et à mesure : date — sha — message)*

## Notes futures

- Créer une task dédiée pour générer les migrations à partir de ce schéma.
- Créer une task dédiée aux index/perfs/archivage.

