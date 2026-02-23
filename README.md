# NeoCare - Plateforme Multi-Clinique SaaS

Plateforme SaaS de gestion de rendez-vous pour cliniques avec architecture multi-tenant.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Compte Supabase
- Compte WasenderAPI

### Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
Créer un fichier `.env.local` avec :
```env
NEXT_PUBLIC_SUPABASE_URL=https://igyolvupmiohrxaqtayc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
WASENDER_API_KEY=votre_cle_wasender
WASENDER_API_URL=https://www.wasenderapi.com/api
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

4. Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

Voir le PRD pour la structure complète.

## 🗄️ Base de données

Exécuter les scripts SQL dans Supabase pour créer les tables et les politiques RLS.

## 📝 Script SQL pour créer le premier Super Admin

Voir le fichier `scripts/create-super-admin.sql`

# NeoCare
