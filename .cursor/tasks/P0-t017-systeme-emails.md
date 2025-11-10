# P0-t017 — Système d'Emails Bidirectionnel Complet

**Status** : 📋 Ready  
**Priorité** : P0 (Critical pour MVP)  
**Temps estimé** : 4-5h (scope étendu)  
**Dépendances** : P0-t016 (Frontend MVP) ✅

---

## 🎯 Objectif

Implémenter un **système d'emails bidirectionnel complet** pour le back-office :
- ✅ Service d'envoi backend (Resend)
- ✅ **Templates modifiables depuis le front** (éditeur WYSIWYG)
- ✅ **Relances automatiques configurables** (J+1, J+5, etc.)
- ✅ Historique complet dans `EmailLog`
- ✅ **Réception d'emails** (webhooks Resend)
- ✅ **Parsing & rapprochement automatique** (email → dossier)
- ✅ **Détection réponses** (In-Reply-To, References)

---

## 🚨 Fonctionnalités Critiques (Nouvelles Exigences)

### **1️⃣ Templates Modifiables Front**
- Éditeur de templates dans `/admin/email-templates`
- WYSIWYG (TinyMCE, Quill, ou simple textarea)
- Variables dynamiques `{{clientName}}`, `{{amount}}`
- Preview en temps réel
- Versioning (historique modifications)

### **2️⃣ Relances Automatiques Configurables**
- Interface `/admin/automations` pour configurer règles
- Règles : "Envoyer EMAIL_TYPE après X jours si STATUS = Y"
- Exemples :
  - J+1 après création dossier → relance client
  - J+5 si devis non accepté → relance quote
  - J+3 si paiement pending → relance paiement
- BullMQ workers pour exécution
- Boutons ON/OFF, test, logs

### **3️⃣ Trace Complète Tous Mails**
- Chaque email envoyé → `EmailLog` (SENT/FAILED)
- Chaque email reçu → `EmailLog` (RECEIVED)
- Détails : from, to, subject, body, headers, timestamp
- Pièces jointes stockées (S3/MinIO)
- Thread grouping (conversation)

### **4️⃣ Emails Entrants + Rapprochement Dossier**
- Webhook Resend pour emails entrants
- Parsing : extraire from, subject, body, attachments
- **Rapprochement automatique** :
  - Via References/In-Reply-To (si réponse)
  - Via regex dans subject (ex: "[Dossier #123]")
  - Via email sender (client, mover)
  - Via ML/IA (matching contextuel)
- Lien email ↔ folder dans `EmailLog.folderId`
- Notification admin si email orphelin

---

## 📋 Phases d'Implémentation (Révisées)

### **Phase 1 : Service Email Backend + Envoi** (45min)

#### 1.1 Choix Provider + Setup
- ✅ Provider: **Resend** (recommandé, API simple, 100 emails/jour gratuits)
- Alternative: Nodemailer + SMTP
- Installation: `pnpm add resend`
- Var ENV: `RESEND_API_KEY`

#### 1.2 Service `email.service.ts`
Créer `backend/src/services/email.service.ts` :
```typescript
- sendEmail(to, subject, body, type)
- renderTemplate(templateId, variables)
- logEmail(emailLog) → write to EmailLog table
- getEmailHistory(filters)
```

Fonctions principales :
- `sendTemplatedEmail(templateId, to, variables, userId)`
- `sendRawEmail(to, subject, html, text, userId)`
- `listEmailLogs(filters: { page, limit, status, type })`
- `getEmailLogById(id)`

#### 1.3 Routes `/api/emails`
Créer `backend/src/routes/emails.routes.ts` :
```
POST   /api/emails/send              (envoyer email)
POST   /api/emails/send-template     (envoyer depuis template)
GET    /api/emails                   (liste historique)
GET    /api/emails/:id               (détail email log)
```

#### 1.4 Controller `emails.controller.ts`
- Validation Zod (to, subject, body required)
- Appel service
- Retour 201 + emailLog ID

#### 1.5 Schema Zod `email.schema.ts`
```typescript
SendEmailInput:
  - to: email
  - subject: string (min 1)
  - body: string (min 1)
  - type?: EmailType (optionnel)

SendTemplateInput:
  - to: email
  - templateId: string
  - variables: Record<string, string>
```

---

### **Phase 2 : Templates Modifiables** (60min)

#### 2.1 Table `EmailTemplate` en DB
Utiliser le model Prisma existant :
```prisma
model EmailTemplate {
  id          String    @id @default(cuid())
  name        String    // "Quote Request", "Client Reminder"
  type        EmailType
  subject     String    // "Votre devis {{folderName}}"
  bodyHtml    String    @db.Text // HTML template
  bodyText    String    @db.Text // Plain text fallback
  variables   Json      // ["clientName", "folderName", "amount"]
  isActive    Boolean   @default(true)
  version     Int       @default(1)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### 2.2 Routes Templates
Créer `/api/email-templates/*` :
```
GET    /api/email-templates           (liste)
GET    /api/email-templates/:id       (détail)
POST   /api/email-templates           (créer)
PUT    /api/email-templates/:id       (modifier)
DELETE /api/email-templates/:id       (soft delete)
POST   /api/email-templates/:id/preview (preview avec variables)
```

#### 2.3 Frontend : Éditeur Templates
Page `/admin/email-templates` :
- Liste templates (tableau)
- Bouton "+ Nouveau template"
- Modal éditeur avec :
  - Input "Nom"
  - Select "Type" (EmailType enum)
  - Input "Sujet" (avec variables suggérées)
  - **Textarea HTML** ou **TinyMCE** (WYSIWYG)
  - Liste variables disponibles (sidebar)
  - Bouton "Preview" (modal avec rendu)
  - Toggle "Actif/Inactif"

#### 2.4 Variables Dynamiques
Suggestions contextuelles selon type :
```typescript
QUOTE_REQUEST → [clientName, folderName, volume, originCity, destCity, movingDate]
CLIENT_REMINDER → [clientName, folderName, daysElapsed]
PAYMENT_REMINDER → [clientName, amount, dueDate, paymentLink]
```

#### 2.5 Versioning (optionnel mais recommandé)
- Chaque modification crée une nouvelle version
- Garder historique (version 1, 2, 3...)
- Possibilité de rollback

---

### **Phase 3 : Relances Automatiques** (90min)

#### 3.1 Table `AutomationRule`
Créer nouveau model Prisma :
```prisma
model AutomationRule {
  id            String          @id @default(cuid())
  name          String          // "Relance client J+1"
  description   String?
  isActive      Boolean         @default(true)
  
  // Trigger
  triggerEvent  String          // "folder.created", "quote.pending"
  triggerDelay  Int             // Délai en heures (24 = J+1)
  
  // Conditions
  conditions    Json            // { "status": "PENDING", "quotesCount": 0 }
  
  // Action
  actionType    String          // "SEND_EMAIL"
  emailTemplateId String?
  emailTemplate   EmailTemplate? @relation(fields: [emailTemplateId], references: [id])
  
  // Stats
  executionsCount Int           @default(0)
  lastRunAt       DateTime?
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  @@index([isActive])
}
```

#### 3.2 Interface Configuration
Page `/admin/automations` (étendre l'existante) :
- Section "Email Automations"
- Liste règles (tableau)
- Bouton "+ Nouvelle règle"
- Modal éditeur :
  ```
  [Nom de la règle]
  [Description]
  
  📅 Déclencheur :
    - Événement : [Select: folder.created, quote.pending, ...]
    - Délai : [Input: 1] [Select: jours/heures]
  
  🎯 Conditions :
    - Si statut = [Select: PENDING, ACTIVE, ...]
    - Si nombre devis < [Input: 1]
    - [+ Ajouter condition]
  
  ✉️ Action :
    - Envoyer email : [Select template]
    - À : [Select: client, mover, admin]
  
  [Toggle: Actif]
  ```

#### 3.3 BullMQ Worker
Créer `backend/src/workers/email-automation.worker.ts` :
```typescript
import { Queue, Worker } from 'bullmq';

// Queue : check-automations (cron toutes les heures)
const checkAutomationsQueue = new Queue('check-automations');

// Worker
const worker = new Worker('check-automations', async (job) => {
  const rules = await getActiveRules();
  
  for (const rule of rules) {
    const candidates = await findCandidates(rule);
    
    for (const candidate of candidates) {
      if (shouldExecute(rule, candidate)) {
        await executeRule(rule, candidate);
      }
    }
  }
});
```

Logique `shouldExecute` :
```typescript
function shouldExecute(rule, folder) {
  // Vérifier si déjà envoyé (éviter duplicates)
  const alreadySent = await EmailLog.findFirst({
    where: {
      folderId: folder.id,
      type: rule.emailTemplate.type,
      sentAt: { gte: folder.createdAt }
    }
  });
  
  if (alreadySent) return false;
  
  // Vérifier délai
  const hoursSinceCreation = (Date.now() - folder.createdAt) / 3600000;
  if (hoursSinceCreation < rule.triggerDelay) return false;
  
  // Vérifier conditions
  if (rule.conditions.status && folder.status !== rule.conditions.status) {
    return false;
  }
  
  return true;
}
```

#### 3.4 Cron Job
Setup cron (toutes les heures) :
```typescript
// Dans server.ts
import { checkAutomationsQueue } from './workers/email-automation.worker';

// Ajouter job récurrent
await checkAutomationsQueue.add(
  'check-automations',
  {},
  { repeat: { pattern: '0 * * * *' } } // Toutes les heures
);
```

---

### **Phase 4 : Réception Emails + Webhooks** (90min)

#### 4.1 Webhook Resend
Configurer Resend pour recevoir emails :
- Dashboard Resend → Settings → Inbound Emails
- Créer domaine inbound : `inbox@moverz.com`
- Webhook URL : `https://api.moverz.com/webhooks/resend/inbound`

#### 4.2 Route Webhook
Créer `backend/src/routes/webhooks.routes.ts` :
```typescript
router.post('/webhooks/resend/inbound', async (req, res) => {
  const { from, to, subject, html, text, headers, attachments } = req.body;
  
  // 1. Créer EmailLog (RECEIVED)
  const emailLog = await createReceivedEmail({
    from,
    to,
    subject,
    bodyHtml: html,
    bodyText: text,
    headers,
    status: 'RECEIVED',
  });
  
  // 2. Rapprocher avec un dossier
  const folder = await matchEmailToFolder(emailLog);
  
  if (folder) {
    await updateEmailLog(emailLog.id, { folderId: folder.id });
    // Notification admin ?
  } else {
    // Email orphelin → alerter admin
    await notifyOrphanEmail(emailLog);
  }
  
  // 3. Stocker attachments (S3/MinIO)
  if (attachments) {
    await storeAttachments(emailLog.id, attachments);
  }
  
  res.status(200).json({ received: true });
});
```

#### 4.3 Matching Email → Folder
Créer `backend/src/services/email-matching.service.ts` :
```typescript
async function matchEmailToFolder(emailLog: EmailLog) {
  // 1. Via References/In-Reply-To (si réponse)
  const references = emailLog.headers['references'];
  if (references) {
    const originalEmail = await findEmailByMessageId(references);
    if (originalEmail?.folderId) {
      return originalEmail.folder;
    }
  }
  
  // 2. Via regex dans subject
  const folderIdMatch = emailLog.subject.match(/\[Dossier #(\w+)\]/);
  if (folderIdMatch) {
    return await Folder.findUnique({ where: { id: folderIdMatch[1] } });
  }
  
  // 3. Via email sender
  const sender = emailLog.from;
  
  // Client ?
  const client = await Client.findFirst({ where: { email: sender } });
  if (client) {
    // Dernier dossier actif du client
    return await Folder.findFirst({
      where: { clientId: client.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // Mover ?
  const mover = await Mover.findFirst({ where: { email: sender } });
  if (mover) {
    // Dernier quote pending du mover
    const quote = await Quote.findFirst({
      where: { moverId: mover.id, status: 'PENDING' },
      include: { folder: true },
      orderBy: { createdAt: 'desc' }
    });
    return quote?.folder;
  }
  
  // 4. Via IA (optionnel, Phase future)
  // const folder = await aiMatchEmail(emailLog);
  
  return null; // Orphelin
}
```

#### 4.4 Frontend : Afficher Emails Entrants
Page `/admin/emails` (étendre) :
- Onglets : "Envoyés" | "Reçus" | "Tous"
- Badge "Orphelin" si pas de folderId
- Bouton "Associer manuellement" → modal pour choisir dossier
- Clic → modal détail :
  ```
  De : jean.dupont@example.com
  À : inbox@moverz.com
  Objet : Re: Votre déménagement
  
  [Corps HTML rendu]
  
  📁 Dossier associé : Déménagement Dupont [Lien]
  
  📎 Pièces jointes :
    - facture.pdf (235 KB) [Download]
  ```

---

### **Phase 5 : Frontend Avancé** (45min)

#### 2.1 Créer Templates HTML
Créer `backend/src/templates/emails/` :

**Templates à créer** :
1. `quote-request.html` (demande devis au déménageur)
2. `client-reminder.html` (relance client)
3. `quote-accepted.html` (devis accepté → notification mover)
4. `payment-confirmation.html` (paiement confirmé)
5. `welcome-mover.html` (bienvenue nouveau déménageur)

**Variables dynamiques** :
- `{{clientName}}`
- `{{folderName}}`
- `{{volume}}`
- `{{originCity}}`
- `{{destinationCity}}`
- `{{amount}}`
- `{{date}}`

#### 2.2 Template Engine
Utiliser simple `String.replace()` ou `Handlebars` :
```typescript
function renderTemplate(html: string, vars: Record<string, string>) {
  let result = html;
  Object.entries(vars).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
}
```

#### 2.3 Stocker Templates
**Option A** : Fichiers `.html` (simple, recommandé pour MVP)
**Option B** : Table `EmailTemplate` en DB (plus flexible)

Pour MVP : **Option A** (fichiers)

---

#### 5.1 Page Email Templates
Créer `frontend/src/pages/EmailTemplatesPage.tsx` :
- Tableau templates
- Bouton "+ Nouveau"
- Modal éditeur (TinyMCE ou textarea)
- Preview modal
- Toggle actif/inactif

#### 5.2 Page Automations (étendre)
Ajouter section "Email Automations" dans `AutomationsPage.tsx` :
- Tableau règles
- Bouton "+ Nouvelle règle"
- Modal configuration (voir Phase 3.2)
- Logs exécutions

#### 5.3 Page Emails (complète)
`EmailsPage.tsx` avec :
- Onglets Envoyés/Reçus/Tous
- Stats : envoyés, reçus, taux ouverture, bounces
- Filtres avancés
- Thread grouping (conversations)
- Détail email (modal)

---

### **Phase 6 : Intégration Backend ↔ Frontend** (30min)

#### 6.1 Service API Frontend (complet)
Créer `frontend/src/services/api.ts` :
```typescript
export async function sendEmail(data: {
  to: string;
  subject: string;
  body: string;
  type?: string;
}) {
  return axios.post('/api/emails/send', data);
}

export async function fetchEmailLogs(filters: {
  page: number;
  limit: number;
  status?: string;
}) {
  return axios.get('/api/emails', { params: filters });
}
```

export async function fetchEmailTemplates() {
  return axios.get('/api/email-templates');
}

export async function createEmailTemplate(data: any) {
  return axios.post('/api/email-templates', data);
}

export async function updateEmailTemplate(id: string, data: any) {
  return axios.put(`/api/email-templates/${id}`, data);
}

export async function fetchAutomationRules() {
  return axios.get('/api/automation-rules');
}

export async function createAutomationRule(data: any) {
  return axios.post('/api/automation-rules', data);
}
```

#### 6.2 Connecter AIMailComposer
Modifier `frontend/src/components/ui/AIMailComposer.tsx` :
```typescript
const handleSend = async () => {
  try {
    await sendEmail({
      to: context.clientEmail,
      subject,
      body,
      type: 'CLIENT_REMINDER',
    });
    toast.success('Email envoyé !');
    onClose();
  } catch (error) {
    toast.error('Erreur envoi email');
  }
};
```

---

### **Phase 7 : Tests & Validation** (30min)

#### 7.1 Tests Manuels Complets
Créer `frontend/src/pages/EmailsPage.tsx` :
- Liste des emails envoyés (EmailLog)
- Filtres : statut (SENT, FAILED), type, date
- Stats : Total envoyé, Taux succès, Bounces
- Détail email : to, subject, body, status, timestamp
- Timeline similaire à LogsPage

Structure :
```
- Stats Cards (4 KPIs)
- Filtres (search + status + type + date range)
- Table ou Timeline
- Modal détail au clic
```

---

**Test 1 : Envoi Email**
```bash
curl -X POST http://localhost:3001/api/emails/send \
  -H "x-user-id: admin" \
  -d '{ "to": "test@example.com", "subject": "Test", "body": "Hello" }'
```

**Test 2 : Créer Template**
- Aller sur `/admin/email-templates`
- Créer template "Relance Client"
- Ajouter variables `{{clientName}}`
- Sauvegarder
- Vérifier dans DB

**Test 3 : Relance Auto**
- Créer règle "J+1 après création folder"
- Template = "Relance Client"
- Délai = 24h
- Créer un folder
- Attendre 1h (ou modifier delay pour test)
- Vérifier email envoyé

**Test 4 : Email Entrant**
- Envoyer email à `inbox@moverz.com`
- Vérifier webhook reçu
- Vérifier EmailLog créé (RECEIVED)
- Vérifier rapprochement dossier
- Voir dans `/admin/emails`

**Test 5 : Réponse Email**
- Envoyer email depuis système
- Répondre à cet email
- Vérifier thread grouping
- Vérifier folderId correct

---

### **Phase 8 : Optimisations & Polish** (30min)

#### 8.1 Performance
- Index DB sur `EmailLog.sentAt`, `EmailLog.folderId`
- Pagination emails (limite 50 par page)
- Cache templates (Redis)

#### 8.2 UX
- Loading states partout
- Toast notifications (email envoyé, erreur)
- Confirmation avant delete template
- Preview avant envoi

#### 8.3 Sécurité
- Rate limit webhook (éviter spam)
- Validation email addresses (Zod)
- Sanitize HTML (contre XSS)
- DKIM/SPF check (emails entrants)

---

## 🛠️ Stack Technique (Mise à Jour)

**Backend** :
- **Resend** (envoi + webhooks inbound)
- **BullMQ** (workers automatisations)
- **Redis** (queue BullMQ)
- Prisma (EmailLog, EmailTemplate, AutomationRule)
- S3/MinIO (pièces jointes)

**Frontend** :
- **TinyMCE** ou **Quill** (éditeur WYSIWYG)
- Axios (API calls)
- React Query (cache + refetch)
- Toast notifications (react-hot-toast)

**Infra** :
- Redis pour BullMQ (peut être local ou cloud)
- S3 ou MinIO pour attachments
- Webhook endpoint public (ngrok en dev)

---

## 📊 Critères de Succès (Étendus)

- [ ] ✅ Service email backend fonctionnel
- [ ] ✅ Templates modifiables depuis `/admin/email-templates`
- [ ] ✅ Relances auto configurables dans `/admin/automations`
- [ ] ✅ Tous emails logged (envoyés + reçus)
- [ ] ✅ Webhook Resend configuré
- [ ] ✅ Emails entrants rapprochés automatiquement
- [ ] ✅ Interface associer manuellement si orphelin
- [ ] ✅ Thread grouping (conversations)
- [ ] ✅ Pièces jointes stockées et téléchargeables
- [ ] ✅ BullMQ worker fonctionne (cron toutes les heures)
- [ ] ✅ Tests manuels OK (8 tests)
- [ ] ✅ Build prod OK

---

## 🚀 Commandes Rapides (Mises à Jour)

```bash
# Backend - Dépendances
cd backend
pnpm add resend bullmq ioredis

# Créer services
touch src/services/email.service.ts
touch src/services/email-matching.service.ts
touch src/services/automation-rules.service.ts

# Créer routes
touch src/routes/emails.routes.ts
touch src/routes/email-templates.routes.ts
touch src/routes/automation-rules.routes.ts
touch src/routes/webhooks.routes.ts

# Créer controllers
touch src/controllers/emails.controller.ts
touch src/controllers/email-templates.controller.ts
touch src/controllers/automation-rules.controller.ts

# Créer workers
mkdir -p src/workers
touch src/workers/email-automation.worker.ts

# Schemas
touch src/schemas/email.schema.ts
touch src/schemas/email-template.schema.ts
touch src/schemas/automation-rule.schema.ts

# Frontend
cd ../frontend
pnpm add @tinymce/tinymce-react react-hot-toast

# Pages
touch src/pages/EmailTemplatesPage.tsx
touch src/pages/EmailsPage.tsx  # (déjà existe, étendre)

# Services
touch src/services/api.ts
```

---

## 📝 Migrations Prisma Nécessaires

```bash
cd backend

# 1. Ajouter colonnes à EmailLog
# - direction (OUTBOUND, INBOUND)
# - messageId (pour threading)
# - inReplyTo, references (headers)
# - attachmentsUrl (JSON ou lien S3)

# 2. Créer table AutomationRule

npx prisma migrate dev --name add-automation-rules
npx prisma migrate dev --name extend-email-log
```

Extrait migrations :
```prisma
// Dans schema.prisma

model EmailLog {
  // ... existant
  direction      EmailDirection @default(OUTBOUND)
  messageId      String?         // Header Message-ID
  inReplyTo      String?         // Header In-Reply-To
  references     String?         // Header References
  attachmentsUrl Json?           // URLs des pièces jointes
}

enum EmailDirection {
  OUTBOUND
  INBOUND
}

model AutomationRule {
  id              String         @id @default(cuid())
  name            String
  description     String?
  isActive        Boolean        @default(true)
  triggerEvent    String         // "folder.created"
  triggerDelay    Int            // Heures
  conditions      Json           // Conditions dynamiques
  actionType      String         // "SEND_EMAIL"
  emailTemplateId String?
  emailTemplate   EmailTemplate? @relation(fields: [emailTemplateId], references: [id])
  executionsCount Int            @default(0)
  lastRunAt       DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@index([isActive])
}
```

---

## ⏱️ Temps Estimé Révisé

| Phase | Temps | Cumul |
|-------|-------|-------|
| 1. Service Email Backend | 45min | 45min |
| 2. Templates Modifiables | 60min | 1h45 |
| 3. Relances Automatiques | 90min | 3h15 |
| 4. Webhooks + Réception | 90min | 4h45 |
| 5. Frontend Avancé | 45min | 5h30 |
| 6. Intégration | 30min | 6h |
| 7. Tests | 30min | 6h30 |
| 8. Polish | 30min | 7h |

**TOTAL : ~7h** (au lieu de 1h15)

C'est une **vraie feature majeure** ! 🚀

---

## 🎯 Plan de Déploiement Progressif

Vu la complexité, je recommande de **splitter en 2 tasks** :

### **P0-t017a : Emails Base** (2h)
- Phase 1 : Service envoi
- Templates HTML fichiers (pas modifiables)
- EmailLog
- Page `/admin/emails` basique

### **P0-t017b : Emails Avancé** (5h)
- Phase 2 : Templates modifiables
- Phase 3 : Relances auto (BullMQ)
- Phase 4 : Webhooks + réception
- Phase 5-8 : Polish complet

**Avantages** :
- ✅ MVP fonctionnel rapidement (2h)
- ✅ Features avancées après (5h)
- ✅ Moins de risque
- ✅ Testable progressivement

---

## 🔗 Ressources Additionnelles

- [Resend Inbound Emails](https://resend.com/docs/send-with-nodejs#inbound-emails)
- [BullMQ Docs](https://docs.bullmq.io/)
- [TinyMCE React](https://www.tiny.cloud/docs/tinymce/6/react-ref/)
- [Email Threading RFC](https://www.jwz.org/doc/threading.html)
- [MinIO Node.js Client](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html)

---

**Mise à jour le** : 2025-11-10  
**Scope** : Étendu (4 exigences critiques ajoutées)  
**Complexité** : Élevée (7h au lieu de 1h15)
```bash
# Backend
curl -X POST http://localhost:3001/api/emails/send \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-admin" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "Hello from Moverz!"
  }'

# Frontend
- Ouvrir AIMailComposer depuis un dossier
- Générer un email
- Envoyer
- Vérifier dans /admin/emails
```

#### 4.2 Vérifications
- ✅ Email reçu (vérifier inbox)
- ✅ EmailLog créé en DB
- ✅ Status SENT ou FAILED
- ✅ Affichage dans /admin/emails
- ✅ Pas d'erreurs console

---

## 🛠️ Stack Technique

**Backend** :
- **Resend** (provider email)
- Prisma (EmailLog, EmailTemplate)
- Zod (validation)
- Express routes/controllers

**Frontend** :
- Axios (API calls)
- AIMailComposer (modal existante)
- EmailsPage (nouvelle page)

**Env Vars** :
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@moverz.com
```

---

## 📊 Critères de Succès

- [ ] Service email backend fonctionnel
- [ ] Au moins 3 templates HTML créés
- [ ] Routes `/api/emails/*` testées
- [ ] AIMailComposer connecté au backend
- [ ] Page `/admin/emails` affiche historique
- [ ] EmailLog écrit en DB à chaque envoi
- [ ] Email réel reçu en test
- [ ] Build prod OK (TS + linter)

---

## 🚀 Commandes Rapides

```bash
# Backend
cd backend
pnpm add resend

# Créer service
touch src/services/email.service.ts
touch src/routes/emails.routes.ts
touch src/controllers/emails.controller.ts
touch src/schemas/email.schema.ts

# Créer templates
mkdir -p src/templates/emails
touch src/templates/emails/{quote-request,client-reminder,quote-accepted}.html

# Frontend
cd ../frontend
mkdir -p src/services
touch src/services/api.ts
touch src/pages/EmailsPage.tsx
```

---

## 📝 Notes

### Pourquoi Resend ?
- API simple (1 endpoint)
- 100 emails/jour gratuits
- Dashboard avec tracking
- Support React Email (templates JSX)
- Meilleure délivrabilité que SMTP

### Alternative : Nodemailer
Si pas de budget/API externe :
```typescript
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
```

### Templates Avancés (Phase future)
- React Email (JSX → HTML)
- MJML (responsive emails)
- Variables conditionnelles
- Internationalisation

---

## 🔗 Ressources

- [Resend Docs](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resendlabs/resend-node)
- [React Email](https://react.email) (pour templates JSX)
- [MJML](https://mjml.io) (responsive emails)

---

## 🎯 Après cette Task

**Next steps** :
1. **Automatisations** (BullMQ workers pour relances auto)
2. **Webhooks** (tracking opens, clicks, bounces)
3. **Portail Partner** (P2-t010)
4. **Intégration complète Backend ↔ Frontend** (React Query)

---

**Créé le** : 2025-11-10  
**Owner** : Guillaume  
**Reviewer** : N/A

