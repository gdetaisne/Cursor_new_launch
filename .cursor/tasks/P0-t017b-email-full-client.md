# P0-t017b — Client Email Complet (Rédaction, Réception, Réponses)

**Statut** : 🟡 TODO  
**Priorité** : P0  
**Dépendances** : P0-t017a ✅ (Email MVP SMTP)

---

## 🎯 Objectif

Transformer le système email en client complet permettant de :
1. **Rédiger et envoyer** des emails (avec brouillons)
2. **Recevoir et lire** des emails entrants
3. **Répondre** à un email
4. **Configurer une signature** personnalisée

---

## 📋 Spécifications détaillées

### 1️⃣ Rédaction et envoi d'emails

#### Backend

**Modèle `EmailDraft` (Prisma)**
```prisma
model EmailDraft {
  id            String    @id @default(uuid())
  
  // Destinataires
  to            String[]  // ["email1@example.com", "email2@example.com"]
  cc            String[]  @default([])
  bcc           String[]  @default([])
  
  // Contenu
  subject       String
  bodyHtml      String    @db.Text
  
  // Relations
  authorId      String
  author        User      @relation("DraftAuthor", fields: [authorId], references: [id], onDelete: Cascade)
  
  folderId      String?
  folder        Folder?   @relation(fields: [folderId], references: [id], onDelete: SetNull)
  
  // Email parent (si réponse)
  inReplyToId   String?
  inReplyTo     EmailLog? @relation("EmailReplies", fields: [inReplyToId], references: [id], onDelete: SetNull)
  
  // Métadonnées
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([authorId])
  @@index([folderId])
}
```

**Routes**
```typescript
POST   /api/emails/drafts          // Créer un brouillon
GET    /api/emails/drafts          // Lister mes brouillons
GET    /api/emails/drafts/:id      // Récupérer un brouillon
PATCH  /api/emails/drafts/:id      // Mettre à jour un brouillon
DELETE /api/emails/drafts/:id      // Supprimer un brouillon
POST   /api/emails/drafts/:id/send // Envoyer un brouillon (→ EmailLog)
```

**Schéma Zod `emailDraftSchema`**
```typescript
{
  to: z.array(z.string().email()).min(1),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().min(1),
  bodyHtml: z.string().min(1),
  folderId: z.string().uuid().optional(),
  inReplyToId: z.string().uuid().optional(),
}
```

#### Frontend

**Page `/admin/emails/compose`**
- Éditeur WYSIWYG (TinyMCE Cloud ou Quill)
- Champs : To, Cc, Bcc, Subject, Body
- Boutons :
  - "Envoyer" → POST `/send`
  - "Enregistrer brouillon" → POST/PATCH `/drafts`
  - "Annuler"
- Auto-save toutes les 30s
- Insertion signature (configurable)

**Page `/admin/emails/drafts`**
- Liste des brouillons avec preview
- Actions : Éditer, Supprimer, Envoyer

---

### 2️⃣ Réception et lecture d'emails

#### Backend

**Modèle `EmailInbound` (Prisma)**
```prisma
model EmailInbound {
  id                String    @id @default(uuid())
  
  // Metadata email
  messageId         String    @unique  // <xxx@gmail.com>
  from              String
  to                String[]
  cc                String[]  @default([])
  subject           String
  bodyHtml          String?   @db.Text
  bodyText          String?   @db.Text
  
  // Threading
  inReplyTo         String?   // Message-ID du parent
  references        String[]  @default([]) // Chaîne complète
  threadId          String?   // Pour grouper conversations
  
  // Pièces jointes
  attachments       Json?     // [{filename, url, size, contentType}]
  
  // Relations
  folderId          String?
  folder            Folder?   @relation(fields: [folderId], references: [id], onDelete: SetNull)
  
  assignedToId      String?
  assignedTo        User?     @relation("AssignedEmails", fields: [assignedToId], references: [id], onDelete: SetNull)
  
  // Statut
  isRead            Boolean   @default(false)
  isArchived        Boolean   @default(false)
  isSpam            Boolean   @default(false)
  
  // Matching automatique
  matchedAt         DateTime?
  matchedBy         String?   // "auto" | "manual"
  matchConfidence   Float?    // 0-1 si ML
  
  // Métadonnées
  receivedAt        DateTime  @default(now())
  createdAt         DateTime  @default(now())
  
  @@index([folderId])
  @@index([threadId])
  @@index([from])
  @@index([receivedAt])
}
```

**Routes**
```typescript
GET    /api/emails/inbox               // Lister emails reçus
GET    /api/emails/inbox/:id           // Détail d'un email
PATCH  /api/emails/inbox/:id/read      // Marquer comme lu
PATCH  /api/emails/inbox/:id/archive   // Archiver
PATCH  /api/emails/inbox/:id/assign    // Assigner à un dossier
POST   /api/emails/inbox/:id/reply     // Répondre (→ créer draft pré-rempli)
```

**Webhook pour emails entrants**

Option A : **Gmail API + Pub/Sub** (gratuit, complexe)
Option B : **Hostinger IMAP polling** (simple, 5min delay)
Option C : **Resend Webhooks** (payant, instant)

**Recommandation MVP** : IMAP polling (cron job toutes les 5min)

```typescript
// backend/src/jobs/email-poller.ts
import Imap from 'imap';

async function pollInbox() {
  const imap = new Imap({
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    host: process.env.IMAP_HOST || 'imap.hostinger.com',
    port: 993,
    tls: true,
  });
  
  // Fetch new emails since last poll
  // Parse headers, body, attachments
  // Save to EmailInbound
  // Match to Folder if possible (by email, subject keywords)
}
```

#### Frontend

**Page `/admin/emails/inbox`**
- Liste style Gmail : From, Subject, Preview, Date
- Filtres : Non lus, Assignés, Archivés
- Recherche full-text
- Badge "non lu" (count)
- Click → détail

**Page `/admin/emails/inbox/:id`**
- Affichage complet : Headers, Body HTML/Text, Attachments
- Actions :
  - "Répondre" → Ouvre composer avec `inReplyToId`
  - "Transférer"
  - "Assigner à un dossier"
  - "Archiver"
- Timeline si plusieurs emails dans le thread

---

### 3️⃣ Répondre à un email

#### Backend

**Logique "Reply"**
```typescript
POST /api/emails/inbox/:id/reply

// 1. Récupérer EmailInbound
// 2. Créer EmailDraft avec :
//    - to: [original.from]
//    - subject: "Re: " + original.subject
//    - bodyHtml: signature + "\n\n--- Original ---\n" + original.bodyHtml
//    - inReplyToId: original.id
//    - threadId: original.threadId
// 3. Retourner draft.id
// 4. Frontend redirige vers /compose?draftId=xxx
```

#### Frontend

**Bouton "Répondre"**
- POST `/inbox/:id/reply` → Crée draft
- Redirect vers `/compose?draftId={id}`
- Composer charge le draft avec :
  - To pré-rempli (from original)
  - Subject "Re: ..."
  - Body avec quote de l'email original

---

### 4️⃣ Signature email

#### Backend

**Modèle `User` (ajout)**
```prisma
model User {
  // ... champs existants
  
  emailSignature    String?   @db.Text
  emailSignatureHtml String?  @db.Text
}
```

**Routes**
```typescript
GET    /api/users/me/signature        // Récupérer ma signature
PATCH  /api/users/me/signature        // Mettre à jour ma signature
```

**Schéma**
```typescript
{
  signatureText: z.string().max(500).optional(),
  signatureHtml: z.string().max(2000).optional(),
}
```

#### Frontend

**Page `/admin/settings/signature`**
- Éditeur WYSIWYG pour signature HTML
- Preview en temps réel
- Variables : `{{name}}`, `{{email}}`, `{{phone}}`
- Templates pré-définis :
  - Simple (texte)
  - Professionnel (avec logo)
  - Complet (coordonnées + liens sociaux)

**Insertion automatique**
- Lors de la rédaction d'un email, insérer signature en bas du body
- Option "Inclure signature" (toggle)

---

## 🗂️ Structure des fichiers

```
backend/
├── prisma/
│   └── migrations/
│       └── xxx_add_email_drafts_inbound.sql
├── src/
│   ├── models/
│   │   ├── emailDraft.ts
│   │   └── emailInbound.ts
│   ├── schemas/
│   │   ├── emailDraft.schema.ts
│   │   └── emailInbound.schema.ts
│   ├── services/
│   │   ├── email.service.ts (déjà existe)
│   │   ├── emailDraft.service.ts
│   │   ├── emailInbound.service.ts
│   │   └── emailMatcher.service.ts (matching auto folder)
│   ├── controllers/
│   │   ├── emails.controller.ts (étendre)
│   │   ├── emailDrafts.controller.ts
│   │   └── emailInbox.controller.ts
│   ├── routes/
│   │   ├── emails.routes.ts (étendre)
│   │   ├── emailDrafts.routes.ts
│   │   └── emailInbox.routes.ts
│   ├── jobs/
│   │   └── emailPoller.job.ts (cron IMAP)
│   └── utils/
│       └── emailParser.ts (parse IMAP → EmailInbound)

frontend/
├── src/
│   ├── pages/
│   │   ├── EmailsPage.tsx (déjà existe - liste sent)
│   │   ├── EmailComposePage.tsx (nouveau)
│   │   ├── EmailDraftsPage.tsx (nouveau)
│   │   ├── EmailInboxPage.tsx (nouveau)
│   │   ├── EmailDetailPage.tsx (nouveau)
│   │   └── EmailSignaturePage.tsx (nouveau)
│   ├── components/
│   │   ├── emails/
│   │   │   ├── EmailComposer.tsx (WYSIWYG)
│   │   │   ├── EmailViewer.tsx (affichage HTML safe)
│   │   │   ├── EmailThread.tsx (conversation)
│   │   │   └── SignatureEditor.tsx
│   └── lib/
│       └── emailApi.ts (API calls)
```

---

## 🚀 Plan d'implémentation (phases)

### Phase 1 : Rédaction & Brouillons (2h)
1. ✅ Migration Prisma `EmailDraft`
2. ✅ Routes `/api/emails/drafts`
3. ✅ `EmailComposer` avec TinyMCE Cloud (CDN, no install)
4. ✅ Page `/admin/emails/compose`
5. ✅ Auto-save brouillon (debounce 30s)

### Phase 2 : Signature (30min)
1. ✅ Migration `User.emailSignature`
2. ✅ Routes `/api/users/me/signature`
3. ✅ Page `/admin/settings/signature`
4. ✅ Insertion signature dans composer

### Phase 3 : Réception IMAP (2h)
1. ✅ Migration `EmailInbound`
2. ✅ Service `emailPoller.job.ts` (IMAP)
3. ✅ Cron job toutes les 5min
4. ✅ Parser email → DB
5. ✅ Matching auto folder (regex email/subject)

### Phase 4 : Inbox & Lecture (1h30)
1. ✅ Routes `/api/emails/inbox`
2. ✅ Page `/admin/emails/inbox` (liste)
3. ✅ Page `/admin/emails/inbox/:id` (détail)
4. ✅ Actions : read, archive, assign

### Phase 5 : Réponse & Thread (1h)
1. ✅ Logique "Reply" → create draft
2. ✅ Composer en mode "reply" (quote original)
3. ✅ Affichage thread (group by threadId)

### Phase 6 : Polish & Tests (1h)
1. ✅ Gestion pièces jointes (upload S3/MinIO)
2. ✅ Sanitize HTML (DOMPurify)
3. ✅ Tests E2E (send → receive → reply)
4. ✅ Documentation

**Durée totale estimée** : ~8h

---

## 🧪 Critères d'acceptation

### Must-have (MVP)
- [ ] Composer : rédiger email avec To/Subject/Body (WYSIWYG)
- [ ] Envoyer email → log dans `EmailLog`
- [ ] Brouillon : auto-save + liste brouillons
- [ ] Inbox : voir emails reçus (IMAP polling 5min)
- [ ] Détail email : affichage complet + marquer lu
- [ ] Répondre : créer draft pré-rempli avec quote
- [ ] Signature : configurer + insérer auto dans composer

### Nice-to-have (Phase 2)
- [ ] Pièces jointes (upload/download)
- [ ] Thread complet (conversation groupée)
- [ ] Matching auto folder (ML ou regex)
- [ ] Recherche full-text emails
- [ ] Webhooks Resend (emails instantanés)
- [ ] Templates email pré-définis

---

## 📦 Dépendances NPM

```json
{
  "backend": {
    "imap": "^0.8.19",              // IMAP client
    "mailparser": "^3.6.5",          // Parse MIME emails
    "node-cron": "^3.0.3"            // Cron jobs
  },
  "frontend": {
    "@tinymce/tinymce-react": "^4.3.2",  // WYSIWYG editor (Cloud CDN)
    "dompurify": "^3.0.8",                // Sanitize HTML
    "@types/dompurify": "^3.0.5"
  }
}
```

**Note TinyMCE** : Utiliser Cloud CDN (gratuit jusqu'à 1000 loads/mois) pour éviter config webpack complexe.

---

## 🔐 Sécurité

1. **XSS** : Sanitize HTML reçu avec DOMPurify avant affichage
2. **IMAP credentials** : Jamais exposer `.env` (déjà `.gitignore`)
3. **CSRF** : Token CSRF sur forms (déjà helmet)
4. **Rate limiting** : Max 50 emails/heure par user
5. **Spam detection** : Header `X-Spam-Status` (future)

---

## 📝 Notes techniques

### IMAP vs Webhooks

| Critère          | IMAP Polling        | Resend Webhooks   |
|------------------|---------------------|-------------------|
| Latence          | ~5min               | Instant           |
| Coût             | Gratuit             | $10/mois          |
| Complexité       | Moyenne (cron)      | Simple (HTTP)     |
| Pièces jointes   | ✅ Natif            | ✅ URL signée     |
| **Recommandation** | ✅ **MVP**        | Phase 2           |

### TinyMCE vs Quill

| Critère          | TinyMCE Cloud       | Quill             |
|------------------|---------------------|-------------------|
| Features         | +++                 | ++                |
| UI               | Moderne             | Basique           |
| Poids            | CDN (0kb bundle)    | ~200kb            |
| Config           | Simple (API key)    | Complexe          |
| **Recommandation** | ✅ **MVP**        | Alternative       |

---

## 🎨 UI/UX

**Layout Email**
```
┌─────────────────────────────────────────┐
│ [Compose] [Inbox] [Sent] [Drafts]      │ Tabs
├─────────────────────────────────────────┤
│ 🔍 Recherche...          [Filters ▾]    │ 
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐   │
│ │ From: client@example.com          │   │ Email list
│ │ Subject: Question devis           │   │
│ │ Preview text...            2h ago │   │
│ └───────────────────────────────────┘   │
│ ┌───────────────────────────────────┐   │
│ │ From: demenageur@example.com   ●  │   │ (● = unread)
│ │ Subject: Re: Devis Paris-Lyon     │   │
│ │ Preview text...           15h ago │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Composer**
```
┌─────────────────────────────────────────┐
│ To: [client@example.com              ]  │
│ Cc: [+ Ajouter]  Bcc: [+ Ajouter]       │
│ Subject: [                            ]  │
├─────────────────────────────────────────┤
│ [B] [I] [U] [Link] [Image] [Attach]     │ Toolbar
├─────────────────────────────────────────┤
│                                          │
│  (WYSIWYG editor body)                  │
│                                          │
│                                          │
│  --                                      │
│  Guillaume Stehelin                      │ Signature
│  contact@moverz.fr                       │
├─────────────────────────────────────────┤
│ [Enregistrer brouillon] [Envoyer] ▶     │
└─────────────────────────────────────────┘
```

---

## 🔗 Références

- [Nodemailer IMAP](https://nodemailer.com/extras/mailparser/)
- [TinyMCE Cloud](https://www.tiny.cloud/docs/tinymce/6/cloud-quick-start/)
- [Resend Webhooks](https://resend.com/docs/dashboard/webhooks/introduction)
- [DOMPurify](https://github.com/cure53/DOMPurify)

---

**Créé** : 2025-11-11  
**Auteur** : AI + User  
**Statut** : Prêt pour implémentation

