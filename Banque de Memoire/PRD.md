# PRD : Plateforme Multi-Clinique SaaS (MVP)

## 1. Architecture Multi-Tenant

L'application repose sur une architecture multi-tenant à base de données unique (Single DB, Multi-tenant). L'isolation des locataires (cliniques) est garantie au niveau de la base de données (PostgreSQL) et non au niveau applicatif.

* **Identifiant pivot :** `clinic_id`. Chaque requête concernant un admin ou un rendez-vous est filtrée par cet identifiant.
* **Sécurité :** Les règles de sécurité au niveau des lignes (Row Level Security - RLS) de Supabase garantissent qu'un locataire ne peut techniquement pas interroger les données d'un autre, même en cas de faille applicative.

---

## 2. Parcours Utilisateurs (User Flows)

### A. Flux du Super Admin (Gestion globale)

1. Connexion via OTP (numéro de téléphone).
2. Accès au `/dashboard/super-admin` (vérification du rôle `super_admin`).
3. Affichage de la liste des cliniques existantes (actives/inactives).
4. Création d'une clinique :
* Saisie des infos (nom, slug, numéro WhatsApp).
* Choix des templates (Public et Admin) via un menu déroulant.
* Personnalisation (titres, couleurs, services en JSON).
* Création de l'utilisateur "Admin" initial pour cette clinique.


5. Activation et test direct via les liens générés (`/clinique/[slug]`).

### B. Flux de l'Admin Clinique (Gestion quotidienne)

1. Connexion via OTP (numéro de téléphone fourni par le Super Admin).
2. Accès au `/dashboard/admin` (redirection automatique basée sur le rôle).
3. Le layout charge le `admin_template` spécifique à sa clinique.
4. Affichage du compteur "RDV du jour" et de la liste des rendez-vous.
5. Filtrage des RDV par date.
6. Actions sur un RDV : modification du statut (`pending`, `confirmed`, `cancelled`) ou clic sur "Contacter", ouvrant WhatsApp Web/Mobile avec le numéro du patient.

### C. Flux du Patient (Prise de RDV)

1. Accès à l'URL de la clinique : `/clinique/[slug]`.
2. Le système récupère la configuration de la clinique et charge le `public_template` avec les couleurs et textes dynamiques.
3. Le patient sélectionne un service, choisit une date/heure, et saisit ses coordonnées.
4. Validation du formulaire :
* Création de l'enregistrement dans la table `appointments`.
* Redirection immédiate vers l'API WhatsApp avec un message pré-rempli (ex: "Bonjour, je viens de confirmer ma demande de RDV pour [Service] le [Date]...").



---

## 3. Schéma de Base de Données

### Table : `clinics`

| Champ | Type | Contraintes |
| --- | --- | --- |
| `id` | UUID | Primary Key, Default: `uuid_generate_v4()` |
| `name` | Text | Not Null |
| `slug` | Text | Not Null, Unique |
| `whatsapp_number` | Text | Not Null |
| `public_template` | Text | Not Null (ex: 'classic', 'modern') |
| `admin_template` | Text | Not Null (ex: 'minimal', 'advanced') |
| `primary_color` | Text | Not Null (ex: '#000000') |
| `secondary_color` | Text | Not Null |
| `hero_title` | Text | Not Null |
| `hero_subtitle` | Text | Not Null |
| `services` | JSONB | Not Null |
| `is_active` | Boolean | Default: `true` |
| `created_at` | Timestamptz | Default: `now()` |

### Table : `users` (Extension de `auth.users` Supabase)

| Champ | Type | Contraintes |
| --- | --- | --- |
| `id` | UUID | Primary Key, References `auth.users(id)` |
| `clinic_id` | UUID | Foreign Key -> `clinics(id)`, Nullable |
| `name` | Text | Not Null |
| `phone` | Text | Not Null, Unique |
| `role` | Text | Check: `role IN ('super_admin', 'admin')` |
| `created_at` | Timestamptz | Default: `now()` |

### Table : `appointments`

| Champ | Type | Contraintes |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `clinic_id` | UUID | Foreign Key -> `clinics(id)`, Not Null |
| `patient_name` | Text | Not Null |
| `patient_phone` | Text | Not Null |
| `service` | Text | Not Null |
| `date` | Date | Not Null |
| `time` | Time | Not Null |
| `message` | Text | Nullable |
| `status` | Text | Default: `'pending'`, Check: `status IN ('pending', 'confirmed', 'cancelled')` |
| `created_at` | Timestamptz | Default: `now()` |

---

## 4. RLS Policies (Sécurité)

La politique RLS (Row Level Security) est le cœur de la sécurité du MVP. Le statut de l'utilisateur est déterminé via la fonction `auth.uid()`.

* **Table `clinics**`
* *Lecture (SELECT) :* Tout le monde (permet l'affichage des pages publiques).
* *Écriture/Modif (INSERT, UPDATE, DELETE) :* Uniquement les utilisateurs ayant le rôle `super_admin`.


* **Table `users**`
* *Lecture :* Un utilisateur peut voir son propre profil. Un `super_admin` peut tout voir.
* *Écriture :* Uniquement `super_admin`.


* **Table `appointments**`
* *Lecture (SELECT) :* Un utilisateur avec le rôle `admin` peut lire si `appointments.clinic_id == users.clinic_id`. Le `super_admin` lit tout.
* *Création (INSERT) :* Tout le monde (anonymes autorisés pour la prise de RDV publique).
* *Modif (UPDATE) :* Uniquement `admin` (sur sa propre clinique) et `super_admin`.
* *Suppression (DELETE) :* Personne (conservation de l'historique, on utilise le changement de `status` à `cancelled`).



---

## 5. Logique de Sélection des Templates

Pour garder une architecture propre sans dupliquer le code de la page publique ou du dashboard, nous utiliserons un motif de composant dynamique de registre (Dictionary mapping) dans Next.js.

1. **Répertoire des templates :** Les composants UI spécifiques sont stockés dans `app/templates/public/` et `app/templates/admin/`.
2. **Mapping :** Un fichier central exporte un objet mappant les noms en base de données aux composants React.
3. **Rendu Dynamique :** Dans `app/clinique/[slug]/page.tsx`, la page charge la `clinic` depuis Supabase. Elle lit `clinic.public_template` (ex: "minimalist"), récupère le composant correspondant dans le dictionnaire, et lui passe les données de la clinique (couleurs, services) en props (`<TemplateComponent clinicData={clinic} />`).

---

## 6. Structure du Projet (Next.js)

```text
app/
├── layout.tsx                (Provider Supabase, styles globaux)
├── page.tsx                  (Landing Page Globale du SaaS)
├── clinique/
│   └── [slug]/
│       ├── page.tsx          (Résolution de la clinique + rendu du template public)
│       └── layout.tsx
├── dashboard/
│   ├── layout.tsx            (Middleware d'auth et de protection RLS)
│   ├── super-admin/
│   │   └── page.tsx          (Gestion des cliniques)
│   └── admin/
│       └── page.tsx          (Résolution dynamique du template admin selon la clinique)
├── components/
│   ├── auth/                 (Formulaire OTP Supabase)
│   ├── ui/                   (Composants génériques: Boutons, Inputs, Modals)
│   └── forms/                (Formulaire de réservation)
├── templates/
│   ├── public/
│   │   ├── classic.tsx       (Template public 1)
│   │   └── modern.tsx        (Template public 2)
│   └── admin/
│       ├── standard.tsx      (Template admin 1)
│       └── compact.tsx       (Template admin 2)
├── lib/
│   ├── supabase/
│   │   ├── client.ts         (Client Browser)
│   │   └── server.ts         (Client Server)
│   └── utils.ts              (Formatage dates, téléphone, classes CSS Tailwind)
└── types/
    └── database.ts           (Types générés via Supabase CLI)

```

---

## 7. Étapes de Déploiement

1. **Configuration Supabase :**
* Créer un projet Supabase.
* Activer l'authentification par téléphone (Phone Auth / OTP) via un provider comme Twilio ou MessageBird dans les paramètres Supabase.
* Exécuter les scripts SQL pour générer les tables et les policies RLS.
* Générer les types TypeScript (`supabase gen types typescript`).


2. **Configuration Next.js & Vercel :**
* Lier le dépôt GitHub à Vercel.
* Ajouter les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans Vercel.


3. **Lancement MVP :**
* Créer manuellement le premier `super_admin` dans la base de données Supabase.
* Déployer la branche principale sur Vercel.



---

## 8. Limites Explicites du MVP (Hors Scope)

Pour garantir une mise sur le marché rapide, les éléments suivants sont **strictement exclus** de cette version :

* **Paiement en ligne :** La plateforme gère la réservation, la transaction se fait sur place.
* **Espace Patient :** Les patients n'ont pas de compte pour suivre ou annuler un RDV eux-mêmes. Ils contactent la clinique via WhatsApp.
* **Rappels automatisés (SMS/Email) :** Le MVP s'appuie sur le contact direct via le lien WhatsApp.
* **Statistiques avancées :** Le dashboard admin n'affiche que le compteur du jour. Les graphiques ou rapports d'activité seront pour la V2.
* **Synchronisation d'agendas :** Pas de synchronisation avec Google Calendar ou Outlook.
