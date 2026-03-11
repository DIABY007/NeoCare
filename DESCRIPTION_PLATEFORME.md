# 📋 Description Complète de la Plateforme NeoCare

## 🚀 Résumé Exécutif (Commencez ici !)

**NeoCare** est une plateforme en ligne qui permet aux cliniques et cabinets de santé de gérer facilement les rendez-vous de leurs patients. 

**En simple** : Imaginez un carnet de rendez-vous automatisé où :
- 👨‍⚕️ Les **patients** peuvent réserver des rendez-vous 24/7 en ligne, sans appeler
- 🏥 Les **cliniques** gèrent facilement tous les rendez-vous dans un tableau de bord
- 👨‍💼 Un **administrateur** peut gérer plusieurs cliniques simultanément

---

## 📖 Guide de lecture rapide

| Vous êtes... | Lisez ces sections |
|---|---|
| **Nouveau sur NeoCare** | ▶ Résumé Exécutif → Architecture Visuelle → Flux Utilisateur |
| **Patient** | ▶ Flux Utilisateur Exemple 1 → Intégration WhatsApp |
| **Admin d'une Clinique** | ▶ Types d'Utilisateurs (Admin Clinique) → Flux Utilisateur Exemple 2 → Gestion des RDV |
| **Super Admin / Gestionnaire** | ▶ Types d'Utilisateurs (Super Admin) → Flux Utilisateur Exemple 3 → Dashboard Super Admin |
| **Développeur** | ▶ Architecture Technique → Routes API → Structure Base de données |
| **Investisseur / Décideur** | ▶ Vue d'ensemble → Valeur Ajoutée → Cas d'usage → Déploiement |

---

## 🎯 Vue d'Ensemble Complète

### Qu'est-ce que NeoCare ?

**NeoCare** est une plateforme SaaS (Software as a Service) complète et moderne dédiée à la gestion de rendez-vous médicaux pour les cliniques et cabinets de santé. La plateforme permet aux établissements de santé de proposer à leurs patients une interface en ligne pour prendre rendez-vous, tout en offrant aux administrateurs des outils puissants de gestion et de suivi.

### Concept Principal : Architecture Multi-Tenant

NeoCare fonctionne selon un modèle **multi-tenant**, permettant à une seule instance de l'application de gérer plusieurs cliniques de manière isolée et sécurisée. 

**Explication simple** : C'est comme un immeuble où chaque clinique a son propre appartement, avec ses données, sa décoration personnalisée, mais partagent les mêmes services techniques.

- ✅ Chaque clinique dispose de sa propre page publique personnalisable
- ✅ Chaque clinique a son propre espace d'administration
- ✅ Elles partagent la même infrastructure technique (plus économique et rapide)
- ✅ Les données d'une clinique ne sont jamais visibles aux autres

### Valeur Ajoutée

| Bénéficiaire | Avantages |
|---|---|
| **👨‍⚕️ Cliniques** | ✓ Simplifier la gestion des RDV<br>✓ Réduire les rendez-vous oubliés<br>✓ Professionnaliser l'image de marque<br>✓ Économiser du temps administratif |
| **👥 Patients** | ✓ Prendre RDV 24/7 en ligne<br>✓ Interface intuitive et simple<br>✓ Confirmation immédiate<br>✓ Communiquer via WhatsApp |
| **👨‍💼 Administrateurs** | ✓ Dashboard centralisé<br>✓ Gérer tout en temps réel<br>✓ Voir les statistiques<br>✓ Personnaliser complètement |

---

## 📊 Architecture Visuelle (Schéma Simplifié)

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATEFORME NECARE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   PARTIE     │  │    TABLEAU   │  │   GESTION    │       │
│  │   PUBLIQUE   │  │   DE BORD    │  │    SUPER     │       │
│  │              │  │   ADMIN      │  │    ADMIN     │       │
│  │   Patients   │  │              │  │              │       │
│  │ prennent RDV │  │Confirmer/    │  │Gérer toutes  │       │
│  │              │  │Annuler RDV   │  │les cliniques │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│        ↓                  ↓                   ↓              │
│   ┌─────────────────────────────────────────────┐           │
│   │   BASE DE DONNÉES SÉCURISÉE (Supabase)      │           │
│   │   (Les données de chaque clinique sont      │           │
│   │    isolées et protégées)                    │           │
│   └─────────────────────────────────────────────┘           │
│                                                               │
│  Intégrations : 📱 WhatsApp | 🔐 Sécurité OTP            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Flux Utilisateur Typique

### Exemple 1 : UN PATIENT prend RDV

```
1. Patient visite: www.monsite.com/clinique/clinique-dakar
                    ↓
2. Voit la page colorée et personnalisée de la clinique
                    ↓
3. Sélectionne un service (ex: "Consultation générale")
                    ↓
4. Choisit une date et un créneau disponible
                    ↓
5. Rentre son nom et son numéro de téléphone
                    ↓
6. Envoie le formulaire
                    ↓
7. Automatiquement redirigé vers WhatsApp pré-rempli
                    ↓
8. Envoie le message à la clinique pour confirmir la prise RDV
```

### Exemple 2 : UN ADMIN gère les RDV

```
1. Se connecte avec OTP (par téléphone seulement)
                    ↓
2. Arrive sur son tableau de bord personnalisé
                    ↓
3. Voit tous les RDV en attente du jour
                    ↓
4. Peut : ✓ Confirmer un RDV
          ✓ Annuler un RDV
          ✓ Contacter un patient via WhatsApp
                    ↓
5. Les patients reçoivent les confirmations par WhatsApp
```

### Exemple 3 : LE SUPER ADMIN gère les cliniques

```
1. Se connecte avec OTP
                    ↓
2. Voit TOUTES les cliniques en un seul endroit
                    ↓
3. Peut : ✓ Créer une nouvelle clinique
          ✓ Modifier les paramètres d'une clinique
          ✓ Créer des administrateurs pour chaque clinique
          ✓ Activer/Désactiver une clinique
                    ↓
4. Chaque clinique est complètement isolée et protégée
```

---

## 🏗️ Architecture Technique

### Architecture Multi-Tenant

NeoCare utilise une architecture **Single Database, Multi-Tenant** :

- **Base de données unique** : Toutes les cliniques partagent la même base de données PostgreSQL
- **Isolation par `clinic_id`** : Chaque enregistrement est associé à un identifiant de clinique unique
- **Sécurité au niveau base** : Row Level Security (RLS) garantit l'isolation des données au niveau PostgreSQL
- **Scalabilité** : Architecture conçue pour supporter des centaines de cliniques simultanément

### Stack Technologique

#### Frontend
- **Framework** : Next.js 15 avec App Router
- **Langage** : TypeScript pour la sécurité de type
- **Styling** : Tailwind CSS pour le design responsive
- **Composants UI** : shadcn/ui basé sur Radix UI
- **Validation** : Zod + React Hook Form
- **Icons** : Lucide React

#### Backend
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth avec OTP par téléphone
- **API** : Routes API Next.js (Server Actions)
- **Sécurité** : Row Level Security (RLS) au niveau base de données

#### Services Externes
- **WasenderAPI** : Envoi de codes OTP par SMS/WhatsApp
- **WhatsApp** : Intégration pour la communication avec les patients

#### Déploiement
- **Hébergement** : Vercel (recommandé)
- **CDN** : Vercel Edge Network
- **Base de données** : Supabase Cloud

---

## 👥 Types d'Utilisateurs

### 1. Super Admin

Le **Super Admin** est l'administrateur principal de la plateforme. Il a accès à toutes les fonctionnalités de gestion globale.

#### Rôle et Responsabilités
- Gestion de toutes les cliniques de la plateforme
- Création et configuration de nouvelles cliniques
- Création des administrateurs de cliniques
- Activation/désactivation des cliniques
- Modification des configurations des cliniques existantes
- Accès à toutes les données de toutes les cliniques

#### Fonctionnalités Disponibles
- **Dashboard Super Admin** (`/dashboard/super-admin`)
  - Vue d'ensemble de toutes les cliniques
  - Liste des cliniques actives/inactives
  - Statistiques globales
  - Interface responsive (cartes sur mobile, tableau sur desktop)

- **Gestion des Cliniques**
  - Création de nouvelles cliniques avec configuration complète
  - Modification des paramètres existants
  - Activation/désactivation
  - Visualisation des détails de chaque clinique

- **Configuration Avancée**
  - Définition du nom et du slug unique
  - Configuration du numéro WhatsApp de la clinique
  - Choix des templates (public et admin)
  - Personnalisation des couleurs (primaire et secondaire)
  - Configuration des textes (titre et sous-titre hero)
  - Configuration détaillée des services

- **Gestion des Administrateurs**
  - Création du premier administrateur lors de la création d'une clinique
  - Création d'administrateurs supplémentaires
  - Gestion des rôles et permissions

### 2. Admin Clinique

L'**Admin Clinique** est l'administrateur d'une clinique spécifique. Il gère uniquement les rendez-vous et les paramètres de sa propre clinique.

#### Rôle et Responsabilités
- Gestion des rendez-vous de sa clinique
- Confirmation ou annulation des rendez-vous
- Communication avec les patients via WhatsApp
- Création d'administrateurs supplémentaires pour sa clinique
- Consultation des statistiques de sa clinique

#### Fonctionnalités Disponibles
- **Dashboard Admin** (`/dashboard/admin/[slug]`)
  - Interface personnalisée selon le template choisi (Minimal ou Advanced)
  - Redirection automatique vers le dashboard de sa clinique

- **Gestion des Rendez-vous**
  - Affichage de tous les rendez-vous de la clinique
  - Filtrage par date
  - Filtrage par statut (template Advanced uniquement)
  - Compteur des RDV du jour (pending, confirmed, cancelled)

- **Actions sur les Rendez-vous**
  - Modification du statut : `pending` → `confirmed` ou `cancelled`
  - Contact direct via WhatsApp avec le patient
  - Messages pré-remplis pour confirmation ou rejet
  - Visualisation des détails complets (nom, téléphone, service, date, heure, message)

- **Création d'Administrateurs**
  - Possibilité de créer des administrateurs supplémentaires pour sa clinique
  - Gestion des accès au dashboard

### 3. Patient

Le **Patient** est l'utilisateur final qui souhaite prendre rendez-vous. Il n'a pas besoin de compte pour utiliser la plateforme.

#### Parcours Utilisateur
1. Accès à la page publique de la clinique via `/clinique/[slug]` ou `/c/[slug]`
2. Visualisation de la page personnalisée de la clinique
3. Sélection d'un service
4. Choix d'une date et d'un créneau horaire disponible
5. Saisie des coordonnées (nom, téléphone, message optionnel)
6. Soumission du formulaire
7. Redirection automatique vers WhatsApp avec message pré-rempli

#### Fonctionnalités Disponibles
- **Page Publique Personnalisée**
  - Design adapté selon le template choisi (Classic ou Modern)
  - Couleurs personnalisées de la clinique
  - Titre et sous-titre personnalisés
  - Liste des services disponibles

- **Prise de Rendez-vous**
  - Sélection du service souhaité
  - Calendrier interactif pour choisir la date
  - Affichage des créneaux disponibles en temps réel
  - Validation automatique des disponibilités
  - Formulaire de saisie des informations

- **Confirmation et Communication**
  - Confirmation immédiate de la prise de rendez-vous
  - Redirection vers WhatsApp avec message pré-rempli
  - Message incluant les détails du rendez-vous (service, date, heure)

---

## 🎨 Système de Templates

### Templates Publics

Les templates publics déterminent l'apparence de la page de prise de rendez-vous visible par les patients.

#### Template Classic
- Design classique et épuré
- Mise en page traditionnelle
- Focus sur la lisibilité
- Interface simple et professionnelle

#### Template Modern
- Design moderne avec animations
- Interface plus dynamique
- Expérience utilisateur améliorée
- Mise en page contemporaine

### Templates Admin

Les templates admin déterminent l'apparence du dashboard d'administration.

#### Template Minimal
- Interface simple et efficace
- Mise en page épurée
- Focus sur l'essentiel
- Navigation rapide

#### Template Advanced
- Interface complète avec fonctionnalités avancées
- Filtres supplémentaires (par statut)
- Statistiques détaillées
- Outils de gestion avancés

### Personnalisation

Chaque clinique peut personnaliser :
- **Couleurs** : Couleur primaire et couleur secondaire
- **Textes** : Titre et sous-titre de la page hero
- **Templates** : Choix indépendant pour la page publique et le dashboard
- **Services** : Configuration complète de chaque service

---

## 📅 Gestion des Services et Créneaux

### Configuration des Services

Chaque service peut être configuré avec les paramètres suivants :

#### Paramètres de Base
- **Nom du service** : Libellé affiché aux patients
- **Durée de consultation** : De 15 à 120 minutes
- **Description** : Informations complémentaires (optionnel)

#### Gestion du Temps
- **Buffers** : 
  - Temps de préparation avant la consultation
  - Temps de nettoyage après la consultation
- **Plages horaires** : Horaires spécifiques par jour de la semaine
- **Bornes de journée** : Heures de début et de fin de journée
- **Jours actifs** : Sélection des jours d'ouverture (lundi à dimanche)

#### Pauses et Exceptions
- **Pauses récurrentes** : Pauses régulières (ex: pause déjeuner quotidienne)
- **Pauses ponctuelles** : Pauses avec dates spécifiques
- **Dates exceptionnelles** : Jours d'exception et jours fériés

#### Limites et Contraintes
- **Limites par créneau** : Nombre maximum de rendez-vous par créneau horaire
- **Limites par jour** : Nombre maximum de rendez-vous par jour pour un service
- **Validation des conflits** : Vérification automatique des chevauchements

### Génération Automatique des Créneaux

Le système calcule automatiquement les créneaux disponibles en tenant compte de :
- Les horaires d'ouverture de la clinique
- La durée de chaque service
- Les buffers configurés
- Les pauses programmées
- Les rendez-vous déjà pris
- Les limites configurées
- Les dates exceptionnelles

### Disponibilité en Temps Réel

- Les créneaux sont calculés dynamiquement à chaque requête
- Seuls les créneaux réellement disponibles sont proposés
- Validation côté serveur pour garantir l'intégrité des données

---

## 🔐 Sécurité et Authentification (Expliqué simplement)

### Comment fonctionne la connexion ? (Authentification OTP)

**OTP = One-Time Password (Code à usage unique)**

```
Étape 1: L'admin entre son numéro de téléphone
         ↓
Étape 2: Le système envoie un code SECRET par SMS/WhatsApp
         Exemple: 123456 ✓
         ↓
Étape 3: L'admin saisit ce code dans l'application
         ↓
Étape 4: Si le code = correct → Connexion OK ✓
         Si le code = incorrect → Connexion refusée ✗
         ↓
Résultat: L'admin est connecté et peut gérer la clinique
```

**Pourquoi c'est sûr ?**
- ✅ Pas de mot de passe à oublier ou pirater
- ✅ Le code change à chaque connexion (usage unique)
- ✅ Seul le propriétaire du téléphone peut se connecter
- ✅ Code valable seulement quelques minutes

### Isolation des Données (Row Level Security)

**RLS = Garantie que chaque clinique ne voit QUE ses données**

```
Exemple 1 : Comment les données sont séparées
─────────────────────────────────────────────

Admin de Clinique A (se connecte)
    ↓
Voit uniquement :
  • Ses propres RDV
  • Ses propres paramètres
  • Ses propres statistiques

Admin de Clinique B (se connecte)
    ↓
Voit uniquement :
  • Ses propres RDV
  • Ses propres paramètres
  • Ses propres statistiques
  ✓ NE PEUT PAS voir les RDV de Clinique A ✓


Exemple 2 : Le Super Admin
─────────────────────────

Super Admin (se connecte avec permissions spéciales)
    ↓
Peut voir :
  • TOUS les RDV de TOUTES les cliniques
  • TOUS les paramètres de TOUTES les cliniques
  • Gérer TOUTES les cliniques

(Car il a les permissions appropriées)
```

#### Détails Techniques

La sécurité des données est garantie au niveau de la base de données PostgreSQL via les politiques RLS :

| Table | Qui peut lire | Qui peut écrire | Protection |
|-------|---|---|---|
| **clinics** | Public (pour afficher les pages) | Seulement Super Admin | ✓ Protégée |
| **users** | Chacun son profil + Super Admin voit tout | Seulement Super Admin | ✓ Protégée |
| **appointments** | Admin voit sa clinique + Super Admin voit tout | Admin modifie sa clinique + Super Admin | ✓ Protégée |

---

## 🛣️ Comment se déplacer dans la plateforme

### URLs principales (Par où aller ?)

#### Pour les PATIENTS (accès public)

| URL | Qu'est-ce qu'il y a ? | Exemple |
|-----|---|---|
| `/` | Page d'accueil de NeoCare | www.neocare.com/ |
| `/login` | Se connecter avec OTP | www.neocare.com/login |
| `/clinique/[slug]` | Page de réservation d'une clinique | www.neocare.com/clinique/clinique-dakar |
| `/c/[slug]` | Raccourci vers la page de réservation | www.neocare.com/c/clinique-dakar |

#### Pour les ADMINISTRATEURS (espace protégé)

| URL | Qu'est-ce qu'il y a ? | Qui y accède ? |
|-----|---|---|
| `/dashboard/super-admin` | Gérer TOUTES les cliniques | 🔴 Super Admin uniquement |
| `/dashboard/admin/[slug]` | Gérer les RDV d'une clinique | 🟡 Admin de la clinique |

#### Routes API (travail en coulisse)

```
Pour les patients :
POST   /api/auth/send-otp          → Envoyer le code OTP
POST   /api/auth/verify-otp        → Vérifier le code OTP
POST   /api/appointments           → Créer un RDV
GET    /api/appointments/availability → Voir les créneaux libres

Pour les admins:
PATCH  /api/appointments/[id]      → Modifier un RDV (accepter/refuser)
POST   /api/auth/signout           → Se déconnecter
```

### Protection des Routes

- **Middleware Next.js** : Vérification de l'authentification avant d'accéder aux routes `/dashboard/*`
- **Redirection automatique** : Redirection vers `/login` si non authentifié
- **Routage basé sur les rôles** : Redirection automatique selon le rôle de l'utilisateur
- **Validation des slugs** : Vérification que l'admin accède uniquement à sa propre clinique

### Validation des Données

- **Zod** : Validation côté serveur avec schémas TypeScript
- **React Hook Form** : Validation côté client avec feedback utilisateur
- **Sanitization** : Nettoyage des entrées utilisateur
- **Validation des téléphones** : Utilisation de `libphonenumber-js` pour valider les formats

---

## � Intégration WhatsApp (Communication facile)

### Pour les PATIENTS

Après avoir pris un rendez-vous en ligne, le patient est automatiquement redirigé vers WhatsApp avec un **message pré-rempli** contenant :
- ✅ Le service choisi
- ✅ La date du RDV
- ✅ L'heure du RDV
- ✅ Le numéro WhatsApp de la clinique

Exemple de flux :
```
1. Patient remplissait le formulaire en ligne
2. Clique sur "Confirmer RDV"
3. Automatiquement redirigé vers WhatsApp
4. Message pré-rempli : "Je compte venir pour [Service] le [Date] à [Heure]"
5. Patient envoie le message à la clinique
```

### Pour les ADMINISTRATEURS

Les administrateurs peuvent aussi **contacter directement les patients** via WhatsApp:
- 💬 Un bouton "Contacter patient" sur chaque RDV
- ✅ Message pré-rempli avec les détails du RDV
- ✅ Lien WhatsApp direct au patient

Messages typiques :
- **Pour confirmer** : "✓ Votre RDV du [Date] à [Heure] est confirmé"
- **Pour rejeter** : "✗ Désolé, ce créneau n'est plus disponible"

---

## 💾 Structure de la Base de Données (Simplifié)

### À quoi ça sert ?

La base de données est comme une bibliothèque très organisée où :
- 📖 Chaque "table" = un type d'information
- 📄 Chaque "ligne" = un enregistrement
- 📌 Chaque "colonne" = une propriété

### Les 3 Tables Principales

#### 1️⃣ Table "CLINICS" (Informations des cliniques)

```
┌─────────────────────────────────────────────────┐
│   CLINIQUE                                      │
├─────────────────────────────────────────────────┤
│ ID: 123abc                                      │
│ Nom: Clinique Dakar                            │
│ URL: /clinique/clinique-dakar                  │
│ WhatsApp: +221701234567                        │
│ Couleur principale: #001F3F (bleu)             │
│ Couleur secondaire: #FF4136 (rouge)            │
│ Template public: modern                        │
│ Template admin: advanced                       │
│ Services: [Consultation, Vaccin, ...]          │
│ Statut: ACTIVE ✓                               │
└─────────────────────────────────────────────────┘
```

#### 2️⃣ Table "USERS" (Administrateurs)

```
┌─────────────────────────────────────────────────┐
│   ADMINISTRATEUR                                │
├─────────────────────────────────────────────────┤
│ ID: 456def                                      │
│ Nom: Jean Dupont                               │
│ Téléphone: +221701234567                       │
│ Rôle: admin                                    │
│ Clinique gérée: Clinique Dakar (ID: 123abc)   │
└─────────────────────────────────────────────────┘
```

#### 3️⃣ Table "APPOINTMENTS" (Rendez-vous)

```
┌─────────────────────────────────────────────────┐
│   RENDEZ-VOUS                                   │
├─────────────────────────────────────────────────┤
│ ID: 789ghi                                      │
│ Clinique: Clinique Dakar (ID: 123abc)          │
│ Patient: Marie Sow                             │
│ Téléphone: +221701111111                       │
│ Service: Consultation générale                 │
│ Date: 10 Mars 2024                             │
│ Heure: 14:30                                   │
│ Message: "Je suis allergique à..."             │
│ Statut: ⏳ PENDING (en attente de confirmation)│
└─────────────────────────────────────────────────┘
```

### Sécurité des données

- 🔒 Chaque clinique ne voit QUE ses données
- 🔐 Les RDV d'une clinique sont isolés de ceux d'une autre
- 🛡️ Un admin ne peut voir que les RDV de sa clinique
- 👑 Le Super Admin voit tout (avec permissions spéciales)

---

## 📊 Fonctionnalités Avancées

### Gestion des Disponibilités

Le système calcule intelligemment les créneaux disponibles en tenant compte de :
- La durée de chaque service
- Les buffers avant et après
- Les horaires d'ouverture de la clinique
- Les pauses programmées
- Les rendez-vous déjà pris
- Les limites configurées (par créneau et par jour)
- Les dates exceptionnelles (jours fériés, fermetures)

### Filtrage et Recherche

#### Dashboard Admin
- **Filtrage par date** : Sélection d'une date pour voir les rendez-vous du jour
- **Filtrage par statut** : Filtrage par pending/confirmed/cancelled (template Advanced uniquement)
- **Compteurs** : Affichage du nombre de RDV par statut pour la date sélectionnée

#### Dashboard Super Admin
- **Liste des cliniques** : Affichage de toutes les cliniques
- **Filtrage par statut** : Affichage des cliniques actives/inactives
- **Recherche** : Recherche par nom ou slug (à venir)

### Statistiques

#### Dashboard Admin
- Compteur des RDV du jour par statut
- Vue d'ensemble des rendez-vous à venir
- Historique des rendez-vous passés

#### Dashboard Super Admin
- Nombre total de cliniques
- Nombre de cliniques actives/inactives
- Statistiques globales (à venir)

### Responsive Design

- **Mobile-first** : Design optimisé pour mobile en priorité
- **Tablette** : Adaptation automatique pour les écrans moyens
- **Desktop** : Interface complète pour les grands écrans
- **Navigation** : Menus adaptatifs selon la taille d'écran

---

## 🚀 Déploiement et Configuration

### Prérequis

- Node.js 18+ et npm
- Compte Supabase
- Compte WasenderAPI (pour l'envoi d'OTP)
- Compte Vercel (pour le déploiement)

### Variables d'Environnement

Fichier `.env.local` à créer :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# WasenderAPI
WASENDER_API_KEY=votre_cle_wasender
WASENDER_API_URL=https://www.wasenderapi.com/api
```

### Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/DIABY007/NeoCare.git
cd NeoCare
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
Créer le fichier `.env.local` avec les valeurs appropriées

4. **Configurer la base de données**
- Exécuter le script `scripts/create-tables.sql` dans Supabase SQL Editor
- Activer l'authentification par téléphone dans Supabase Auth
- Configurer WasenderAPI dans Supabase Auth

5. **Créer le premier Super Admin**
```bash
npm run create-super-admin
```

6. **Lancer le serveur de développement**
```bash
npm run dev
```

### Déploiement sur Vercel

1. **Lier le dépôt GitHub à Vercel**
2. **Configurer les variables d'environnement** dans les paramètres du projet Vercel
3. **Déployer** : Le déploiement est automatique à chaque push sur la branche principale

### Scripts Disponibles

```bash
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run start            # Serveur de production
npm run lint             # Vérification ESLint
npm run create-super-admin  # Créer un super admin
npm run check-user-phone    # Vérifier le numéro d'un utilisateur
```

---

## 📈 Évolutions Futures (Hors MVP)

Les fonctionnalités suivantes sont prévues pour les versions futures :

### Version 2.0
- **Paiement en ligne** : Intégration de solutions de paiement
- **Espace Patient** : Compte patient pour suivre et annuler les rendez-vous
- **Rappels automatisés** : SMS/Email de rappel avant le rendez-vous
- **Statistiques avancées** : Graphiques et rapports d'activité détaillés
- **Synchronisation d'agendas** : Intégration avec Google Calendar et Outlook

### Version 3.0
- **Application mobile** : Applications iOS et Android
- **Notifications push** : Notifications en temps réel
- **Chat intégré** : Système de messagerie interne
- **Gestion multi-langues** : Support de plusieurs langues
- **API publique** : API REST pour intégrations tierces

---

## 🔧 Maintenance et Support

### Logs et Monitoring

- **Vercel Analytics** : Suivi des performances et des erreurs
- **Supabase Logs** : Monitoring des requêtes base de données
- **Console Browser** : Logs côté client pour le débogage

### Sauvegarde

- **Supabase** : Sauvegardes automatiques quotidiennes
- **Vercel** : Déploiements versionnés avec possibilité de rollback

### Support Technique

Pour toute question ou problème :
- Consulter la documentation dans `Banque de Memoire/`
- Vérifier les logs dans Vercel et Supabase
- Contacter l'équipe de développement

---

## 📚 Documentation Complémentaire

- **PRD.md** : Product Requirements Document complet
- **implementation.md** : Plan d'implémentation détaillé
- **README.md** : Guide de démarrage rapide
- **ENV_SETUP.md** : Guide de configuration des variables d'environnement
- **VERCEL_DEPLOY.md** : Guide de déploiement sur Vercel
- **scripts/README.md** : Documentation des scripts SQL

---

## 🎯 Conclusion

NeoCare est une plateforme SaaS complète et moderne qui répond aux besoins des cliniques en matière de gestion de rendez-vous en ligne. Avec son architecture multi-tenant sécurisée, son système de templates personnalisables, et son intégration WhatsApp, NeoCare offre une solution professionnelle et évolutive pour la gestion des rendez-vous médicaux.

La plateforme est conçue pour être :
- **Sécurisée** : Isolation des données au niveau base de données
- **Scalable** : Architecture capable de supporter des centaines de cliniques
- **Personnalisable** : Templates et configurations adaptables à chaque clinique
- **Intuitive** : Interface utilisateur simple et efficace
- **Moderne** : Technologies récentes et bonnes pratiques

---

**NeoCare** - Simplifiez la gestion de vos rendez-vous en ligne 🏥

*Document généré le : 2024*



