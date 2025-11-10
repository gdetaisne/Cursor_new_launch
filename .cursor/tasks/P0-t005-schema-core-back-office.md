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
model Lead {
  id                String      @id @default(uuid())
  
  // Identification
  source            String      // Site source (ex: "bordeaux-demenageur.fr")
  
  // Données contact
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
  
  estimatedVolume   Float?      // m³ estimé
  movingDate        DateTime?   // Date souhaitée déménagement
  
  // Métadonnées
  status            LeadStatus  @default(NEW)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  convertedAt       DateTime?   // Quand converti en Folder
  
  // Relations
  folder            Folder?     // Un lead devient un folder
  
  @@index([status, createdAt])
  @@index([source])
  @@index([email])
}

enum LeadStatus {
  NEW           // Nouveau lead
  CONTACTED     // Contacté par équipe
  CONVERTED     // Converti en dossier
  ABANDONED     // Abandonné (pas intéressé, hors zone, etc.)
}

// Table: clients
// Informations complètes du client
model Client {
  id                String      @id @default(uuid())
  
  // Identité
  email             String      @unique
  phone             String
  firstName         String
  lastName          String
  
  // Métadonnées
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relations
  folders           Folder[]
  
  @@index([email])
}

// Table: folders (dossiers)
// Dossier de déménagement complet
model Folder {
  id                String        @id @default(uuid())
  
  // Relations principales
  leadId            String?       @unique
  lead              Lead?         @relation(fields: [leadId], references: [id])
  clientId          String
  client            Client        @relation(fields: [clientId], references: [id])
  
  // Adresses complètes
  originAddress     String
  originCity        String
  originPostalCode  String
  originFloor       Int?
  originElevator    Boolean       @default(false)
  
  destAddress       String
  destCity          String
  destPostalCode    String
  destFloor         Int?
  destElevator      Boolean       @default(false)
  
  // Volume et distance
  volume            Float         // m³ final
  distance          Float         // km calculé
  
  // Dates
  movingDate        DateTime
  flexibleDate      Boolean       @default(false)
  
  // Options supplémentaires
  needPacking       Boolean       @default(false)
  needStorage       Boolean       @default(false)
  needInsurance     Boolean       @default(false)
  specialItems      String?       // JSON: piano, œuvres d'art, etc.
  
  // Workflow
  status            FolderStatus  @default(CREATED)
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  quotesRequestedAt DateTime?     // Quand demandes devis envoyées
  top3ReadyAt       DateTime?     // Quand top 3 prêt
  confirmedAt       DateTime?     // Quand booking confirmé
  
  // Relations
  quotes            Quote[]
  booking           Booking?
  
  @@index([status, createdAt])
  @@index([clientId])
  @@index([movingDate])
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
model Mover {
  id                String        @id @default(uuid())
  
  // Identification entreprise
  companyName       String
  siret             String        @unique
  email             String        @unique
  phone             String
  
  // Adresse siège
  address           String
  city              String
  postalCode        String
  
  // Google Places
  googlePlaceId     String?       @unique
  googleRating      Float?        // 0-5
  googleReviewsCount Int?
  
  // Scoring financier (saisie manuelle admin)
  creditSafeScore   Int?          // 0-100, saisi manuellement par admin
  creditSafeNotes   String?       // Notes admin sur solidité financière
  
  // Zone de couverture
  coverageZones     String        // JSON: array de codes postaux ou départements
  
  // Statut
  status            MoverStatus   @default(PENDING)
  blacklisted       Boolean       @default(false)
  blacklistReason   String?
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  lastSyncedAt      DateTime?     // Dernière sync Google Places
  
  // Relations
  pricingGrids      PricingGrid[]
  quotes            Quote[]
  bookings          Booking[]
  users             User[]        // Comptes partner de ce déménageur
  
  @@index([status])
  @@index([googlePlaceId])
  @@index([siret])
}

enum MoverStatus {
  PENDING       // En attente validation
  ACTIVE        // Actif
  INACTIVE      // Inactif (temporaire)
  SUSPENDED     // Suspendu (problème)
}

// Table: pricing_grids
// Grilles tarifaires déménageurs (m³ x distance)
model PricingGrid {
  id                String      @id @default(uuid())
  
  // Relation
  moverId           String
  mover             Mover       @relation(fields: [moverId], references: [id], onDelete: Cascade)
  
  // Paliers volume (m³)
  volumeMin         Float       // m³ min (ex: 10)
  volumeMax         Float       // m³ max (ex: 20)
  
  // Paliers distance (km)
  distanceMin       Float       // km min (ex: 0)
  distanceMax       Float       // km max (ex: 50)
  
  // Prix
  basePrice         Float       // Prix de base
  pricePerM3        Float       // Prix par m³ supplémentaire
  pricePerKm        Float       // Prix par km supplémentaire
  
  // Options
  packingPrice      Float?      // Prix emballage
  storagePrice      Float?      // Prix stockage (par jour)
  insurancePrice    Float?      // Prix assurance
  
  // Métadonnées
  active            Boolean     @default(true)
  validFrom         DateTime    @default(now())
  validUntil        DateTime?   // NULL = pas d'expiration
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([moverId, active])
  @@index([volumeMin, volumeMax, distanceMin, distanceMax])
}

// ============================================
// QUOTES
// ============================================

// Table: quotes (devis)
model Quote {
  id                String        @id @default(uuid())
  
  // Relations
  folderId          String
  folder            Folder        @relation(fields: [folderId], references: [id], onDelete: Cascade)
  moverId           String
  mover             Mover         @relation(fields: [moverId], references: [id])
  
  // Source
  source            QuoteSource
  
  // Pour AUTO_GENERATED
  pricingGridId     String?       // Grille utilisée si auto
  
  // Pour EMAIL_PARSED
  rawEmailId        String?       // Lien vers email brut (S3 ou autre)
  parsedData        String?       // JSON: données extraites
  confidenceScore   Float?        // 0-100, confiance parsing
  
  // Données devis
  totalPrice        Float
  currency          String        @default("EUR")
  validUntil        DateTime
  
  // Détails
  breakdown         String?       // JSON: détail calcul
  notes             String?       // Notes déménageur
  
  // Workflow
  status            QuoteStatus   @default(REQUESTED)
  
  // Validation admin (pour EMAIL_PARSED)
  validatedBy       String?       // userId admin qui valide
  validatedAt       DateTime?
  rejectionReason   String?
  
  // Scoring (pour top 3)
  scorePrice        Float?        // 0-100
  scoreGoogle       Float?        // 0-100
  scoreFinancial    Float?        // 0-100
  scoreLitigations  Float?        // 0-100
  scoreTotal        Float?        // Moyenne pondérée
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  requestedAt       DateTime      @default(now())
  receivedAt        DateTime?
  
  // Relations
  booking           Booking?
  
  @@index([folderId, status])
  @@index([moverId])
  @@index([status])
  @@index([scoreTotal])
}

enum QuoteSource {
  AUTO_GENERATED    // Généré depuis grille tarifaire
  EMAIL_PARSED      // Parsé depuis email réponse
  MANUAL            // Saisi manuellement par admin
}

enum QuoteStatus {
  REQUESTED         // Demande envoyée au déménageur
  REMINDED_1        // Relance J+2
  REMINDED_2        // Relance J+4
  EMAIL_RECEIVED    // Email reçu, pas encore parsé
  PARSED_PENDING    // Parsé, attente validation admin
  VALIDATED         // Validé, prêt pour scoring
  REJECTED          // Rejeté par admin
  PARSING_FAILED    // Échec parsing, intervention manuelle
  EXPIRED           // Expiré (pas de réponse après J+5)
  SELECTED          // Choisi par le client
}

// ============================================
// BOOKINGS & PAYMENTS
// ============================================

// Table: bookings (réservations confirmées)
model Booking {
  id                String        @id @default(uuid())
  
  // Relations
  folderId          String        @unique
  folder            Folder        @relation(fields: [folderId], references: [id])
  quoteId           String        @unique
  quote             Quote         @relation(fields: [quoteId], references: [id])
  moverId           String
  mover             Mover         @relation(fields: [moverId], references: [id])
  
  // Montants
  totalAmount       Float         // Montant total devis
  depositAmount     Float         // Acompte 30%
  remainingAmount   Float         // 70% restants
  
  // Statut
  status            BookingStatus @default(PENDING_PAYMENT)
  
  // Contact échangé
  contactExchangedAt DateTime?    // Quand contacts échangés
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  confirmedAt       DateTime?     // Quand paiement reçu
  completedAt       DateTime?     // Quand déménagement effectué
  cancelledAt       DateTime?
  cancellationReason String?
  
  // Relations
  payments          Payment[]
  
  @@index([status])
  @@index([moverId])
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
model Payment {
  id                String          @id @default(uuid())
  
  // Relations
  bookingId         String
  booking           Booking         @relation(fields: [bookingId], references: [id])
  
  // Type
  type              PaymentType
  
  // Montants
  amount            Float
  currency          String          @default("EUR")
  
  // Commission Moverz (seulement pour DEPOSIT)
  commissionRate    Float?          // 0.05-0.15 (5-15%)
  commissionAmount  Float?
  moverAmount       Float?          // Montant reversé au déménageur
  
  // Stripe
  stripePaymentIntentId String?     @unique
  stripeTransferId      String?     @unique
  
  // Statut
  status            PaymentStatus   @default(PENDING)
  
  // Métadonnées
  paidAt            DateTime?
  transferredAt     DateTime?       // Quand reversé au déménageur
  refundedAt        DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([bookingId])
  @@index([status])
  @@index([stripePaymentIntentId])
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
model User {
  id                String      @id @default(uuid())
  
  // Auth
  email             String      @unique
  passwordHash      String      // Bcrypt
  
  // Profil
  firstName         String
  lastName          String
  phone             String?
  
  // Rôle
  role              UserRole
  
  // Pour PARTNER
  moverId           String?
  mover             Mover?      @relation(fields: [moverId], references: [id])
  
  // Statut
  active            Boolean     @default(true)
  emailVerified     Boolean     @default(false)
  
  // Métadonnées
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  lastLoginAt       DateTime?
  
  // Relations
  validatedQuotes   Quote[]     @relation("ValidatedBy")
  sentEmails        EmailLog[]  @relation("SentBy")
  
  @@index([email])
  @@index([role, active])
  @@index([moverId])
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
model EmailLog {
  id                String        @id @default(uuid())
  
  // Type
  type              EmailType
  
  // Destinataire
  recipient         String
  
  // Contenu
  subject           String
  bodyHtml          String        @db.Text
  
  // Relations
  folderId          String?
  moverId           String?
  
  // Envoyé par (pour validation admin)
  sentBy            String?
  sentByUser        User?         @relation("SentBy", fields: [sentBy], references: [id])
  
  // Statut
  status            EmailStatus   @default(PENDING)
  
  // Tracking
  sentAt            DateTime?
  deliveredAt       DateTime?
  openedAt          DateTime?
  clickedAt         DateTime?
  bouncedAt         DateTime?
  failedAt          DateTime?
  errorMessage      String?
  
  // Provider
  providerMessageId String?       // ID Resend/Postmark
  
  // Métadonnées
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@index([type, status])
  @@index([folderId])
  @@index([moverId])
  @@index([recipient])
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
4. **Mover cascade** : Si mover supprimé, ses PricingGrid sont supprimés
5. **Folder cascade** : Si folder supprimé, ses quotes sont supprimés
6. **SIRET unique** : Un déménageur = un SIRET unique
7. **Email unique** : Client email unique, User email unique

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

