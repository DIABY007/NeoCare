# Plan de Mise en Œuvre : Plateforme Multi-Clinique SaaS (MVP)

Ce document décrit les étapes d'implémentation du MVP. Chaque étape doit être exécutée séquentiellement. **Aucun code ne doit être généré sans avoir passé le test de validation de l'étape précédente.**

---

## Phase 1 : Initialisation du Projet et Architecture de Base

### Étape 1.1 : Initialisation Next.js
* **Action :** Créer un nouveau projet Next.js avec l'App Router, TypeScript, Tailwind CSS, et ESLint.
* **Test de validation :** Lancer `npm run dev`. La page par défaut de Next.js s'affiche sur `localhost:3000` sans erreur dans la console.

### Étape 1.2 : Structure des dossiers
* **Action :** Créer la structure de dossiers exacte définie dans le PRD (section 6), incluant `app/clinique/[slug]`, `app/dashboard/admin`, `app/dashboard/super-admin`, `components`, `templates`, et `lib`.
* **Test de validation :** Vérifier visuellement ou via un script que l'arborescence correspond exactement au PRD.

### Étape 1.3 : Configuration des clients Supabase
* **Action :** Installer `@supabase/ssr` et `@supabase/supabase-js`. Configurer les clients `browser` (dans `lib/supabase/client.ts`) et `server` (dans `lib/supabase/server.ts`) en utilisant les variables d'environnement.
* **Test de validation :** Importer les deux clients dans une page de test, vérifier que l'application compile sans erreur TypeScript ou de module introuvable.

---

## Phase 2 : Base de Données et Sécurité (Supabase SQL)

### Étape 2.1 : Création de la table `clinics`
* **Action :** Écrire et exécuter le script SQL pour créer la table `clinics` avec toutes les colonnes et contraintes définies dans le PRD (UUID, slug unique, JSONB pour services, etc.).
* **Test de validation :** Insérer manuellement une ligne fictive depuis le dashboard Supabase. Vérifier qu'un `slug` en double déclenche une erreur SQL.

### Étape 2.2 : Création de la table `users` et du Trigger Auth
* **Action :** Créer la table `public.users` en référence à `auth.users`. Créer une fonction et un trigger SQL pour insérer automatiquement une ligne dans `public.users` (avec le rôle `admin` par défaut) lors de la création d'un utilisateur dans l'auth Supabase.
* **Test de validation :** Créer un utilisateur depuis l'interface Auth de Supabase. Vérifier qu'une ligne correspondante apparaît automatiquement dans `public.users`.

### Étape 2.3 : Création de la table `appointments`
* **Action :** Créer la table `appointments` avec une clé étrangère pointant vers `clinics(id)`.
* **Test de validation :** Tenter d'insérer un rendez-vous avec un `clinic_id` inexistant. La base de données doit rejeter l'insertion (erreur de Foreign Key).

### Étape 2.4 : Implémentation du RLS (Table clinics)
* **Action :** Activer le RLS sur `clinics`. Ajouter une politique SELECT pour tout le monde (public) et des politiques INSERT/UPDATE/DELETE restreintes au rôle `super_admin` de la table `users`.
* **Test de validation :** Via le client Supabase anonyme, exécuter un SELECT (doit réussir) et un UPDATE (doit échouer).

### Étape 2.5 : Implémentation du RLS (Table users)
* **Action :** Activer le RLS sur `users`. Ajouter une politique SELECT (l'utilisateur lit sa propre ligne, ou `super_admin` lit tout) et INSERT/UPDATE restreintes à `super_admin`.
* **Test de validation :** Simuler un contexte utilisateur standard. Tenter de lire les données d'un autre utilisateur (doit retourner un résultat vide).

### Étape 2.6 : Implémentation du RLS (Table appointments)
* **Action :** Activer le RLS sur `appointments`. Ajouter une politique INSERT publique (anonyme). Ajouter une politique SELECT/UPDATE permettant à un `admin` de lire/modifier uniquement les rendez-vous où `appointments.clinic_id` correspond à son `users.clinic_id`.
* **Test de validation :** En tant qu'admin de la clinique A, tenter de lire les rendez-vous de la clinique B (doit retourner 0 résultat). Insérer un rendez-vous en mode anonyme (doit réussir).

### Étape 2.7 : Génération des Types TypeScript
* **Action :** Exécuter la CLI Supabase pour générer le fichier `types/database.ts` à partir du schéma actuel.
* **Test de validation :** Importer un type (ex: `Database['public']['Tables']['clinics']['Row']`) dans un fichier TypeScript et vérifier qu'aucune erreur n'est levée.

---

## Phase 3 : Authentification et Middleware

### Étape 3.1 : Composant de connexion OTP
* **Action :** Créer un composant UI avec un champ de numéro de téléphone. Implémenter la logique d'envoi de l'OTP via Supabase Auth, puis l'affichage d'un champ pour saisir le code reçu.
* **Test de validation :** Saisir un numéro de test, recevoir le code OTP dans les logs Supabase, le saisir dans l'UI, et vérifier que la session Supabase est bien créée côté client.

### Étape 3.2 : Protection des routes (Middleware)
* **Action :** Implémenter `middleware.ts` pour Next.js. Rediriger toute requête vers `/dashboard/*` non authentifiée vers la page de connexion.
* **Test de validation :** Naviguer vers `/dashboard/admin` en navigation privée. Vérifier la redirection automatique vers la page de connexion.

### Étape 3.3 : Routage basé sur les rôles (Middleware)
* **Action :** Mettre à jour le middleware pour vérifier le rôle de l'utilisateur. Rediriger le rôle `admin` essayant d'accéder à `/dashboard/super-admin` vers `/dashboard/admin` (et inversement selon la logique d'accès).
* **Test de validation :** Se connecter avec un compte `admin` et forcer l'URL vers `/dashboard/super-admin`. Vérifier la redirection vers `/dashboard/admin` ou vers une page 403.

---

## Phase 4 : Interface Utilisateur Générique et Landing Page

### Étape 4.1 : Composants UI réutilisables
* **Action :** Créer des composants de base dans `components/ui/` : Bouton, Input (texte et téléphone), Select, et Modal.
* **Test de validation :** Intégrer ces composants dans une page de test statique et vérifier que les événements (onClick, onChange) et les styles fonctionnent.

### Étape 4.2 : Landing Page Globale
* **Action :** Développer `app/page.tsx` avec une présentation du SaaS et un Call-To-Action (CTA) redirigeant vers la page de connexion/création.
* **Test de validation :** Naviguer sur l'URL racine `/` et vérifier la présence du contenu marketing et du bouton fonctionnel.

---

## Phase 5 : Dashboard Super Admin

### Étape 5.1 : Liste des cliniques
* **Action :** Développer la page `/dashboard/super-admin`. Créer une requête serveur pour récupérer toutes les cliniques et les afficher dans un tableau.
* **Test de validation :** Créer deux cliniques directement en base de données. Charger la page et vérifier que les deux apparaissent dans l'interface.

### Étape 5.2 : Formulaire de création de clinique
* **Action :** Créer un modal/formulaire pour ajouter une clinique (Nom, Slug, WhatsApp, Templates Public/Admin, Couleurs, Services en JSON). Implémenter l'insertion en base.
* **Test de validation :** Remplir le formulaire avec un slug unique. Soumettre, vérifier le succès dans l'UI et la présence des données correctes dans la table `clinics`.

### Étape 5.3 : Création du premier Admin par clinique
* **Action :** Dans le flux de création de clinique, ajouter les champs pour créer l'utilisateur Admin (Nom, Téléphone). Utiliser l'API Supabase Admin côté serveur pour contourner le flux OTP standard lors de la création.
* **Test de validation :** Créer une nouvelle clinique avec un numéro d'admin. Vérifier que l'utilisateur est bien créé dans Auth Supabase et lié au `clinic_id` dans la table `public.users`.

---

## Phase 6 : Dashboard Admin Clinique

### Étape 6.1 : Mapping des templates Admin
* **Action :** Créer le fichier d'index dans `templates/admin/` mappant les chaînes de caractères (ex: `standard`, `compact`) aux composants React correspondants. Dans le layout de l'admin, charger le template défini dans la configuration de la clinique.
* **Test de validation :** Modifier manuellement le champ `admin_template` d'une clinique en base de données. Rafraîchir le dashboard admin et vérifier que la structure visuelle change en conséquence.

### Étape 6.2 : Affichage des rendez-vous et filtre
* **Action :** Dans le composant de template admin, récupérer la liste des rendez-vous liés au `clinic_id` de l'admin connecté. Implémenter un filtre par date et le compteur "RDV du jour".
* **Test de validation :** Insérer des rendez-vous à différentes dates via la DB. Sélectionner une date dans l'UI et vérifier que la liste et le compteur se mettent à jour correctement.

### Étape 6.3 : Actions sur les rendez-vous
* **Action :** Ajouter des boutons pour modifier le statut d'un rendez-vous (`confirmed`, `cancelled`). Connecter ces boutons à des actions de mise à jour Supabase.
* **Test de validation :** Cliquer sur "Annuler" pour un rendez-vous `pending`. Vérifier que l'UI se met à jour instantanément et que le statut en DB est bien `cancelled`.

### Étape 6.4 : Redirection WhatsApp Admin
* **Action :** Ajouter un bouton "Contacter" sur chaque ligne de rendez-vous qui génère un lien `https://wa.me/{patient_phone}` et l'ouvre dans un nouvel onglet.
* **Test de validation :** Cliquer sur le bouton "Contacter". Vérifier l'ouverture d'un nouvel onglet vers l'API WhatsApp avec le numéro correct du patient.

---

## Phase 7 : Page Publique de la Clinique et Prise de RDV

### Étape 7.1 : Résolution dynamique du Slug
* **Action :** Développer `app/clinique/[slug]/page.tsx`. Écrire une requête pour fetcher les données de la clinique basée sur le `slug` de l'URL. Si introuvable, retourner une page 404.
* **Test de validation :** Naviguer vers `/clinique/slug-existant` (doit afficher une page temporaire avec le nom de la clinique). Naviguer vers `/clinique/slug-inexistant` (doit afficher 404).

### Étape 7.2 : Rendu du Template Public
* **Action :** Implémenter le dictionnaire de mapping pour `templates/public/`. Charger dynamiquement le composant spécifié par `public_template` et lui passer les couleurs (`primary_color`, etc.) et services configurés en DB.
* **Test de validation :** Changer la couleur primaire en DB. Rafraîchir la page publique et vérifier que les éléments visuels du template respectent la nouvelle couleur.

### Étape 7.3 : Formulaire de prise de rendez-vous
* **Action :** Intégrer un formulaire (Nom, Téléphone, Service depuis la liste dynamique, Date, Heure, Message). À la soumission, insérer l'enregistrement dans la table `appointments`.
* **Test de validation :** Remplir le formulaire sur la page publique. Vérifier en base de données que le rendez-vous est créé et associé au bon `clinic_id` avec le statut `pending`.

### Étape 7.4 : Redirection WhatsApp Post-Réservation
* **Action :** Immédiatement après la réussite de l'insertion du rendez-vous, déclencher une redirection vers l'API WhatsApp ciblant le numéro de la clinique (`whatsapp_number`), avec un message pré-rempli contenant les détails du RDV.
* **Test de validation :** Soumettre un rendez-vous complet. Vérifier que la fenêtre est redirigée vers WhatsApp Web avec un message du type : "Bonjour, je viens de confirmer ma demande de RDV pour [Service]...".

---

## Phase 8 : Déploiement et Audit

### Étape 8.1 : Préparation au déploiement
* **Action :** S'assurer que le fichier `.env.example` est à jour avec toutes les clés requises. Exécuter `npm run build` localement pour valider le typage et le linting.
* **Test de validation :** Le build se termine avec succès, sans erreur de type TS ni erreur ESLint fatale.

### Étape 8.2 : End-to-End Test Final
* **Action :** Déployer sur Vercel. Effectuer un test de flux complet depuis l'environnement de production.
* **Test de validation :** 1. Le Super Admin crée la "Clinique Prod" et son Admin.
  2. Un patient (navigation privée) visite la page publique, prend un RDV et est redirigé vers WhatsApp.
  3. L'Admin se connecte avec son numéro, voit le nouveau RDV, le passe en `confirmed` et clique sur "Contacter".
  *Si ce flux entier réussit, le MVP est considéré comme prêt.*