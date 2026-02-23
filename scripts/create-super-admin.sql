-- ============================================
-- SCRIPT SQL : Création du premier Super Admin
-- ============================================
-- 
-- IMPORTANT : Ce script doit être exécuté APRÈS avoir créé l'utilisateur
-- dans auth.users via l'API Supabase Admin ou l'interface Auth.
--
-- ÉTAPE 1 : Créer l'utilisateur dans auth.users (OBLIGATOIRE AVANT CE SCRIPT)
-- ============================================
-- 
-- ⚠️ IMPORTANT : Vous DEVEZ créer l'utilisateur dans auth.users AVANT d'exécuter ce script !
--
-- Option A : Via l'interface Supabase Dashboard (RECOMMANDÉ)
--   1. Ouvrir https://supabase.com/dashboard/project/igyolvupmiohrxaqtayc
--   2. Aller dans "Authentication" > "Users" (menu de gauche)
--   3. Cliquer sur le bouton "Add User" > "Create new user"
--   4. Remplir le formulaire :
--      - Phone: +22656636039 (format E.164) - LAISSER EMAIL VIDE
--      - Phone Confirmed: ✅ (COCHER cette case - TRÈS IMPORTANT !)
--      - User Metadata (cliquer sur "Add metadata"):
--        - Key: name
--        - Value: Super Admin
--   5. Cliquer sur "Create User"
--   6. Une fois créé, l'UUID s'affiche dans la liste (colonne "UUID")
--   
--   NOTE : Si l'interface demande un email, vous pouvez mettre un email temporaire
--         mais l'important est que le téléphone soit confirmé et utilisé pour l'OTP
--
-- Option B : Via l'API avec curl (si vous avez la SERVICE_ROLE_KEY) - RECOMMANDÉ
--   Remplacez VOTRE_SERVICE_ROLE_KEY par votre clé depuis .env.local
--   
--   curl -X POST 'https://igyolvupmiohrxaqtayc.supabase.co/auth/v1/admin/users' \
--     -H "apikey: VOTRE_SERVICE_ROLE_KEY" \
--     -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY" \
--     -H "Content-Type: application/json" \
--     -d '{
--       "phone": "+22656636039",
--       "phone_confirmed": true,
--       "user_metadata": {
--         "name": "Super Admin"
--       }
--     }'
--   
--   La réponse contiendra l'UUID dans le champ "id"
--   
--   NOTE : Cette méthode crée l'utilisateur avec uniquement le téléphone (pas d'email)
--
-- ÉTAPE 2 : Exécuter ce script SQL
-- ============================================
-- Ce script récupère automatiquement l'UUID depuis auth.users
-- en utilisant le numéro de téléphone (identifiant principal pour l'OTP).
--
-- Vous pouvez modifier ces valeurs si nécessaire :
--   - '+22656636039' : Le numéro de téléphone (format E.164) - doit correspondre à celui dans auth.users
--   - 'Super Admin' : Le nom du super admin

-- Variables à personnaliser (optionnel)
DO $$
DECLARE
  v_phone TEXT := '+22656636039';  -- ⚠️ Modifiez pour correspondre au téléphone dans auth.users
  v_name TEXT := 'Super Admin';     -- ⚠️ Modifiez si nécessaire
  v_user_id UUID;
BEGIN
  -- Récupérer l'UUID de l'utilisateur depuis auth.users par téléphone
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE phone = v_phone
  LIMIT 1;

  -- Vérifier que l'utilisateur existe
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '
═══════════════════════════════════════════════════════════════
❌ ERREUR : Utilisateur non trouvé dans auth.users
═══════════════════════════════════════════════════════════════

Le numéro de téléphone "%" n''existe pas dans auth.users.

📋 INSTRUCTIONS POUR CRÉER L''UTILISATEUR :

MÉTHODE 1 : Via l''API (RECOMMANDÉ - crée avec téléphone uniquement)
  curl -X POST ''https://igyolvupmiohrxaqtayc.supabase.co/auth/v1/admin/users'' \
    -H "apikey: VOTRE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d ''{
      "phone": "%",
      "phone_confirmed": true,
      "user_metadata": {
        "name": "Super Admin"
      }
    }''

MÉTHODE 2 : Via l''interface Supabase Dashboard
1. Allez sur : https://supabase.com/dashboard/project/igyolvupmiohrxaqtayc
2. Menu gauche : "Authentication" > "Users"
3. Cliquez sur "Add User" > "Create new user"
4. Remplissez :
   - Phone: % (format E.164)
   - Phone Confirmed: ✅ (COCHER - TRÈS IMPORTANT !)
   - User Metadata (cliquer sur "Add metadata") :
     * Key: name, Value: Super Admin
5. Cliquez sur "Create User"
6. Une fois créé, RÉEXÉCUTEZ ce script SQL

═══════════════════════════════════════════════════════════════
', v_phone, v_phone, v_phone;
  END IF;

  -- Insérer ou mettre à jour dans public.users
  INSERT INTO public.users (
    id,
    name,
    phone,
    role,
    clinic_id
  ) VALUES (
    v_user_id,
    v_name,
    v_phone,
    'super_admin',
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'super_admin',
    clinic_id = NULL,
    name = v_name,
    phone = v_phone;

  RAISE NOTICE 'Super Admin créé avec succès ! UUID: %, Nom: %, Téléphone: %', v_user_id, v_name, v_phone;
END $$;

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Exécutez cette requête pour vérifier que le super_admin a été créé correctement :

SELECT 
  u.id,
  u.name,
  u.phone,
  u.role,
  u.clinic_id,
  au.phone as auth_phone,
  au.email as auth_email,
  au.created_at as auth_created_at,
  au.phone_confirmed_at,
  au.email_confirmed_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'super_admin';

-- Si vous préférez utiliser un UUID spécifique au lieu du numéro de téléphone,
-- utilisez cette version alternative (décommentez et remplacez l'UUID) :

-- ============================================
-- VERSION ALTERNATIVE : Utiliser directement l'UUID
-- ============================================
-- Si vous préférez utiliser un UUID spécifique au lieu de l'email,
-- décommentez ce bloc et remplacez l'UUID :

/*
DO $$
DECLARE
  v_user_id UUID := 'VOTRE_UUID_ICI'::uuid;  -- ⚠️ Remplacez par l'UUID réel depuis auth.users
  v_name TEXT := 'Super Admin';
  v_phone TEXT := '+22656636039';  -- Récupérez depuis user_metadata si nécessaire
BEGIN
  -- Vérifier que l'utilisateur existe dans auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'L''utilisateur avec l''UUID % n''existe pas dans auth.users.', v_user_id;
  END IF;

  INSERT INTO public.users (id, name, phone, role, clinic_id)
  VALUES (v_user_id, v_name, v_phone, 'super_admin', NULL)
  ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin', clinic_id = NULL, name = v_name, phone = v_phone;

  RAISE NOTICE 'Super Admin créé avec succès ! UUID: %', v_user_id;
END $$;
*/

