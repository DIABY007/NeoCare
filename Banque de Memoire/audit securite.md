Fait un tour du code et dit moi les erreurs et probllème que tu as détecter,  et remet moi l'audit je vais les analyser avant qu'on les corrige


Worked for 1m 42s
Audit code NeoCare (priorisé)

Critique - Auth OTP contournable (prise de compte possible sans vrai OTP)
route.ts (line 13) vérifie juste la présence de code, mais ne valide jamais le code côté serveur.
Le code OTP est comparé uniquement côté client dans otp-login-form.tsx (line 120), via sessionStorage (otp-login-form.tsx (line 83)).
Impact: un attaquant peut appeler directement /api/auth/verify-otp avec un téléphone existant et un code arbitraire.

Critique - Session falsifiable via cookie non signé
L’identité repose sur neocare_user_id lu tel quel (auth.ts (line 18)) puis utilisé pour charger l’utilisateur (auth.ts (line 24)).
Le token neocare_session n’est pas validé cryptographiquement (créé en base64 simple userId:timestamp dans route.ts (line 120)).
Impact: si un UUID est connu, un cookie forgé peut donner accès au compte correspondant.

Critique - Middleware d’auth inopérant sur toutes les routes
publicRoutes contient "/" (middleware.ts (line 9)) et le test utilise startsWith (middleware.ts (line 10)) -> toutes les URLs matchent "/".
Résultat: middleware.ts (lines 13-15) laisse tout passer, la logique d’accès du middleware ne s’exécute jamais.

Critique - Exposition de secrets dans la documentation
ENV_SETUP.md (line 10), ENV_SETUP.md (line 11), ENV_SETUP.md (line 14) contiennent des clés réelles (anon, service role, API key).
Impact: compromission potentielle Supabase/WhatsApp API si ce fichier est partagé/versionné.

Élevée - Fuite de données sensibles dans les logs auth
route.ts (lines 75-78) log la liste des numéros de téléphone auth.users.
Impact: fuite PII dans logs (local/prod), risque conformité.

Élevée - Absence de rate-limit/anti-abus sur OTP
route.ts n’a ni throttle, ni tentative max, ni cooldown par IP/téléphone.
Impact: spam OTP, coût API, brute-force/fatigue utilisateur.

Élevée - Script de bootstrap avec UUID hardcodé dangereux
Fallback forcé vers UUID fixe 8196837c-... dans create-super-admin-complete.ts (line 112) et create-super-admin-complete.js (line 120).
Impact: attribution potentiellement erronée du rôle super_admin.

Moyenne - Incohérence de normalisation téléphone (+33 par défaut)
utils.ts (lines 31-36) force +33 si pas de +, alors que l’app est centrée sur +226 (ex: otp-login-form.tsx (line 60)).
Impact: comportements incohérents / erreurs envoi OTP hors parcours UI standard.

Moyenne - Règles métier date dépendantes du fuseau (risque faux positifs/négatifs)
new Date("YYYY-MM-DD") dans route.ts (line 103) peut dériver selon timezone serveur.
Impact: validation “dimanche/past/futur” potentiellement incorrecte.

Moyenne - Script SQL non idempotent à la réexécution
create policy sans garde dans create-tables.sql:105+, et triggers update_* créés sans DROP IF EXISTS (create-tables.sql:243+).
Impact: rerun du script peut échouer en environnement réel.

Moyenne - Trigger crée tout nouvel utilisateur auth en rôle admin
create-tables.sql (line 84) met role='admin' par défaut dans handle_new_user.
Impact: modèle de sécurité fragile si ouverture auth publique.

Faible - Typage relâché (any) sur zones critiques
Exemples: create-super-admin-complete.ts (line 153), route.ts (line 89), appointment-utils.ts (line 101).
Impact: dette technique, erreurs masquées à long terme.

Vérifications effectuées

npm run lint: OK (aucune erreur ESLint)
npm run build: OK (compilation/typecheck pass)
Portée

Audit principal fait sur NeoCare (racine).
Je n’ai pas audité en profondeur le sous-projet NeoLove dans ce rapport.
Si tu veux, je peux te sortir au prochain tour un plan de correction par lots (sécurité immédiate, auth/session, robustesse API, scripts/devops).


Donne moi un plan de correction par lot alors

Plan de correction par lots (ordre recommandé)

Lot 0 - Urgence sécurité (J0)

Rotation immédiate des secrets exposés (SUPABASE_SERVICE_ROLE_KEY, WASENDER_API_KEY, etc.).
Purge/remplacement des clés dans ENV_SETUP.md par des placeholders.
Désactivation des logs sensibles (numéros, listes utilisateurs) dans route.ts.
Livrable: nouveaux secrets actifs, plus aucune clé réelle dans le repo/docs.
Lot 1 - Auth OTP fiable côté serveur (J0-J1)

Déplacer la validation OTP entièrement côté serveur.
Ne plus stocker/valider le code OTP dans sessionStorage.
Ajouter expiration, tentative max, et invalidation après succès.
Livrable: impossible de se connecter via appel direct API sans OTP valide.
Lot 2 - Session robuste (J1-J2)

Remplacer le couple neocare_user_id + token base64 par une session signée/vérifiée (idéalement Supabase Auth session).
Vérifier systématiquement l’intégrité côté serveur.
Supprimer toute logique de confiance sur un user_id cookie brut.
Livrable: cookie forgé ne permet plus d’usurpation.
Lot 3 - Contrôle d’accès/middleware (J2)

Corriger la logique publicRoutes dans middleware.ts ("/" ne doit pas matcher tout).
Centraliser l’autorisation (rôle/clinique) pour éviter les divergences entre middleware, pages et API.
Livrable: routes dashboard/API strictement protégées, tests d’accès OK.
Lot 4 - Durcissement API (J2-J3)

Rate limiting sur send-otp et verify-otp (IP + téléphone).
Validation stricte des entrées (uuid/date/time), gestion timezone cohérente.
Messages d’erreur non bavards côté auth (pas d’énumération d’utilisateurs).
Livrable: anti-abus actif, erreurs propres, comportement stable.
Lot 5 - SQL et scripts d’admin (J3-J4)

Rendre create-tables.sql idempotent (policies/triggers/functions avec garde ou drop/recreate contrôlé).
Retirer UUID hardcodé des scripts super-admin.
Revoir le trigger handle_new_user (éviter rôle admin par défaut automatique).
Livrable: scripts rejouables sans casse, création super-admin sûre.
Lot 6 - Qualité et garde-fous (J4)

Ajouter tests E2E auth (OTP, session, permissions super_admin/admin).
Ajouter tests API critiques (appointments, clinics, admins).
Ajouter checklist sécurité CI (secret scan, lint, build, tests).
Livrable: pipeline qui bloque les régressions sécurité/auth.
Ordre d’exécution conseillé

Lot 0
Lot 1
Lot 2
Lot 3
Lot 4
Lot 5
Lot 6
Si tu veux, je peux te préparer juste après un plan d’implémentation technique détaillé du Lot 1 (routes, schéma table OTP, cookies, tests).










