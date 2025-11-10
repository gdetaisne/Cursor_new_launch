#!/bin/bash

echo "🧪 Test envoi email via API Moverz"
echo "=================================="
echo ""

curl -X POST http://localhost:3001/api/emails/send \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "to": "guillaume@moverz.fr",
    "subject": "Test Moverz Backend - Email MVP",
    "body": "<html><body><h2>Félicitations ! 🎉</h2><p>Le système d'\''emails Moverz fonctionne correctement.</p><p>Tu peux maintenant :</p><ul><li>✅ Envoyer des emails depuis le backend</li><li>✅ Logger tous les envois en DB</li><li>✅ Voir l'\''historique sur /admin/emails</li></ul><p>Prochaine étape : P0-t017b (Templates modifiables, emails entrants, relances auto)</p></body></html>"
  }'

echo ""
echo ""
echo "✅ Si tu vois un JSON avec emailLogId, c'est envoyé !"
echo "📧 Vérifie ta boîte guillaume@moverz.fr"
echo "🌐 Vérifie aussi http://localhost:5173/admin/emails"

