# Back Office Moverz

Objectif : plateforme interne pour gérer dossiers, déménageurs, devis, bookings et paiements.

Principes :
- Source unique : toutes les données structurées vivent ici.
- Automatisation : génération devis, sync Google, relances, scoring.
- Portails :
  - `/admin` : équipe Moverz
  - `/partner` : déménageurs
- Traçabilité : aucune modification sans task dédiée dans `.cursor/tasks`.
- Les tasks décrivent le *pourquoi/comment* ; le code reste hors de `/tasks`.

