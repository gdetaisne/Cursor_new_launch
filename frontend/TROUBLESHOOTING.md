# Troubleshooting Frontend — Moverz Admin Portal

> **Documentation des problèmes rencontrés et leurs solutions**

---

## 🔴 Problèmes Phase 0 Setup (2025-11-10)

### Problème 1 : React manquant

**Symptôme** :
```
[plugin:vite:import-analysis] Failed to resolve import "react" from "src/main.tsx"
```

**Cause** :
- Template Vite `react-ts` crée la structure mais n'installe PAS React/React-DOM
- Ce sont des **peer dependencies** que l'utilisateur doit installer manuellement

**Solution** :
```bash
pnpm add react react-dom @types/react @types/react-dom
```

**Prévention future** :
✅ Toujours vérifier après `pnpm create vite` que React est installé  
✅ Ajouter un script de vérification post-install

---

### Problème 2 : Tailwind CSS 4.x incompatible

**Symptôme** :
```
[postcss] It looks like you're trying to use 'tailwindcss' directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS
with PostCSS you'll need to install '@tailwindcss/postcss'
```

**Cause** :
- Tailwind CSS 4.x (4.1.17) a changé son architecture
- Le plugin PostCSS est maintenant dans un package séparé `@tailwindcss/postcss`
- Tailwind 4.x est encore en version instable (breaking changes)

**Solution** :
```bash
# Downgrade vers Tailwind 3.x (stable)
pnpm remove tailwindcss
pnpm add tailwindcss@3.4.17
```

**Prévention future** :
✅ Toujours installer Tailwind 3.x (version stable) jusqu'à ce que 4.x soit GA  
✅ Vérifier les breaking changes avant d'upgrade  
✅ Utiliser `@latest-3` pour forcer la version 3.x

---

### Problème 3 : Cache Vite persistant

**Symptôme** :
- Après correction de `postcss.config.js`, l'erreur persiste
- Le serveur Vite continue d'utiliser l'ancienne config

**Cause** :
- Vite cache les configurations dans `node_modules/.vite/`
- Le serveur en arrière-plan ne recharge pas automatiquement `postcss.config.js`

**Solution** :
```bash
# 1. Killer le serveur Vite
pkill -f "vite"

# 2. Nettoyer le cache
rm -rf node_modules/.vite

# 3. Redémarrer proprement
pnpm dev
```

**Prévention future** :
✅ Toujours redémarrer Vite après modification de `vite.config.ts`, `postcss.config.js`, `tailwind.config.js`  
✅ Ajouter un script `pnpm clean` pour nettoyer les caches

---

## ✅ Checklist Setup Frontend (à suivre à l'avenir)

### 1. Initialisation Vite

```bash
pnpm create vite frontend -- --template react-ts
cd frontend
```

### 2. Installation dépendances de base

```bash
# ⚠️ CRITIQUE : Vite ne les installe PAS automatiquement
pnpm add react react-dom @types/react @types/react-dom
```

### 3. Installation Tailwind CSS (version stable)

```bash
# ⚠️ Forcer version 3.x (stable)
pnpm add tailwindcss@3 postcss autoprefixer
pnpm add -D @tailwindcss/forms @tailwindcss/typography
```

### 4. Configuration Tailwind

```bash
# Créer les fichiers de config
npx tailwindcss init -p
```

Puis éditer `tailwind.config.js` :
```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### 5. Installation autres dépendances

```bash
# Routing, state, API, forms, charts
pnpm add react-router-dom zustand @tanstack/react-query axios
pnpm add react-hook-form @hookform/resolvers zod
pnpm add recharts date-fns lucide-react
pnpm add class-variance-authority clsx tailwind-merge

# Dev tools
pnpm add -D prettier eslint-config-prettier
```

### 6. Vérification finale

```bash
# Vérifier que tout est installé
pnpm list | grep -E "(react|tailwind|postcss)"

# Démarrer le serveur
pnpm dev
```

### 7. Test dans le navigateur

- Ouvrir http://localhost:5173
- Vérifier que Tailwind fonctionne (classes CSS appliquées)
- Vérifier qu'aucune erreur console

---

## 🚨 Erreurs Fréquentes & Solutions

### Erreur : "Cannot find module 'react'"

**Solution** : `pnpm add react react-dom`

### Erreur : "tailwindcss" not found in PostCSS

**Solution** :
```bash
pnpm remove tailwindcss
pnpm add tailwindcss@3.4.17
rm -rf node_modules/.vite
pnpm dev
```

### Erreur : Tailwind classes non appliquées

**Vérifier** :
1. `tailwind.config.js` → `content` inclut bien `./src/**/*.{js,ts,jsx,tsx}`
2. `src/main.tsx` importe bien `./styles/globals.css`
3. `globals.css` contient bien `@tailwind base; @tailwind components; @tailwind utilities;`

### Erreur : Vite ne recharge pas après changement config

**Solution** :
```bash
pkill -f "vite"
rm -rf node_modules/.vite
pnpm dev
```

---

## 📚 Commandes Utiles

### Nettoyer complètement le projet

```bash
rm -rf node_modules pnpm-lock.yaml
rm -rf node_modules/.vite
pnpm install
pnpm dev
```

### Vérifier les versions installées

```bash
pnpm list react react-dom tailwindcss vite
```

### Forcer une version spécifique

```bash
pnpm add tailwindcss@3.4.17 --save-exact
```

### Debugger PostCSS

```bash
# Voir la config PostCSS utilisée
DEBUG=postcss pnpm dev
```

---

## 🎯 Leçons Apprises

### ✅ À FAIRE

1. **Toujours installer React manuellement** après `pnpm create vite`
2. **Utiliser Tailwind 3.x** (stable) au lieu de 4.x (beta)
3. **Nettoyer le cache Vite** après changement de config
4. **Redémarrer proprement** le serveur après modif `*.config.js`
5. **Vérifier les versions** installées avec `pnpm list`

### ❌ À ÉVITER

1. ❌ Supposer que `pnpm create vite` installe tout
2. ❌ Installer Tailwind 4.x sans vérifier la doc
3. ❌ Modifier des configs sans redémarrer Vite
4. ❌ Laisser tourner le serveur en arrière-plan longtemps
5. ❌ Installer des versions `@latest` sans vérifier la stabilité

---

## 🔄 Workflow de Debug Standard

Quand une erreur survient :

1. **Lire l'erreur complète** (ne pas skip)
2. **Identifier la cause** (dépendance manquante ? Config ? Cache ?)
3. **Tester une solution** (une seule à la fois)
4. **Vérifier** que ça marche
5. **Documenter** la solution ici
6. **Commit** le fix

**Ne JAMAIS** :
- Appliquer 10 fixes en même temps
- Redémarrer sans nettoyer le cache
- Oublier de documenter la solution

---

## 📞 Support

Si un problème persiste après avoir suivi ce guide :

1. Vérifier les logs Vite dans le terminal
2. Ouvrir la console DevTools du navigateur
3. Chercher l'erreur exacte sur Google/StackOverflow
4. Vérifier la doc officielle de la lib concernée
5. Créer une issue GitHub si c'est un bug

---

**Dernière mise à jour** : 2025-11-10  
**Auteur** : Guillaume Stehelin  
**Contexte** : P0-t016 Phase 0 Setup

