#!/bin/bash

# Script pour créer l'utilisateur Super Admin dans auth.users via l'API Supabase
# Utilise les variables d'environnement depuis .env.local

# Charger les variables d'environnement depuis .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ Erreur: Fichier .env.local introuvable"
    echo "Créez le fichier .env.local avec vos clés Supabase (voir ENV_SETUP.md)"
    exit 1
fi

# Configuration
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://igyolvupmiohrxaqtayc.supabase.co}"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non trouvée dans .env.local"
    echo "Ajoutez SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env.local"
    exit 1
fi

PHONE="+22656636039"  # ⚠️ Modifiez si nécessaire
NAME="Super Admin"

echo "🚀 Création de l'utilisateur dans auth.users..."
echo "   Téléphone: ${PHONE}"
echo "   Nom: ${NAME}"
echo ""

# Créer l'utilisateur dans auth.users avec téléphone comme identifiant principal
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"phone\": \"${PHONE}\",
    \"phone_confirmed\": true,
    \"user_metadata\": {
      \"name\": \"${NAME}\"
    }
  }")

# Vérifier si la réponse contient une erreur
if echo "$RESPONSE" | grep -q '"error"\|"message"'; then
    echo "❌ Erreur lors de la création de l'utilisateur:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

# Extraire l'UUID de la réponse
USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
    echo "❌ Erreur: Impossible d'extraire l'UUID de la réponse"
    echo "Réponse complète:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

echo "✅ Utilisateur créé avec succès !"
echo "   UUID: $USER_ID"
echo "   Téléphone: ${PHONE}"
echo ""
echo "📝 Maintenant, exécutez le script SQL dans Supabase:"
echo "   Fichier: scripts/create-super-admin.sql"
echo ""
echo "   Ou exécutez directement cette commande SQL:"
echo ""
echo "INSERT INTO public.users (id, name, phone, role, clinic_id)"
echo "VALUES ("
echo "  '${USER_ID}'::uuid,"
echo "  '${NAME}',"
echo "  '${PHONE}',"
echo "  'super_admin',"
echo "  NULL"
echo ")"
echo "ON CONFLICT (id) DO UPDATE"
echo "SET role = 'super_admin', clinic_id = NULL, name = '${NAME}', phone = '${PHONE}';"
echo ""



