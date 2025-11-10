# Moverz Back Office — API Documentation

> **Documentation complète des 34 endpoints REST**

**Base URL** : `http://localhost:3001`  
**Version** : 0.1.0  
**Format** : JSON

---

## Table des matières

- [Authentification](#authentification)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Pagination](#pagination)
- [Health Check](#health-check)
- [Folders (Dossiers)](#folders-dossiers)
- [Quotes (Devis)](#quotes-devis)
- [Movers (Déménageurs)](#movers-déménageurs)
- [Clients](#clients)
- [Leads](#leads)
- [Bookings (Réservations)](#bookings-réservations)
- [Payments (Paiements)](#payments-paiements)
- [Codes d'erreur](#codes-derreur)

---

## Authentification

### Mode POC (Développement)

Aucune authentification JWT n'est implémentée. Le backend accepte un header `x-user-id` pour simuler l'authentification :

```bash
curl -H "x-user-id: dev-user" http://localhost:3001/api/folders
```

⚠️ **Production** : Implémenter JWT + RBAC (voir `SECURITY.md`)

---

## Gestion des erreurs

### Format standard

Toutes les erreurs suivent ce format :

```json
{
  "error": "Error Type",
  "message": "Description de l'erreur",
  "stack": "Stack trace (dev uniquement)"
}
```

### Codes HTTP

| Code | Signification |
|------|---------------|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Requête invalide (validation Zod) |
| `404` | Ressource non trouvée |
| `409` | Conflit (ex: email déjà existant) |
| `429` | Trop de requêtes (rate limit) |
| `500` | Erreur serveur |

### Exemples d'erreurs

**Validation Zod** (400)
```json
{
  "error": "Validation Error",
  "message": "Validation failed: email must be a valid email"
}
```

**Not Found** (404)
```json
{
  "error": "Not Found",
  "message": "Folder not found"
}
```

**Conflict** (409)
```json
{
  "error": "Conflict",
  "message": "Client with this email already exists"
}
```

---

## Pagination

### Query parameters

```
?page=1&limit=10
```

- `page` : Numéro de page (défaut: 1, min: 1)
- `limit` : Nombre d'éléments (défaut: 10, min: 1, max: 100)

### Format de réponse

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

## Health Check

### `GET /health`

Vérifier le statut de l'API et de la base de données.

**Réponse** (200)
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T12:00:00.000Z",
  "database": "connected",
  "environment": "development"
}
```

---

## Folders (Dossiers)

### `POST /api/folders`

Créer un nouveau dossier de déménagement.

**Body**
```json
{
  "clientId": "uuid",
  "originAddress": "10 rue de la Paix",
  "originCity": "Bordeaux",
  "originPostalCode": "33000",
  "destAddress": "20 avenue des Champs",
  "destCity": "Paris",
  "destPostalCode": "75008",
  "movingDate": "2025-12-15T10:00:00.000Z",
  "volume": 25.5,
  "distance": 580.2
}
```

**Réponse** (201)
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "status": "NEW",
  "originCity": "Bordeaux",
  "destCity": "Paris",
  "volume": 25.5,
  "distance": 580.2,
  "createdAt": "2025-11-10T12:00:00.000Z",
  "updatedAt": "2025-11-10T12:00:00.000Z"
}
```

---

### `GET /api/folders`

Lister tous les dossiers (paginés).

**Query params**
- `page` : Numéro de page (défaut: 1)
- `limit` : Éléments par page (défaut: 10)
- `status` : Filtrer par statut (`NEW`, `QUOTES_REQUESTED`, `TOP3_SENT`, etc.)

**Exemple**
```bash
curl "http://localhost:3001/api/folders?page=1&limit=10&status=NEW"
```

**Réponse** (200)
```json
{
  "data": [
    {
      "id": "uuid",
      "clientId": "uuid",
      "status": "NEW",
      "originCity": "Bordeaux",
      "destCity": "Paris",
      "volume": 25.5,
      "createdAt": "2025-11-10T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### `GET /api/folders/:id`

Récupérer un dossier par son ID.

**Réponse** (200)
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "client": {
    "id": "uuid",
    "email": "client@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  },
  "status": "QUOTES_REQUESTED",
  "originAddress": "10 rue de la Paix",
  "originCity": "Bordeaux",
  "originPostalCode": "33000",
  "destAddress": "20 avenue des Champs",
  "destCity": "Paris",
  "destPostalCode": "75008",
  "movingDate": "2025-12-15T10:00:00.000Z",
  "volume": 25.5,
  "distance": 580.2,
  "selectedQuoteId": null,
  "createdAt": "2025-11-10T12:00:00.000Z",
  "updatedAt": "2025-11-10T12:00:00.000Z",
  "quotes": [
    {
      "id": "uuid",
      "moverId": "uuid",
      "status": "RECEIVED",
      "totalPrice": 1500.00,
      "scoreTotal": 85.5
    }
  ]
}
```

---

### `PATCH /api/folders/:id`

Mettre à jour un dossier existant.

**Body** (tous les champs optionnels)
```json
{
  "status": "TOP3_SENT",
  "movingDate": "2025-12-20T10:00:00.000Z",
  "volume": 28.0
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "status": "TOP3_SENT",
  "volume": 28.0,
  "updatedAt": "2025-11-10T13:00:00.000Z"
}
```

---

### `POST /api/folders/:id/select-quote`

Sélectionner un devis pour un dossier (choix du client).

**Body**
```json
{
  "quoteId": "uuid"
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "selectedQuoteId": "uuid",
  "status": "QUOTE_SELECTED",
  "updatedAt": "2025-11-10T14:00:00.000Z"
}
```

---

### `DELETE /api/folders/:id`

Soft delete d'un dossier.

**Réponse** (200)
```json
{
  "id": "uuid",
  "deletedAt": "2025-11-10T15:00:00.000Z"
}
```

---

### `GET /api/folders/:folderId/quotes`

Lister tous les devis d'un dossier spécifique.

**Réponse** (200)
```json
{
  "data": [
    {
      "id": "uuid",
      "folderId": "uuid",
      "moverId": "uuid",
      "status": "RECEIVED",
      "totalPrice": 1500.00,
      "scorePrice": 80.0,
      "scoreGoogle": 90.0,
      "scoreFinancial": 85.0,
      "scoreTotal": 85.0,
      "createdAt": "2025-11-10T12:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

## Quotes (Devis)

### `POST /api/quotes`

Créer un nouveau devis.

**Body**
```json
{
  "folderId": "uuid",
  "moverId": "uuid",
  "totalPrice": 1500.50,
  "depositAmount": 450.15,
  "currency": "EUR",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "pdfUrl": "https://s3.amazonaws.com/quotes/quote-123.pdf"
}
```

**Réponse** (201)
```json
{
  "id": "uuid",
  "folderId": "uuid",
  "moverId": "uuid",
  "status": "RECEIVED",
  "totalPrice": 1500.50,
  "depositAmount": 450.15,
  "scoreTotal": null,
  "createdAt": "2025-11-10T12:00:00.000Z"
}
```

---

### `GET /api/quotes`

Lister tous les devis (paginés).

**Query params**
- `page`, `limit` : Pagination
- `status` : Filtrer par statut (`REQUESTED`, `RECEIVED`, `VALIDATED`, etc.)
- `folderId` : Filtrer par dossier

**Exemple**
```bash
curl "http://localhost:3001/api/quotes?status=VALIDATED&page=1&limit=10"
```

**Réponse** (200)
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### `GET /api/quotes/:id`

Récupérer un devis par son ID.

**Réponse** (200)
```json
{
  "id": "uuid",
  "folderId": "uuid",
  "folder": {
    "id": "uuid",
    "client": { "firstName": "Jean", "lastName": "Dupont" },
    "originCity": "Bordeaux",
    "destCity": "Paris"
  },
  "moverId": "uuid",
  "mover": {
    "id": "uuid",
    "companyName": "Déménagements Pro",
    "email": "contact@demenpro.fr",
    "googleRating": 4.5,
    "googleReviewsCount": 120
  },
  "status": "VALIDATED",
  "totalPrice": 1500.50,
  "depositAmount": 450.15,
  "scorePrice": 85.0,
  "scoreGoogle": 90.0,
  "scoreFinancial": 80.0,
  "scoreLitigation": 100.0,
  "scoreTotal": 88.75,
  "validatedByUserId": "uuid",
  "validatedAt": "2025-11-10T12:30:00.000Z",
  "pdfUrl": "https://...",
  "createdAt": "2025-11-10T12:00:00.000Z"
}
```

---

### `PATCH /api/quotes/:id`

Mettre à jour un devis existant.

**Body** (tous champs optionnels)
```json
{
  "totalPrice": 1450.00,
  "depositAmount": 435.00,
  "validUntil": "2026-01-15T23:59:59.000Z"
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "totalPrice": 1450.00,
  "updatedAt": "2025-11-10T13:00:00.000Z"
}
```

---

### `POST /api/quotes/:id/validate`

Valider un devis manuellement (admin).

**Body**
```json
{
  "validatedByUserId": "uuid"
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "status": "VALIDATED",
  "validatedByUserId": "uuid",
  "validatedAt": "2025-11-10T14:00:00.000Z"
}
```

---

### `POST /api/quotes/:id/score`

Calculer/mettre à jour le score global d'un devis.

**Body**
```json
{
  "scorePrice": 85.0,
  "scoreGoogle": 90.0,
  "scoreFinancial": 80.0,
  "scoreLitigation": 100.0
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "scorePrice": 85.0,
  "scoreGoogle": 90.0,
  "scoreFinancial": 80.0,
  "scoreLitigation": 100.0,
  "scoreTotal": 88.75,
  "updatedAt": "2025-11-10T14:30:00.000Z"
}
```

---

### `POST /api/quotes/:id/remind`

Envoyer une relance pour un devis non reçu.

**Body**
```json
{
  "emailType": "REMINDER_1"
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "lastRemindedAt": "2025-11-10T15:00:00.000Z",
  "remindersCount": 1
}
```

---

### `DELETE /api/quotes/:id`

Soft delete d'un devis.

**Réponse** (200)
```json
{
  "id": "uuid",
  "deletedAt": "2025-11-10T15:30:00.000Z"
}
```

---

## Movers (Déménageurs)

### `POST /api/movers`

Créer un nouveau déménageur.

**Body**
```json
{
  "companyName": "Déménagements Pro",
  "siret": "12345678901234",
  "email": "contact@demenpro.fr",
  "phone": "0601020304",
  "address": "10 rue de la Logistique",
  "city": "Bordeaux",
  "postalCode": "33000",
  "googlePlaceId": "ChIJ...",
  "googleRating": 4.5,
  "googleReviewsCount": 120
}
```

**Réponse** (201)
```json
{
  "id": "uuid",
  "companyName": "Déménagements Pro",
  "siret": "12345678901234",
  "email": "contact@demenpro.fr",
  "status": "ACTIVE",
  "googleRating": 4.5,
  "createdAt": "2025-11-10T12:00:00.000Z"
}
```

---

### `GET /api/movers`

Lister tous les déménageurs (paginés).

**Query params**
- `page`, `limit` : Pagination
- `status` : Filtrer par statut (`ACTIVE`, `BLACKLISTED`)
- `city` : Filtrer par ville

**Réponse** (200)
```json
{
  "data": [
    {
      "id": "uuid",
      "companyName": "Déménagements Pro",
      "email": "contact@demenpro.fr",
      "status": "ACTIVE",
      "googleRating": 4.5,
      "city": "Bordeaux"
    }
  ],
  "pagination": { ... }
}
```

---

### `GET /api/movers/:id`

Récupérer un déménageur par son ID.

**Réponse** (200)
```json
{
  "id": "uuid",
  "companyName": "Déménagements Pro",
  "siret": "12345678901234",
  "email": "contact@demenpro.fr",
  "phone": "0601020304",
  "address": "10 rue de la Logistique",
  "city": "Bordeaux",
  "postalCode": "33000",
  "status": "ACTIVE",
  "googlePlaceId": "ChIJ...",
  "googleRating": 4.5,
  "googleReviewsCount": 120,
  "creditsafeScore": "A",
  "creditsafeData": { ... },
  "createdAt": "2025-11-10T12:00:00.000Z",
  "pricingGrids": [
    {
      "id": "uuid",
      "zonePrefix": "33",
      "basePrice": 500.00,
      "pricePerM3": 25.00,
      "pricePerKm": 1.50
    }
  ]
}
```

---

### `PATCH /api/movers/:id`

Mettre à jour un déménageur.

**Body** (tous champs optionnels)
```json
{
  "email": "nouveau@email.fr",
  "phone": "0699887766",
  "googleRating": 4.6
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "email": "nouveau@email.fr",
  "updatedAt": "2025-11-10T13:00:00.000Z"
}
```

---

### `POST /api/movers/:id/blacklist`

Blacklister un déménageur (ou le retirer de la blacklist).

**Body**
```json
{
  "reason": "Avis négatifs récurrents"
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "status": "BLACKLISTED",
  "blacklistedAt": "2025-11-10T14:00:00.000Z",
  "blacklistReason": "Avis négatifs récurrents"
}
```

---

### `DELETE /api/movers/:id`

Soft delete d'un déménageur (vérifie qu'il n'a pas de réservations actives).

**Réponse** (200)
```json
{
  "id": "uuid",
  "deletedAt": "2025-11-10T15:00:00.000Z"
}
```

---

## Clients

### `POST /api/clients`

Créer un nouveau client.

**Body**
```json
{
  "email": "client@example.com",
  "phone": "0612345678",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Réponse** (201)
```json
{
  "id": "uuid",
  "email": "client@example.com",
  "phone": "0612345678",
  "firstName": "Jean",
  "lastName": "Dupont",
  "createdAt": "2025-11-10T12:00:00.000Z"
}
```

---

### `GET /api/clients`

Lister tous les clients (paginés).

**Query params**
- `page`, `limit` : Pagination

**Réponse** (200)
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "client@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "createdAt": "2025-11-10T12:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### `GET /api/clients/:id`

Récupérer un client par son ID.

**Réponse** (200)
```json
{
  "id": "uuid",
  "email": "client@example.com",
  "phone": "0612345678",
  "firstName": "Jean",
  "lastName": "Dupont",
  "createdAt": "2025-11-10T12:00:00.000Z",
  "folders": [
    {
      "id": "uuid",
      "status": "NEW",
      "originCity": "Bordeaux",
      "destCity": "Paris"
    }
  ]
}
```

---

### `PATCH /api/clients/:id`

Mettre à jour un client.

**Body** (tous champs optionnels)
```json
{
  "phone": "0699887766",
  "firstName": "Jean-Pierre"
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "phone": "0699887766",
  "firstName": "Jean-Pierre",
  "updatedAt": "2025-11-10T13:00:00.000Z"
}
```

---

### `POST /api/clients/:id/anonymize`

Anonymiser un client (RGPD).

**Body**
```json
{
  "reason": "Demande RGPD client"
}
```

**Réponse** (200)
```json
{
  "id": "uuid",
  "email": "deleted-{uuid}@anonymized.local",
  "phone": null,
  "firstName": "Anonymized",
  "lastName": "User",
  "deletedAt": "2025-11-10T14:00:00.000Z"
}
```

---

## Leads

### `POST /api/leads`

Créer un nouveau lead (capture initiale).

**Body**
```json
{
  "source": "bordeaux-demenageur.fr",
  "email": "prospect@example.com",
  "phone": "0612345678",
  "firstName": "Marie",
  "lastName": "Martin",
  "originAddress": "5 rue du Commerce",
  "originCity": "Bordeaux",
  "originPostalCode": "33000",
  "destAddress": "12 avenue de la République",
  "destCity": "Lyon",
  "destPostalCode": "69001",
  "estimatedVolume": 30.5,
  "estimationMethod": "FORM",
  "movingDate": "2025-12-01T09:00:00.000Z"
}
```

**Réponse** (201)
```json
{
  "id": "uuid",
  "source": "bordeaux-demenageur.fr",
  "email": "prospect@example.com",
  "firstName": "Marie",
  "lastName": "Martin",
  "status": "NEW",
  "estimatedVolume": 30.5,
  "createdAt": "2025-11-10T12:00:00.000Z"
}
```

---

### `GET /api/leads`

Lister tous les leads (paginés).

**Query params**
- `page`, `limit` : Pagination
- `status` : Filtrer par statut (`NEW`, `CONTACTED`, `CONVERTED`)
- `source` : Filtrer par site source

**Réponse** (200)
```json
{
  "data": [
    {
      "id": "uuid",
      "source": "bordeaux-demenageur.fr",
      "email": "prospect@example.com",
      "firstName": "Marie",
      "lastName": "Martin",
      "status": "NEW",
      "createdAt": "2025-11-10T12:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### `GET /api/leads/:id`

Récupérer un lead par son ID.

**Réponse** (200)
```json
{
  "id": "uuid",
  "source": "bordeaux-demenageur.fr",
  "email": "prospect@example.com",
  "phone": "0612345678",
  "firstName": "Marie",
  "lastName": "Martin",
  "originAddress": "5 rue du Commerce",
  "originCity": "Bordeaux",
  "originPostalCode": "33000",
  "destAddress": "12 avenue de la République",
  "destCity": "Lyon",
  "destPostalCode": "69001",
  "estimatedVolume": 30.5,
  "estimationMethod": "FORM",
  "movingDate": "2025-12-01T09:00:00.000Z",
  "status": "NEW",
  "createdAt": "2025-11-10T12:00:00.000Z"
}
```

---

### `POST /api/leads/:id/convert`

Convertir un lead en dossier + client.

**Body** (optionnel)
```json
{
  "adjustedVolume": 32.0,
  "adjustedMovingDate": "2025-12-05T09:00:00.000Z"
}
```

**Réponse** (200)
```json
{
  "lead": {
    "id": "uuid",
    "status": "CONVERTED",
    "convertedAt": "2025-11-10T14:00:00.000Z"
  },
  "client": {
    "id": "uuid",
    "email": "prospect@example.com",
    "firstName": "Marie",
    "lastName": "Martin"
  },
  "folder": {
    "id": "uuid",
    "clientId": "uuid",
    "status": "NEW",
    "volume": 32.0
  }
}
```

---

## Bookings (Réservations)

### `POST /api/bookings`

Créer une réservation confirmée (après choix du client).

**Body**
```json
{
  "folderId": "uuid",
  "quoteId": "uuid",
  "totalAmount": 1500.00,
  "depositAmount": 450.00
}
```

**Validation** : `depositAmount` doit être exactement **30% de `totalAmount`** (tolérance 1 centime).

**Réponse** (201)
```json
{
  "id": "uuid",
  "folderId": "uuid",
  "quoteId": "uuid",
  "status": "PENDING_PAYMENT",
  "totalAmount": 1500.00,
  "depositAmount": 450.00,
  "createdAt": "2025-11-10T14:00:00.000Z"
}
```

---

### `GET /api/bookings`

Lister toutes les réservations (paginées).

**Query params**
- `page`, `limit` : Pagination
- `status` : Filtrer par statut (`PENDING_PAYMENT`, `CONFIRMED`, `IN_PROGRESS`, etc.)

**Réponse** (200)
```json
{
  "data": [
    {
      "id": "uuid",
      "folderId": "uuid",
      "quoteId": "uuid",
      "status": "CONFIRMED",
      "totalAmount": 1500.00,
      "depositAmount": 450.00,
      "createdAt": "2025-11-10T14:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### `GET /api/bookings/:id`

Récupérer une réservation par son ID (inclut folder, quote, payments).

**Réponse** (200)
```json
{
  "id": "uuid",
  "folderId": "uuid",
  "folder": {
    "id": "uuid",
    "client": { "firstName": "Jean", "lastName": "Dupont" },
    "originCity": "Bordeaux",
    "destCity": "Paris"
  },
  "quoteId": "uuid",
  "quote": {
    "id": "uuid",
    "mover": { "companyName": "Déménagements Pro" },
    "totalPrice": 1500.00
  },
  "status": "CONFIRMED",
  "totalAmount": 1500.00,
  "depositAmount": 450.00,
  "createdAt": "2025-11-10T14:00:00.000Z",
  "payments": [
    {
      "id": "uuid",
      "type": "DEPOSIT",
      "amount": 450.00,
      "status": "SUCCEEDED",
      "stripePaymentIntentId": "pi_xxx"
    }
  ]
}
```

---

## Payments (Paiements)

### `POST /api/payments`

Créer un nouveau paiement (généralement un dépôt de 30%).

**Body**
```json
{
  "bookingId": "uuid",
  "type": "DEPOSIT",
  "amount": 450.00,
  "currency": "EUR",
  "stripePaymentIntentId": "pi_xxx",
  "commissionRate": 0.10,
  "idempotencyKey": "payment-{uuid}"
}
```

**Réponse** (201)
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "type": "DEPOSIT",
  "amount": 450.00,
  "currency": "EUR",
  "status": "PENDING",
  "commissionRate": 0.10,
  "commissionAmount": 45.00,
  "moverAmount": 405.00,
  "stripePaymentIntentId": "pi_xxx",
  "createdAt": "2025-11-10T15:00:00.000Z"
}
```

---

### `GET /api/payments`

Lister tous les paiements (paginés).

**Query params**
- `page`, `limit` : Pagination
- `bookingId` : Filtrer par réservation

**Réponse** (200)
```json
{
  "data": [
    {
      "id": "uuid",
      "bookingId": "uuid",
      "type": "DEPOSIT",
      "amount": 450.00,
      "status": "SUCCEEDED",
      "stripePaymentIntentId": "pi_xxx",
      "createdAt": "2025-11-10T15:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

## Codes d'erreur

### Validation Zod (400)

| Message | Cause |
|---------|-------|
| `Invalid email format` | Email mal formaté |
| `Invalid phone format` | Téléphone invalide (ex: pas 10 chiffres) |
| `Invalid postal code` | Code postal invalide |
| `Invalid SIRET` | SIRET invalide (14 chiffres requis) |
| `Volume must be positive` | Volume ≤ 0 |
| `Deposit amount must be exactly 30% of total amount` | Acompte ≠ 30% |

### Erreurs métier (400)

| Message | Cause |
|---------|-------|
| `Mover is blacklisted` | Tentative de créer un devis pour un déménageur blacklisté |
| `Quote must be VALIDATED by admin` | Tentative de créer un booking avec un devis non validé |
| `Only ADMIN or OPERATOR can validate quotes` | User non autorisé |

### Conflits (409)

| Message | Cause |
|---------|-------|
| `Client with this email already exists` | Email déjà utilisé |
| `Mover with this SIRET already exists` | SIRET déjà enregistré |
| `Mover with this email already exists` | Email déménageur déjà utilisé |
| `Folder already has an active booking` | Impossible de créer deux bookings pour le même folder |

### Not Found (404)

| Message | Cause |
|---------|-------|
| `Folder not found` | ID de dossier inexistant ou soft-deleted |
| `Quote not found` | ID de devis inexistant |
| `Mover not found` | ID de déménageur inexistant |
| `Client not found` | ID de client inexistant ou anonymisé |
| `Lead not found` | ID de lead inexistant |

### Rate Limit (429)

| Message | Cause |
|---------|-------|
| `Too many requests from this IP, please try again later` | Dépassement du rate limit (1000 req/15min) |

---

## Exemples d'usage

### Workflow complet (Lead → Booking)

```bash
# 1. Créer un lead
LEAD=$(curl -sS -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "source": "bordeaux-demenageur.fr",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "originCity": "Bordeaux",
    "originPostalCode": "33000",
    "destCity": "Paris",
    "destPostalCode": "75001",
    "estimatedVolume": 25
  }' | jq -r '.id')

# 2. Convertir le lead en client + folder
CONVERSION=$(curl -sS -X POST http://localhost:3001/api/leads/$LEAD/convert)
FOLDER_ID=$(echo $CONVERSION | jq -r '.folder.id')

# 3. Créer un devis
QUOTE=$(curl -sS -X POST http://localhost:3001/api/quotes \
  -H "Content-Type: application/json" \
  -d "{
    \"folderId\": \"$FOLDER_ID\",
    \"moverId\": \"mover-uuid\",
    \"totalPrice\": 1500.00,
    \"depositAmount\": 450.00
  }" | jq -r '.id')

# 4. Valider le devis
curl -sS -X POST http://localhost:3001/api/quotes/$QUOTE/validate \
  -H "Content-Type: application/json" \
  -d '{"validatedByUserId": "admin-uuid"}'

# 5. Sélectionner le devis
curl -sS -X POST http://localhost:3001/api/folders/$FOLDER_ID/select-quote \
  -H "Content-Type: application/json" \
  -d "{\"quoteId\": \"$QUOTE\"}"

# 6. Créer un booking
BOOKING=$(curl -sS -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d "{
    \"folderId\": \"$FOLDER_ID\",
    \"quoteId\": \"$QUOTE\",
    \"totalAmount\": 1500.00,
    \"depositAmount\": 450.00
  }" | jq -r '.id')

# 7. Créer un paiement
curl -sS -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING\",
    \"type\": \"DEPOSIT\",
    \"amount\": 450.00,
    \"stripePaymentIntentId\": \"pi_test_xxx\"
  }"
```

---

## Support

- **Issues GitHub** : [github.com/gdetaisne/Back_Office](https://github.com/gdetaisne/Back_Office)
- **Documentation interne** : `/docs/`
- **Postman Collection** : `backend/postman/` (TODO)

---

**Made with ❤️ by the Moverz Team**

