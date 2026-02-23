#!/bin/bash

# Script pour créer l'utilisateur dans auth.users et le super_admin dans public.users
# Utilise l'API Supabase Admin

# Configuration
SUPABASE_URL="https://igyolvupmiohrxaqtayc.supabase.co"
SERVICE_ROLE_KEY="VOTRE_SERVICE_ROLE_KEY_ICI"  # ⚠️ Remplacez par votre clé
PHONE="+22656636039"  # Format E.164
NAME="Super Admin"

echo "🚀 Création de l'utilisateur dans auth.users avec téléphone..."

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

# Extraire l'UUID de la réponse
USER_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "❌ Erreur lors de la création de l'utilisateur"
  echo "Réponse: $RESPONSE"
  exit 1
fi

echo "✅ Utilisateur créé avec l'UUID: $USER_ID"
echo "   Téléphone: ${PHONE}"
echo ""
echo "📝 Maintenant, exécutez ce script SQL dans Supabase:"
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
echo "Ou utilisez le script create-super-admin.sql qui recherchera automatiquement"
echo "l'utilisateur par téléphone: ${PHONE}"
echo ""

