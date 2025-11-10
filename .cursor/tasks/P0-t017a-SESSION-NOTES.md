# 📝 Session P0-t017a — Emails MVP (Gmail/Hostinger SMTP)

**Date** : 2025-11-10  
**Durée** : ~2h  
**Status** : ⏸️ **EN PAUSE** (Backend en cours de démarrage)

---

## ✅ CE QUI A ÉTÉ FAIT

### **Phase 1 : Backend Service (COMPLET ✅)**
- ✅ Installation Nodemailer + @types/nodemailer
- ✅ Service `email.service.ts` (sendEmail + EmailLog DB)
- ✅ Schema Zod `email.schema.ts` (validation)
- ✅ Controller `emails.controller.ts` (POST /send, GET /list)
- ✅ Routes `emails.routes.ts`
- ✅ Middleware `auth.ts` (x-user-id header)
- ✅ Route `/api/emails` enregistrée dans index.ts
- ✅ Documentation `HOSTINGER_SMTP.md`

### **Phase 2 : Frontend Page (COMPLET ✅)**
- ✅ Page `EmailsPage.tsx` avec 3 KPI cards
- ✅ Table responsive avec statuts
- ✅ Loading + Empty states
- ✅ Route `/admin/emails` configurée dans AppRouter

### **Phase 3 : AIMailComposer (COMPLET ✅)**
- ✅ Appel API `POST /api/emails/send`
- ✅ Context clientEmail + folderId
- ✅ Conversion texte → HTML
- ✅ Gestion erreurs + confirmation

---

## ⚠️ PROBLÈMES RENCONTRÉS & SOLUTIONS

### **1. Middleware auth.ts manquant**
- **Erreur** : `Cannot find module 'auth.js'`
- **Solution** : Créé `backend/src/middlewares/auth.ts` avec authentification basique (x-user-id)

### **2. Import ApiError incorrect**
- **Erreur** : `Cannot find module 'errors.js'`
- **Solution** : Corrigé import vers `ApiError.ts`

### **3. Zod v4 incompatibilité (.merge)**
- **Erreur** : `dateRangeSchema.merge is not a function` (3 occurrences)
- **Fichier** : `backend/src/schemas/analytics.schema.ts`
- **Solution** : Remplacé `.merge(...).extend({...})` par `z.object({ ...schema.shape, ... })`
- **Lignes corrigées** : 40, 55, 68

### **4. Confusion alias email**
- **Problème** : `contact@moverz.fr` est un alias, pas une vraie boîte
- **Solution** : SMTP_USER = `guillaume@moverz.fr` (vraie boîte), EMAIL_FROM = `contact@moverz.fr` (apparence)

---

## 🔧 CONFIGURATION REQUISE

### **Backend `.env` (à compléter manuellement)**

```env
# Hostinger SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=guillaume@moverz.fr       # ⚠️ Vraie boîte, pas l'alias
SMTP_PASSWORD=EzH2025!                # Mot de passe fourni

# Email settings
EMAIL_FROM=contact@moverz.fr         # Adresse affichée (alias OK)
EMAIL_FROM_NAME=Moverz
```

---

## 📊 STATUS ACTUEL

| Élément | Status | Notes |
|---------|--------|-------|
| **Code Backend** | ✅ Complet | auth.ts + email.service.ts OK |
| **Code Frontend** | ✅ Complet | EmailsPage + AIMailComposer OK |
| **Corrections Zod v4** | ✅ Fait | 3 `.merge()` corrigés |
| **Config .env** | ⚠️ À vérifier | User doit ajouter credentials Hostinger |
| **Backend démarré** | ⏸️ EN COURS | Dernière erreur Zod en cours de résolution |
| **Tests emails** | ❌ Pas testés | En attente backend OK |

---

## 🧪 TESTS À FAIRE (APRÈS PAUSE)

### **1. Vérifier démarrage backend**
```bash
cd backend
pnpm dev
# Attendre : "✅ Server listening on http://localhost:3001"
```

### **2. Test API direct**
```bash
curl -X POST http://localhost:3001/api/emails/send \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "to": "guillaume@moverz.fr",
    "subject": "Test Moverz MVP",
    "body": "<p>Test système email 🎉</p>"
  }'
```

**Résultat attendu** :
```json
{
  "success": true,
  "emailLogId": "uuid...",
  "messageId": "..."
}
```

### **3. Test Frontend**
1. Ouvrir http://localhost:5173/admin/emails → Vérifier affichage
2. Aller sur un dossier → Ouvrir AI Mail Composer
3. Générer un email → Envoyer
4. Vérifier email reçu dans `guillaume@moverz.fr`
5. Recharger `/admin/emails` → Email visible dans la liste

### **4. Vérifier DB**
```sql
SELECT * FROM "EmailLog" ORDER BY "createdAt" DESC LIMIT 10;
```

---

## 📦 FICHIERS CRÉÉS

### Backend
```
backend/
├── HOSTINGER_SMTP.md                    (doc config SMTP)
├── src/
│   ├── middlewares/auth.ts              (middleware auth basique)
│   ├── services/email.service.ts        (sendEmail + log DB)
│   ├── schemas/email.schema.ts          (validation Zod)
│   ├── controllers/emails.controller.ts (send + list)
│   └── routes/emails.routes.ts          (POST /send, GET /)
```

### Frontend
```
frontend/
└── src/
    └── pages/EmailsPage.tsx             (liste + KPIs)
```

### Root
```
test-email.sh                            (script test curl)
```

---

## 🚀 PROCHAINES ÉTAPES (P0-t017b)

**Limites MVP actuel** :
- ❌ Pas d'emails entrants
- ❌ Templates pas modifiables (hardcodés)
- ❌ Pas de relances automatiques
- ⚠️ Limite 500 emails/jour (Hostinger)

**Phase P0-t017b** (5h estimées) :
1. **Templates DB modifiables** (WYSIWYG, variables, versioning)
2. **Relances automatiques** (BullMQ, règles configurables)
3. **Emails entrants** (Webhooks Resend ou IMAP)
4. **Rapprochement dossiers** (matching auto via headers/subject/email)
5. **Migration Resend** (webhooks, meilleure délivrabilité)

---

## 💾 COMMIT

```bash
git add .
git commit -m "P0-t017a: Emails MVP - Backend + Frontend (⏸️ tests en attente)

✅ Phase 1-2-3 complètes:
  - Backend: email.service.ts + auth.ts + routes
  - Frontend: EmailsPage + AIMailComposer connecté
  - Config: HOSTINGER_SMTP.md

⚠️ Corrections Zod v4 (3x .merge)
⚠️ Backend en cours de démarrage (derniers ajustements)

Reste: Tests finaux avec credentials Hostinger"
```

---

## 📞 CONTACT REPRISE

Avant de reprendre :
1. Vérifier que le backend démarre sans erreur (`pnpm dev`)
2. Vérifier que `.env` contient les credentials Hostinger
3. Lancer les tests ci-dessus
4. Si OK → Clôturer P0-t017a ✅
5. Sinon → Debug les erreurs restantes

**Bon courage pour la reprise ! 🚀**

