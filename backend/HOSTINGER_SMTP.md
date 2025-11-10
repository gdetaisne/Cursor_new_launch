# 📧 Configuration SMTP Hostinger

## Variables à ajouter dans `backend/.env`

```env
# Hostinger SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@moverz.fr
SMTP_PASSWORD=ton_mot_de_passe_email

# Email settings
EMAIL_FROM=contact@moverz.fr
EMAIL_FROM_NAME=Moverz
```

## ⚙️ Paramètres Hostinger

| Paramètre | Valeur |
|-----------|--------|
| **SMTP Host** | `smtp.hostinger.com` |
| **SMTP Port** | `587` (STARTTLS) ou `465` (SSL) |
| **Username** | `contact@moverz.fr` (adresse complète) |
| **Password** | Mot de passe de la boîte email |
| **Secure** | TLS/STARTTLS |

## 🔐 Récupérer le mot de passe

Si tu ne te souviens plus du mot de passe :
1. Dans Hostinger → Boîtes mail
2. Cliquer sur les 3 points à côté de `guillaume@moverz.fr`
3. "Modifier le mot de passe"
4. Définir un nouveau mot de passe
5. Copier ce mot de passe dans le `.env`

## ✅ Test

Une fois configuré, tester avec :

```bash
curl -X POST http://localhost:3001/api/emails/send \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "to": "guillaume@moverz.fr",
    "subject": "Test Moverz Backend",
    "body": "<p>Si tu reçois cet email, le système fonctionne ! 🎉</p>"
  }'
```

## 📌 Note sur l'alias

L'alias `contact@moverz.fr` redirige vers `guillaume@moverz.fr`.
- ✅ Tu peux **envoyer** depuis `contact@moverz.fr` (SMTP)
- ✅ Les emails reçus sur `contact@moverz.fr` arrivent dans `guillaume@moverz.fr`

C'est parfait pour le système !

