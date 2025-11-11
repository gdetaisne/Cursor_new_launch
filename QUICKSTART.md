# 🚀 DÉMARRAGE RAPIDE - Moverz Back Office

**Dernière mise à jour** : 2025-11-11

---

## ✅ Ce qui fonctionne

### Phase 1 : Composer + Brouillons (TERMINÉ)
- ✅ Backend API `/api/emails/drafts` (CRUD complet)
- ✅ Envoi d'emails via `/api/emails/drafts/:id/send`
- ✅ Logs dans `EmailLog` (table Prisma)
- ✅ Frontend avec éditeur Quill (WYSIWYG)
- ✅ Auto-save brouillons toutes les 5s
- ✅ SMTP Hostinger configuré

### Configuration actuelle
- **Backend** : `http://localhost:4000`
- **Frontend** : `http://localhost:5000`
- **Database** : PostgreSQL Neon (connecté)
- **SMTP** : Hostinger (guillaume@moverz.fr)

---

## 🚀 Démarrage en 3 commandes

### Option A : Script automatique (recommandé)

```bash
cd /Users/guillaumestehelin/Back_Office
./start.sh
```

### Option B : Manuel (2 terminaux)

**Terminal 1 - Backend :**
```bash
cd /Users/guillaumestehelin/Back_Office/backend
pnpm dev
```

**Terminal 2 - Frontend :**
```bash
cd /Users/guillaumestehelin/Back_Office/frontend
pnpm dev
```

---

## 🧪 Tests rapides

### 1. Santé du backend
```bash
curl http://localhost:4000/health
# Doit retourner: {"status":"ok","database":"connected"}
```

### 2. Créer un brouillon (API)
```bash
curl -X POST http://localhost:4000/api/emails/drafts \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "to": ["test@example.com"],
    "subject": "Test",
    "bodyHtml": "<p>Hello</p>"
  }'
```

### 3. Envoyer un email (API)
```bash
curl -X POST http://localhost:4000/api/emails/send \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "to": "guillaume@moverz.fr",
    "subject": "Test",
    "body": "<p>Test email</p>",
    "type": "CONTACT_EXCHANGE"
  }'
```

### 4. Frontend
- Page emails : `http://localhost:5000/admin/emails`
- Composer : `http://localhost:5000/admin/emails/compose`
- Brouillons : `http://localhost:5000/admin/emails/drafts`

---

## 🔧 Problèmes connus & solutions

### Backend ne démarre pas

**Symptôme** : Erreurs TypeScript en boucle

**Solution** :
```bash
cd backend
rm -rf node_modules/.cache dist
pkill -f "pnpm dev"
pnpm dev
```

### Frontend bloqué (403)

**Symptôme** : "Access denied" ou page blanche

**Solution** :
```bash
cd frontend
rm -rf node_modules/.cache
pkill -f "pnpm dev"
pnpm dev
```

### Port déjà utilisé

**Symptôme** : `EADDRINUSE: address already in use`

**Solution** :
```bash
# Tuer tous les process
pkill -f "pnpm dev"
pkill -f "tsx watch"

# OU pour un port spécifique
lsof -ti:4000 | xargs kill -9  # Backend
lsof -ti:5000 | xargs kill -9  # Frontend
```

### Email non reçu

**Vérifications** :
1. ✅ Backend répond : `curl http://localhost:4000/health`
2. ✅ SMTP config : `grep SMTP backend/.env`
3. ✅ Email loggé : `curl -H "x-user-id: admin" http://localhost:4000/api/emails`
4. ⚠️ Spam : Vérifier dossier spam de `guillaume@moverz.fr`
5. ⚠️ Hostinger logs : Panel admin Hostinger

---

## 📁 Structure importante

```
Back_Office/
├── backend/
│   ├── .env                          # SMTP credentials
│   ├── prisma/schema.prisma          # DB schema (EmailDraft, EmailLog)
│   ├── src/
│   │   ├── services/
│   │   │   ├── email.service.ts      # Envoi SMTP
│   │   │   └── emailDraft.service.ts # CRUD brouillons
│   │   ├── controllers/
│   │   │   ├── emails.controller.ts
│   │   │   └── emailDrafts.controller.ts
│   │   └── routes/
│   │       ├── emails.routes.ts
│   │       └── emailDrafts.routes.ts
│   └── migrations/                   # Migration EmailDraft appliquée
├── frontend/
│   ├── src/
│   │   ├── components/emails/
│   │   │   └── EmailComposer.tsx     # Éditeur Quill
│   │   └── pages/
│   │       ├── EmailsPage.tsx        # Liste sent
│   │       ├── EmailComposePage.tsx  # Rédiger
│   │       └── EmailDraftsPage.tsx   # Liste drafts
├── start.sh                          # Script de démarrage
└── QUICKSTART.md                     # Ce fichier
```

---

## 🔑 Variables d'environnement critiques

### Backend `.env`
```bash
# Database
DATABASE_URL="postgresql://..."

# Ports
PORT=4000
CORS_ORIGIN="http://localhost:5000"

# SMTP Hostinger
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=guillaume@moverz.fr
SMTP_PASSWORD=EzH2025!
EMAIL_FROM=contact@moverz.fr
EMAIL_FROM_NAME=Moverz

# Auth (dev)
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend `vite.config.ts`
```typescript
server: {
  port: 5000,
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
  },
}
```

---

## 📊 État actuel de la DB

### Tables créées
- ✅ `EmailLog` (emails envoyés)
- ✅ `EmailDraft` (brouillons)
- ✅ Relations : `User`, `Folder`, `EmailLog` ↔ `EmailDraft`

### Migration appliquée
- `20251111085401_add_email_drafts`

---

## 🎯 Prochaines étapes (P0-t017b)

1. **Phase 2 : Signature email** (30min)
   - Ajouter `User.emailSignature` (Prisma)
   - Page `/admin/settings/signature`
   - Insertion auto dans composer

2. **Phase 3 : IMAP Réception** (2h)
   - Cron job polling IMAP (5min)
   - Table `EmailInbound`
   - Matching auto aux dossiers

3. **Phase 4 : Inbox & Réponses** (1h30)
   - Page `/admin/emails/inbox`
   - Répondre → pre-fill composer
   - Threading conversations

---

## 🐛 Debug avancé

### Voir les logs live
```bash
# Backend
tail -f backend.log

# Frontend  
tail -f frontend.log

# Prisma queries
cd backend && DATABASE_URL="..." npx prisma studio
```

### Tester SMTP directement
```bash
cd backend
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  auth: { user: 'guillaume@moverz.fr', pass: 'EzH2025!' }
});
transport.sendMail({
  from: 'guillaume@moverz.fr',
  to: 'guillaume@moverz.fr',
  subject: 'Test',
  text: 'Test'
}).then(console.log).catch(console.error);
"
```

### Réinitialiser complètement
```bash
# Backend
cd backend
pkill -f "pnpm dev"
rm -rf node_modules/.cache dist
pnpm install
npx prisma generate
pnpm dev

# Frontend
cd frontend
pkill -f "pnpm dev"
rm -rf node_modules/.cache
pnpm install
pnpm dev
```

---

## ✅ Checklist de santé

Avant de déclarer "ça marche" :

- [ ] Backend répond : `curl http://localhost:4000/health`
- [ ] Frontend charge : `curl http://localhost:5000`
- [ ] API emails : `curl -H "x-user-id: admin" http://localhost:4000/api/emails`
- [ ] Créer brouillon : Interface `/admin/emails/compose`
- [ ] Envoyer email : Bouton "Envoyer" fonctionne
- [ ] Email reçu : Vérifier `guillaume@moverz.fr`

---

**🆘 En cas de problème** : Chercher "ERROR" dans `backend.log` et `frontend.log`

