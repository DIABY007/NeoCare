# 📘 Guide : Création du Premier Super Admin

Ce guide vous explique étape par étape comment créer le premier super admin de NeoCare.

## ⚠️ Prérequis

- Avoir exécuté le script `create-tables.sql` dans Supabase
- Avoir accès au dashboard Supabase
- Avoir votre SERVICE_ROLE_KEY (dans `.env.local`)

---

## 🎯 Méthode 1 : Via l'Interface Supabase (RECOMMANDÉ)

### Étape 1 : Créer l'utilisateur dans auth.users

1. **Ouvrir le Dashboard Supabase**
   - Allez sur : https://supabase.com/dashboard/project/igyolvupmiohrxaqtayc
   - Connectez-vous si nécessaire

2. **Accéder à la section Authentication**
   - Dans le menu de gauche, cliquez sur **"Authentication"**
   - Puis cliquez sur **"Users"**

3. **Créer un nouvel utilisateur**
   - Cliquez sur le bouton **"Add User"** (en haut à droite)
   - Sélectionnez **"Create new user"**

4. **Remplir le formulaire**
   - **Phone** : `+22656636039` (format E.164) - **LAISSER EMAIL VIDE si possible**
   - **Phone Confirmed** : ✅ **COCHER cette case** (très important !)
   - **User Metadata** : Cliquez sur "Add metadata"
     - **Key** : `name`
     - **Value** : `Super Admin`
   - Cliquez sur **"Create User"**
   
   **Note** : Si l'interface Supabase demande un email obligatoire, vous pouvez mettre un email temporaire, mais l'important est que le téléphone soit confirmé et utilisé pour l'authentification OTP.

5. **Récupérer l'UUID**
   - Une fois l'utilisateur créé, il apparaît dans la liste
   - Notez l'**UUID** (colonne "UUID" ou dans les détails)

### Étape 2 : Exécuter le script SQL

1. **Ouvrir le SQL Editor**
   - Dans le menu de gauche, cliquez sur **"SQL Editor"**
   - Cliquez sur **"New query"**

2. **Copier le script**
   - Ouvrez le fichier `scripts/create-super-admin.sql`
   - Copiez tout le contenu

3. **Exécuter le script**
   - Collez le script dans l'éditeur SQL
   - Cliquez sur **"Run"** (ou `Ctrl+Enter`)

4. **Vérifier le résultat**
   - Le script devrait afficher : `Super Admin créé avec succès !`
   - La requête de vérification en bas du script devrait retourner une ligne

---

## 🚀 Méthode 2 : Via l'API (curl)

Si vous préférez utiliser la ligne de commande :

### Étape 1 : Créer l'utilisateur via API

```bash
# Remplacez VOTRE_SERVICE_ROLE_KEY par votre clé depuis .env.local
# Cette méthode crée l'utilisateur avec uniquement le téléphone (pas d'email)
curl -X POST 'https://igyolvupmiohrxaqtayc.supabase.co/auth/v1/admin/users' \
  -H "apikey: VOTRE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+22656636039",
    "phone_confirmed": true,
    "user_metadata": {
      "name": "Super Admin"
    }
  }'
```

La réponse JSON contiendra l'UUID dans le champ `"id"`. Copiez cet UUID.

### Étape 2 : Exécuter le script SQL avec l'UUID

Si vous avez l'UUID, vous pouvez utiliser la version alternative du script SQL (décommentée en bas du fichier) :

```sql
DO $$
DECLARE
  v_user_id UUID := 'VOTRE_UUID_ICI'::uuid;  -- Collez l'UUID ici
  v_name TEXT := 'Super Admin';
  v_phone TEXT := '+22656636039';
BEGIN
  -- ... reste du script
END $$;
```

---

## ✅ Vérification

Après avoir exécuté le script, vérifiez que le super admin a été créé :

```sql
SELECT 
  u.id,
  u.name,
  u.phone,
  u.role,
  u.clinic_id,
  au.phone as auth_phone,
  au.created_at as auth_created_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'super_admin';
```

Vous devriez voir une ligne avec :
- `role` = `super_admin`
- `clinic_id` = `NULL`
- `phone` = `+22656636039`

---

## 🐛 Dépannage

### Erreur : "Le numéro de téléphone ... n'existe pas dans auth.users"

**Cause** : L'utilisateur n'existe pas encore dans `auth.users` ou le téléphone ne correspond pas

**Solution** : 
1. Vérifiez que vous avez bien créé l'utilisateur dans Authentication > Users
2. Vérifiez que le numéro de téléphone correspond exactement à celui dans le script SQL (`+22656636039` par défaut)
3. Vérifiez que "Phone Confirmed" est bien coché lors de la création
4. Vérifiez que le format est E.164 (commence par `+` suivi du code pays)
5. Si vous avez utilisé un autre numéro, modifiez la variable `v_phone` dans le script SQL

### Erreur : "duplicate key value violates unique constraint"

**Cause** : L'utilisateur existe déjà dans `public.users`

**Solution** : C'est normal, le script utilise `ON CONFLICT DO UPDATE` pour mettre à jour. L'utilisateur sera simplement mis à jour avec le rôle `super_admin`.

---

## 📝 Notes

- Le **numéro de téléphone** est utilisé comme identifiant principal pour l'authentification OTP
- Le numéro de téléphone doit être au format **E.164** (commence par `+` suivi du code pays)
- Le champ `Phone Confirmed` doit être **coché** lors de la création (essentiel pour l'OTP)
- L'authentification se fera via OTP envoyé par WhatsApp (WasenderAPI)
- Le super admin n'a pas de `clinic_id` (c'est normal, il gère toutes les cliniques)
- Si Supabase demande un email, vous pouvez en mettre un temporaire, mais l'important est le téléphone confirmé

