#!/bin/bash

# 🚀 Script de démarrage Moverz Back Office

echo "🧹 Nettoyage des anciens process..."
pkill -f "pnpm dev" 2>/dev/null
pkill -f "tsx watch" 2>/dev/null

echo ""
echo "🚀 Démarrage Backend (port 4000)..."
cd backend
pnpm dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

echo ""
echo "⏳ Attente démarrage backend (8s)..."
sleep 8

echo ""
echo "🚀 Démarrage Frontend (port 5000)..."
cd ../frontend
pnpm dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Démarrage terminé !"
echo ""
echo "📊 URLs :"
echo "   Backend:  http://localhost:4000/health"
echo "   Frontend: http://localhost:5000"
echo "   Composer: http://localhost:5000/admin/emails/compose"
echo ""
echo "📝 Logs :"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Pour arrêter :"
echo "   kill $BACKEND_PID $FRONTEND_PID"

