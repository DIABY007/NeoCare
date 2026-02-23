-- Script SQL pour insérer le Super Admin dans public.users
-- UUID récupéré depuis la création de l'utilisateur dans auth.users

INSERT INTO public.users (id, name, phone, role, clinic_id)
VALUES (
  '8196837c-049b-4f60-86c0-30829522a70d'::uuid,
  'Super Admin',
  '+22656636039',
  'super_admin',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'super_admin',
  clinic_id = NULL,
  name = 'Super Admin',
  phone = '+22656636039';

-- Vérification
SELECT 
  u.id,
  u.name,
  u.phone,
  u.role,
  u.clinic_id,
  au.phone as auth_phone,
  au.created_at as auth_created_at,
  au.phone_confirmed_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'super_admin';

