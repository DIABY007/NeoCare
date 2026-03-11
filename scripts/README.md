# Scripts SQL - NeoCare

Ce dossier contient les scripts SQL nécessaires pour initialiser la base de données Supabase.

## 📋 Ordre d'exécution

1. **create-tables.sql** - Créer toutes les tables, contraintes, triggers et politiques RLS
2. **create-super-admin.sql** - Créer le premier super admin (après avoir créé un utilisateur dans auth.users)

## 🚀 Instructions

### 1. Créer les tables

1. Ouvrir le SQL Editor dans Supabase Dashboard
2. Copier-coller le contenu de `create-tables.sql`
3. Exécuter le script
4. Vérifier qu'il n'y a pas d'erreurs

### 2. Créer le premier Super Admin

**Étape 1 : Créer l'utilisateur dans auth.users**

Via l'interface Supabase :
- Aller dans **Authentication > Users**
- Cliquer sur **"Add User"** > **"Create new user"**
- Remplir :
  - **Phone** : `+33612345678` (format E.164, remplacez par votre numéro)
  - **Phone Confirmed** : ✅ (coché)
  - **User Metadata** > **name** : `Super Admin`
- **Copier l'UUID** de l'utilisateur créé

**Étape 2 : Exécuter le script SQL**

1. Ouvrir le SQL Editor dans Supabase Dashboard
2. Ouvrir `create-super-admin.sql`
3. Remplacer :
   - `USER_UUID_FROM_AUTH` par l'UUID copié à l'étape 1
   - `'Super Admin'` par le nom souhaité
   - `'+33612345678'` par le numéro de téléphone réel (format E.164)
4. Exécuter le script
5. Vérifier avec la requête de vérification incluse dans le script

## ✅ Vérification

Après avoir exécuté les scripts, vous devriez avoir :

- ✅ 3 tables créées : `clinics`, `users`, `appointments`
- ✅ RLS activé sur toutes les tables
- ✅ Un utilisateur `super_admin` dans `public.users`
- ✅ Le trigger automatique pour créer des users lors de l'inscription

## 🔒 Sécurité

⚠️ **Important** : Ne partagez jamais vos clés Supabase (Service Role Key) publiquement.
Ces scripts sont sécurisés et utilisent les politiques RLS pour protéger les données.



