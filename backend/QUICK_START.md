# Moverz Backend — Quick Start Guide

> **Démarrer en 5 minutes** 🚀

---

## 🎯 Prérequis

- **Node.js** ≥ 20.0.0 ([installer](https://nodejs.org/))
- **pnpm** ([installer](https://pnpm.io/installation))
- **PostgreSQL** (Neon.tech recommandé, [créer un compte](https://neon.tech/))

---

## ⚡ Installation rapide

```bash
# 1. Aller dans le dossier backend
cd backend/

# 2. Installer les dépendances (pnpm recommandé)
pnpm install

# 3. Copier le fichier d'exemple d'environnement
cp .env.example .env

# 4. Éditer .env avec votre DATABASE_URL Neon.tech
nano .env
# Ou : code .env (VS Code)

# 5. Générer le client Prisma
pnpm db:generate

# 6. Exécuter les migrations
pnpm db:migrate

# 7. Peupler la base avec des données de test
pnpm db:seed

# 8. Lancer le serveur en mode dev
pnpm dev
```

**✅ Le serveur est maintenant disponible sur http://localhost:3001**

---

## 🧪 Tester l'installation

### Option 1 : Health check (curl)

```bash
curl http://localhost:3001/health
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T...",
  "database": "connected",
  "environment": "development"
}
```

### Option 2 : Lister les dossiers

```bash
curl http://localhost:3001/api/folders
```

### Option 3 : Script de test intégré

```bash
pnpm test:api
```

---

## 📦 Configuration Neon.tech

### 1. Créer une base de données

1. Aller sur [neon.tech](https://neon.tech/)
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Copier la connection string PostgreSQL

### 2. Format de la connection string

```bash
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"
```

**Exemple réel :**
```bash
DATABASE_URL="postgresql://neondb_owner:abc123xyz@ep-cool-moon-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 3. Ajouter à .env

```bash
echo 'DATABASE_URL="votre-connection-string"' > .env
```

---

## 🛠️ Commandes essentielles

### Développement

```bash
pnpm dev              # Lance le serveur avec hot-reload
pnpm build            # Compile TypeScript
pnpm start            # Lance le serveur compilé
```

### Base de données

```bash
pnpm db:migrate       # Créer/appliquer des migrations
pnpm db:seed          # Peupler avec des données de test
pnpm db:reset         # Reset complet (drop + migrate + seed)
pnpm db:studio        # Ouvrir Prisma Studio (UI graphique)
pnpm db:test          # Tester la connexion + perfs
```

### Tests

```bash
pnpm test             # Lancer tous les tests
pnpm test:watch       # Mode watch (re-run automatique)
pnpm test:coverage    # Générer le rapport de couverture
```

---

## 📖 Données de test (après seed)

Le script `pnpm db:seed` crée automatiquement :

| Entité | Nombre | Exemples |
|--------|--------|----------|
| **Movers** | 5 | "Déménagements Pro", "TransportExpress", etc. |
| **PricingGrids** | 12 | Grilles tarifaires par zone |
| **Users** | 5 | admin@moverz.fr, operator@moverz.fr |
| **Clients** | 3 | jean.dupont@test.local, etc. |
| **Folders** | 3 | Dossiers avec statuts variés |
| **Quotes** | 10 | Devis REQUESTED, RECEIVED, VALIDATED |
| **Bookings** | 1 | Réservation confirmée |
| **Payments** | 1 | Paiement SUCCEEDED |

---

## 🧪 Tester les endpoints

### 1. Créer un lead

```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "source": "bordeaux-demenageur.fr",
    "email": "test@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "originCity": "Bordeaux",
    "originPostalCode": "33000",
    "destCity": "Paris",
    "destPostalCode": "75001",
    "estimatedVolume": 25
  }'
```

### 2. Lister les dossiers (avec pagination)

```bash
curl "http://localhost:3001/api/folders?page=1&limit=10"
```

### 3. Récupérer un dossier spécifique

```bash
# Remplacer {id} par un vrai UUID
curl http://localhost:3001/api/folders/{id}
```

### 4. Créer un devis

```bash
curl -X POST http://localhost:3001/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "folderId": "uuid-du-folder",
    "moverId": "uuid-du-mover",
    "totalPrice": 1500.00,
    "depositAmount": 450.00
  }'
```

---

## 🐛 Problèmes fréquents

### Erreur : "Cannot connect to database"

**Cause** : DATABASE_URL invalide ou Neon.tech inactif

**Solution** :
```bash
# Tester la connexion
pnpm db:test

# Vérifier que DATABASE_URL est bien défini
echo $DATABASE_URL

# Re-générer le client Prisma
pnpm db:generate
```

### Erreur : "Port 3001 already in use"

**Cause** : Le port est déjà utilisé

**Solution** :
```bash
# Changer le port dans .env
echo 'PORT=3002' >> .env

# Ou tuer le processus existant
lsof -ti:3001 | xargs kill -9
```

### Erreur : "Prisma schema not found"

**Cause** : Client Prisma non généré

**Solution** :
```bash
pnpm db:generate
```

### Erreur : "Table X doesn't exist"

**Cause** : Migrations non appliquées

**Solution** :
```bash
# Appliquer les migrations
pnpm db:migrate

# Ou reset complet (dev uniquement)
pnpm db:reset
```

---

## 📚 Prochaines étapes

1. **Lire la doc API** : [`API.md`](./API.md)
2. **Tester les endpoints** : Utiliser curl ou Postman
3. **Explorer la base** : `pnpm db:studio`
4. **Lire le README complet** : [`README.md`](./README.md)
5. **Comprendre le modèle** : [`prisma/schema.prisma`](./prisma/schema.prisma)

---

## 🆘 Besoin d'aide ?

- **README complet** : [`README.md`](./README.md)
- **Documentation API** : [`API.md`](./API.md)
- **Sécurité** : [`SECURITY.md`](./SECURITY.md)
- **Prisma** : [`prisma/README.md`](./prisma/README.md)
- **Issues GitHub** : [github.com/gdetaisne/Back_Office](https://github.com/gdetaisne/Back_Office)

---

**Bon développement ! 🚀**

