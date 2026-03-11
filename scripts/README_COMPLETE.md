# 🚀 Script Tout-en-Un : Création du Super Admin

## 📋 Description

Le script `create-super-admin-complete.js` est un script **tout-en-un** qui :

1. ✅ Crée l'utilisateur dans `auth.users` via l'API Supabase Admin
2. ✅ Insère l'utilisateur dans `public.users` avec le rôle `super_admin`
3. ✅ Vérifie que tout a été créé correctement

**Plus besoin d'exécuter plusieurs scripts séparément !**

## 🎯 Utilisation

### Méthode 1 : Via npm (Recommandé)

```bash
npm run create-super-admin
```

### Méthode 2 : Directement avec Node.js

```bash
node scripts/create-super-admin-complete.js
```

## ⚙️ Configuration

Le script lit automatiquement les variables d'environnement depuis `.env.local` :

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Personnalisation

Vous pouvez modifier les valeurs par défaut dans le script :

```javascript
const PHONE = '+22656636039'; // ⚠️ Modifiez si nécessaire
const NAME = 'Super Admin';    // ⚠️ Modifiez si nécessaire
```

## ✅ Résultat attendu

Le script affiche :

```
🚀 Création du Super Admin...

   Téléphone: +22656636039
   Nom: Super Admin

📝 Étape 1: Création de l'utilisateur dans auth.users...
✅ Utilisateur créé dans auth.users: [UUID]

📝 Étape 2: Insertion dans public.users...
✅ Utilisateur inséré/mis à jour dans public.users

✅ Super Admin créé avec succès !
   UUID: [UUID]
   Téléphone: +22656636039
   Nom: Super Admin
   Rôle: super_admin

🔍 Vérification...

✅ Vérification réussie:
   ID: [UUID]
   Nom: Super Admin
   Téléphone: +22656636039
   Rôle: super_admin
   Clinic ID: NULL (normal pour super_admin)
```

## 🔄 Gestion des utilisateurs existants

Si l'utilisateur existe déjà dans `auth.users`, le script :

1. Détecte automatiquement l'utilisateur existant
2. Récupère son UUID
3. Met à jour uniquement l'entrée dans `public.users`

**Aucune erreur, le script est idempotent !**

## 🐛 Dépannage

### Erreur : "Fichier .env.local introuvable"

**Solution** : Créez le fichier `.env.local` à la racine du projet avec vos clés Supabase (voir `ENV_SETUP.md`)

### Erreur : "Variables d'environnement manquantes"

**Solution** : Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont bien définies dans `.env.local`

### Erreur : "Erreur lors de l'insertion dans public.users"

**Solution** : 
1. Vérifiez que vous avez exécuté le script `create-tables.sql` dans Supabase
2. Vérifiez que la table `public.users` existe
3. Vérifiez que vous avez les permissions nécessaires

## 📝 Notes

- Le script est **idempotent** : vous pouvez l'exécuter plusieurs fois sans problème
- Si l'utilisateur existe déjà, il sera mis à jour au lieu d'être créé
- Le script gère automatiquement les cas d'erreur courants
- Le téléphone doit être au format **E.164** (ex: `+22656636039`)

## 🆚 Comparaison avec les autres méthodes

| Méthode | Avantages | Inconvénients |
|---------|-----------|--------------|
| **Script tout-en-un** (ce script) | ✅ Automatique<br>✅ Une seule commande<br>✅ Gestion des erreurs | Nécessite Node.js |
| Script SQL seul | ✅ Simple<br>✅ Pas de dépendances | ❌ Nécessite de créer l'utilisateur manuellement d'abord |
| Interface Supabase | ✅ Visuel<br>✅ Pas de code | ❌ Plusieurs étapes manuelles |

## 🎉 Avantages de ce script

1. **Automatisation complète** : Tout en une seule commande
2. **Gestion d'erreurs** : Détecte et gère les cas d'utilisateurs existants
3. **Vérification** : Vérifie automatiquement que tout a été créé correctement
4. **Idempotent** : Peut être exécuté plusieurs fois sans problème
5. **Configuration simple** : Lit automatiquement depuis `.env.local`



