# P0-t012 — Génération & parsing automatique des devis

**Priorité : P0** — Sans collecte de devis, pas de top 3 pour le client → flux bloqué.

## Contexte

Automatiser la collecte des devis selon deux flux :
1. **Génération automatique** : pour déménageurs avec grilles tarifaires
2. **Parsing emails** : pour déménageurs qui répondent par email

**Approche progressive** :
- Infrastructure automatique en place dès le MVP
- **Relecture manuelle admin obligatoire** avant envoi au client
- Automatisation complète après validation terrain

## Objectifs

### A. Génération automatique de devis

- [ ] **À partir des grilles tarifaires** (`pricing_grids`)
  - Calcul prix selon : volume (m³) + distance (km)
  - Paliers/tranches définis par déménageur
  - Formule : `prix_base + (m3 * tarif_m3) + (km * tarif_km) + options`

- [ ] **Validation des données**
  - Vérifier cohérence grille (pas de trous dans paliers)
  - Alerter admin si grille incomplète/obsolète
  - Gérer cas particuliers (îles, DOM-TOM, accès difficile)

- [ ] **Génération document devis**
  - PDF formaté avec logo déménageur
  - Détail calcul (transparent pour client)
  - Conditions générales
  - Validité (30 jours standard)

### B. Parsing emails de réponse

- [ ] **Réception et analyse**
  - Webhook/polling boîte email dédiée
  - Détection pièces jointes (PDF, images)
  - Extraction texte brut du corps

- [ ] **Extraction données clés**
  - Prix total TTC (regex multi-formats : "1 500 €", "1500€", "1.500,00 EUR")
  - Date validité
  - Nom entreprise (vérification correspondance déménageur)
  - Contact (tel, email)

- [ ] **OCR pour PDF/images** (si texte non extrait)
  - Provider : Google Vision API ou Tesseract
  - Extraction structurée
  - Taux de confiance

- [ ] **Validation humaine obligatoire**
  - Interface admin : prévisualisation email + données extraites
  - Champs éditables si erreur parsing
  - Bouton "Valider devis" / "Rejeter"
  - Statut : PARSED_PENDING → VALIDATED ou REJECTED

### C. Workflows et états

- [ ] **États devis** (compléter P0-t009)
  - `AUTO_GENERATED` : généré depuis grille tarifaire
  - `EMAIL_RECEIVED` : email reçu, pas encore parsé
  - `PARSED_PENDING` : parsé, attente validation admin
  - `VALIDATED` : validé par admin, prêt pour top 3
  - `PARSING_FAILED` : échec extraction, intervention manuelle requise
  - `REJECTED` : rejeté par admin (incohérent, invalide)

- [ ] **Règles métier**
  - Si grille tarifaire existe → génération auto immédiate
  - Si pas de grille → attente réponse email (délai J+2, J+4)
  - Parsing automatique dès réception email
  - Admin notifié si parsing failed ou pending validation

### D. Interface admin (intégration P0-t006)

- [ ] **Dashboard devis**
  - Liste devis en attente validation
  - Filtre par type (auto, parsé, failed)
  - Prévisualisation côte-à-côte (email brut + données extraites)

- [ ] **Édition/correction**
  - Champs modifiables (prix, validité, contact)
  - Notes admin (raison rejet, problème détecté)
  - Historique modifications

- [ ] **Statistiques**
  - Taux succès parsing (par déménageur)
  - Temps moyen validation
  - Alertes si grilles obsolètes

### E. Infrastructure technique

- [ ] **Email**
  - Boîte dédiée : devis@moverz.fr
  - Webhook provider (ex: Resend inbound) ou polling IMAP
  - Stockage emails bruts (S3 ou DB)

- [ ] **Parsing engine**
  - Bibliothèque : email-reply-parser (nettoie signatures)
  - Regex patterns prix (multi-formats, multi-devises)
  - Google Vision API ou Tesseract (OCR)

- [ ] **Queue jobs** (BullMQ)
  - Job `parse-email-quote` : async, retry 3x
  - Job `generate-quote-from-grid` : rapide, sync possible
  - Logs détaillés par job

- [ ] **Modèle données** (ajouter à P0-t005)
  - Table `quotes` étendue :
    - `source` : ENUM(AUTO_GENERATED, EMAIL_PARSED)
    - `raw_email_id` : lien vers email brut
    - `parsed_data` : JSON extraction
    - `confidence_score` : % confiance parsing
    - `validated_by` : user_id admin qui valide
    - `validated_at` : timestamp

## Périmètre

- Spécification technique complète des deux flux (génération + parsing)
- Workflows et états devis
- Interface validation admin
- Choix infrastructure (OCR, email, queue)
- **Aucune implémentation code** dans cette task

**Hors scope** :
- Scoring devis (voir P0-t009)
- Relances déménageurs (voir P0-t011)
- Page Top 3 client (voir P0-t009)

## Implémentation

À compléter :
1. Diagrammes workflows (génération auto, parsing email)
2. Schéma détaillé `quotes` étendu
3. Mockups interface admin validation
4. Règles métier complètes (cas particuliers, erreurs)
5. Benchmark providers OCR (coût, précision)
6. Formules calcul prix (grilles tarifaires)

## État d'avancement

- [ ] Flux génération auto spécifié
- [ ] Flux parsing email spécifié
- [ ] États devis définis
- [ ] Interface admin spécifiée
- [ ] Infrastructure technique choisie
- [ ] Intégration avec P0-t005 (schéma) validée
- [ ] Intégration avec P0-t009 (scoring) validée

**Statut : 📝 Spécification**

## Commits liés

*(à renseigner)*

## Notes futures

- Task dédiée à l'implémentation parsing engine
- Task dédiée à l'implémentation génération auto
- Task dédiée aux templates PDF devis
- Task dédiée à l'interface admin validation
- Phase 2 : Machine learning pour améliorer parsing
- Phase 2 : Validation auto si confiance >95%
- Intégrer retours terrain pour améliorer regex/patterns

