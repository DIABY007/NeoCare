# NeoCare - Plateforme Multi-Clinique SaaS

Plateforme SaaS complète de gestion de rendez-vous pour cliniques avec architecture multi-tenant, authentification OTP, et intégration WhatsApp.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Structure du projet](#structure-du-projet)
- [Routes et URLs](#routes-et-urls)
- [Base de données](#base-de-données)
- [Sécurité](#sécurité)
- [Déploiement](#déploiement)

## 🎯 Vue d'ensemble

NeoCare est une plateforme SaaS permettant aux cliniques de gérer leurs rendez-vous en ligne. Chaque clinique dispose de :
- Une page publique personnalisable pour la prise de rendez-vous
- Un dashboard d'administration pour gérer les rendez-vous
- Une intégration WhatsApp pour la communication avec les patients
- Un système de templates personnalisables (public et admin)

### Types d'utilisateurs

1. **Super Admin** : Gère toutes les cliniques de la plateforme
2. **Admin Clinique** : Gère les rendez-vous de sa clinique
3. **Patient** : Prend rendez-vous via la page publique

## ✨ Fonctionnalités

### Pour le Super Admin

- ✅ Authentification OTP par téléphone
- ✅ Dashboard responsive (mobile-first)
- ✅ Liste de toutes les cliniques (actives/inactives)
- ✅ Création de nouvelles cliniques avec :
  - Configuration complète (nom, slug, WhatsApp)
  - Choix des templates (Public et Admin)
  - Personnalisation des couleurs et textes
  - Configuration avancée des services (durée, buffers, plages horaires, pauses, limites)
  - Création automatique du premier administrateur
- ✅ Modification des cliniques existantes
- ✅ Activation/désactivation des cliniques

### Pour l'Admin Clinique

- ✅ Authentification OTP par téléphone
- ✅ Accès au dashboard via `/dashboard/admin/[slug]` (avec redirection automatique)
- ✅ Dashboard personnalisé selon le template choisi (Minimal ou Advanced)
- ✅ Affichage des rendez-vous avec :
  - Compteur des RDV du jour (pending, confirmed, cancelled)
  - Filtrage par date
  - Filtrage par statut (Advanced template)
- ✅ Gestion des rendez-vous :
  - Modification du statut (pending → confirmed/cancelled)
  - Contact direct via WhatsApp avec le patient
  - Messages de confirmation/rejet pré-remplis
- ✅ Création d'administrateurs supplémentaires pour sa clinique

### Pour les Patients

- ✅ Accès à la page publique via `/clinique/[slug]` ou `/c/[slug]`
- ✅ Templates publics personnalisables (Classic ou Modern)
- ✅ Prise de rendez-vous en ligne avec :
  - Sélection du service
  - Choix de la date et de l'heure (créneaux disponibles)
  - Saisie des coordonnées (nom, téléphone, message optionnel)
- ✅ Redirection automatique vers WhatsApp après réservation
- ✅ Validation des créneaux disponibles en temps réel

### Fonctionnalités avancées des services

- ✅ **Durée de consultation** : Configurable par service (15-120 minutes)
- ✅ **Buffers** : Temps de préparation avant et après consultation
- ✅ **Plages horaires** : Horaires spécifiques par jour de la semaine
- ✅ **Bornes de journée** : Heures de début et fin de journée
- ✅ **Pauses** : Pauses récurrentes ou ponctuelles (avec dates spécifiques)
- ✅ **Jours actifs** : Sélection des jours d'ouverture
- ✅ **Limites de RDV** : Par créneau ou par jour
- ✅ **Dates exceptionnelles** : Jours d'exception et jours fériés
- ✅ **Génération automatique des créneaux** : Calcul intelligent des disponibilités

## 🏗️ Architecture

### Architecture Multi-Tenant

L'application utilise une architecture **Single DB, Multi-tenant** :
- **Isolation** : Chaque clinique est isolée via `clinic_id`
- **Sécurité** : Row Level Security (RLS) au niveau PostgreSQL
- **Scalabilité** : Base de données unique pour toutes les cliniques

### Stack technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth (OTP par téléphone)
- **UI Components** : shadcn/ui (Radix UI)
- **Validation** : Zod + React Hook Form
- **Déploiement** : Vercel

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Compte Supabase
- Compte WasenderAPI (pour l'envoi d'OTP)

### Installation

1. **Cloner le dépôt** :
```bash
git clone https://github.com/DIABY007/NeoCare.git
cd NeoCare
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Configurer les variables d'environnement** :
Créer un fichier `.env.local` avec :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
WASENDER_API_KEY=votre_cle_wasender
WASENDER_API_URL=https://www.wasenderapi.com/api
```

4. **Configurer la base de données** :
- Exécuter le script `scripts/create-tables.sql` dans Supabase SQL Editor
- Activer l'authentification par téléphone dans Supabase Auth

5. **Créer le premier Super Admin** :
```bash
npm run create-super-admin
```
Ou suivre les instructions dans `scripts/GUIDE_CREATION_SUPER_ADMIN.md`

6. **Lancer le serveur de développement** :
```bash
npm run dev
```

7. **Ouvrir** [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
NeoCare/
├── app/                          # Pages Next.js (App Router)
│   ├── api/                      # Routes API
│   │   ├── appointments/         # Gestion des rendez-vous
│   │   ├── clinics/             # Gestion des cliniques
│   │   ├── admins/               # Gestion des admins
│   │   └── auth/                 # Authentification (OTP)
│   ├── dashboard/
│   │   ├── admin/
│   │   │   ├── [slug]/           # Dashboard admin avec slug
│   │   │   └── page.tsx          # Redirection vers slug
│   │   └── super-admin/          # Dashboard super admin
│   ├── clinique/[slug]/          # Page publique de la clinique
│   ├── c/[slug]/                 # Alias court pour page publique
│   └── login/                     # Page de connexion
├── components/
│   ├── dashboard/                # Composants dashboard
│   ├── auth/                     # Composants authentification
│   ├── public/                    # Composants pages publiques
│   └── ui/                       # Composants UI (shadcn/ui)
├── templates/
│   ├── admin/                    # Templates dashboard admin
│   │   ├── minimal.tsx
│   │   └── advanced.tsx
│   └── public/                   # Templates pages publiques
│       ├── classic.tsx
│       └── modern.tsx
├── lib/
│   ├── supabase/                 # Clients Supabase
│   ├── auth.ts                   # Utilitaires authentification
│   ├── appointment-utils.ts      # Logique de génération créneaux
│   └── utils.ts                   # Utilitaires généraux
├── scripts/                      # Scripts SQL et utilitaires
└── middleware.ts                 # Protection des routes
```

## 🛣️ Routes et URLs

### Routes publiques

- `/` - Page d'accueil / Landing page
- `/login` - Page de connexion OTP
- `/clinique/[slug]` - Page publique de prise de RDV
- `/c/[slug]` - Alias court pour page publique

### Routes Super Admin

- `/dashboard/super-admin` - Dashboard de gestion des cliniques

### Routes Admin Clinique

- `/dashboard/admin` - Redirige vers `/dashboard/admin/[slug]`
- `/dashboard/admin/[slug]` - Dashboard de gestion des rendez-vous

### Routes API

- `POST /api/auth/send-otp` - Envoi du code OTP
- `POST /api/auth/verify-otp` - Vérification du code OTP
- `GET /api/clinics` - Liste des cliniques (Super Admin)
- `POST /api/clinics` - Création d'une clinique
- `PUT /api/clinics/[id]` - Modification d'une clinique
- `GET /api/appointments` - Liste des rendez-vous (Admin)
- `POST /api/appointments` - Création d'un rendez-vous (Public)
- `PATCH /api/appointments/[id]` - Modification d'un rendez-vous
- `GET /api/appointments/availability` - Disponibilités pour une date

## 🗄️ Base de données

### Tables principales

#### `clinics`
- Informations de la clinique (nom, slug, WhatsApp, templates, couleurs)
- Services configurés (JSONB)
- Statut actif/inactif

#### `users`
- Extension de `auth.users`
- Rôles : `super_admin` ou `admin`
- Association à une clinique via `clinic_id`

#### `appointments`
- Rendez-vous des patients
- Statuts : `pending`, `confirmed`, `cancelled`
- Association à une clinique via `clinic_id`

### Sécurité (RLS)

- **clinics** : Lecture publique, écriture réservée au super_admin
- **users** : Lecture de sa propre ligne, écriture réservée au super_admin
- **appointments** : 
  - Insertion publique (pour prise de RDV)
  - Lecture/modification filtrée par `clinic_id` pour les admins

## 🔒 Sécurité

- ✅ **Row Level Security (RLS)** : Isolation des données au niveau base de données
- ✅ **Middleware** : Protection des routes dashboard
- ✅ **Vérification des rôles** : Redirection automatique selon le rôle
- ✅ **Validation des slugs** : Vérification que l'admin accède uniquement à sa clinique
- ✅ **Validation des données** : Zod pour la validation côté serveur
- ✅ **Authentification OTP** : Connexion sécurisée par code à usage unique

## 🎨 Personnalisation

### Templates Publics

- **Classic** : Design classique et épuré
- **Modern** : Design moderne avec animations

### Templates Admin

- **Minimal** : Interface simple et efficace
- **Advanced** : Interface complète avec filtres avancés

### Personnalisation par clinique

- Couleurs primaire et secondaire
- Titre et sous-titre de la page hero
- Services configurés individuellement
- Templates choisis indépendamment

## 📱 Responsive Design

- ✅ **Mobile-first** : Design optimisé pour mobile
- ✅ **Dashboard Super Admin** : Cartes sur mobile, tableau sur desktop
- ✅ **Dashboard Admin** : Interface adaptative selon le template
- ✅ **Pages publiques** : Responsive sur tous les écrans

## 🚢 Déploiement

### Vercel (Recommandé)

1. **Lier le dépôt GitHub à Vercel**
2. **Configurer les variables d'environnement** dans Vercel
3. **Déployer** : Le déploiement est automatique à chaque push

Voir `VERCEL_DEPLOY.md` pour plus de détails.

### Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Vérification ESLint
npm run create-super-admin  # Créer un super admin
```

## 📚 Documentation supplémentaire

- `Banque de Memoire/PRD.md` - Product Requirements Document complet
- `Banque de Memoire/implementation.md` - Plan d'implémentation détaillé
- `scripts/README.md` - Documentation des scripts SQL
- `ENV_SETUP.md` - Guide de configuration des variables d'environnement
- `VERCEL_DEPLOY.md` - Guide de déploiement sur Vercel

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est privé et propriétaire.

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**NeoCare** - Simplifiez la gestion de vos rendez-vous en ligne 🏥
