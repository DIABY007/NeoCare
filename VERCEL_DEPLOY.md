# 🚀 Guide de Déploiement sur Vercel

Ce guide vous explique comment déployer NeoCare sur Vercel.

## 📋 Prérequis

1. Un compte Vercel ([vercel.com](https://vercel.com))
2. Un compte Supabase avec un projet configuré
3. Un compte WasenderAPI avec une clé API

## 🔧 Configuration sur Vercel

### 1. Connecter votre projet

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez votre repository GitHub/GitLab/Bitbucket
4. Vercel détectera automatiquement Next.js

### 2. Variables d'environnement

Dans les paramètres du projet Vercel, allez dans **Settings → Environment Variables** et ajoutez :

#### Variables Supabase (obligatoires)
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role
```

#### Variables WasenderAPI (obligatoires)
```
WASENDER_API_KEY=votre-cle-wasender
WASENDER_API_URL=https://www.wasenderapi.com/api
```

### 3. Configuration du build

Vercel détectera automatiquement :
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

Le fichier `vercel.json` est déjà configuré pour optimiser le déploiement.

## ✅ Vérification après déploiement

1. Vérifiez que l'application se charge correctement
2. Testez la connexion avec un numéro de téléphone
3. Vérifiez que les API routes fonctionnent
4. Testez la création de rendez-vous

## 🔒 Sécurité

- ⚠️ **Ne jamais** commiter les variables d'environnement dans Git
- ✅ Utilisez les variables d'environnement Vercel pour la production
- ✅ Utilisez des clés différentes pour le développement et la production

## 📝 Notes importantes

- Les routes `/dashboard/*` sont dynamiques (force-dynamic) car elles utilisent les cookies
- Le middleware gère l'authentification et le routage basé sur les rôles
- Assurez-vous que votre base de données Supabase est correctement configurée avec les tables et politiques RLS

## 🐛 Dépannage

Si vous rencontrez des erreurs :

1. **Erreur de build** : Vérifiez les logs de build dans Vercel
2. **Erreur de connexion Supabase** : Vérifiez que les variables d'environnement sont correctes
3. **Erreur d'authentification** : Vérifiez que les cookies sont bien configurés (secure en production)

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)



