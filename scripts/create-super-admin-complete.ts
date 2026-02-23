#!/usr/bin/env tsx
/**
 * Script tout-en-un pour créer le Super Admin
 * 
 * Ce script :
 * 1. Crée l'utilisateur dans auth.users via l'API Supabase Admin
 * 2. Insère l'utilisateur dans public.users avec le rôle super_admin
 * 
 * Usage: npx tsx scripts/create-super-admin-complete.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Charger les variables d'environnement depuis .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ Erreur: Fichier .env.local introuvable');
  console.error('Créez le fichier .env.local avec vos clés Supabase (voir ENV_SETUP.md)');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erreur: Variables d\'environnement manquantes');
  console.error('Vérifiez que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local');
  process.exit(1);
}

// Type assertion pour TypeScript
const SUPABASE_URL_FINAL: string = SUPABASE_URL;
const SERVICE_ROLE_KEY_FINAL: string = SERVICE_ROLE_KEY;

// Configuration
const PHONE = '+22656636039'; // ⚠️ Modifiez si nécessaire
const NAME = 'Super Admin';    // ⚠️ Modifiez si nécessaire

async function createSuperAdmin() {
  console.log('🚀 Création du Super Admin...\n');
  console.log(`   Téléphone: ${PHONE}`);
  console.log(`   Nom: ${NAME}\n`);

  // Créer le client Supabase avec service_role pour les opérations admin
  const supabase = createClient(SUPABASE_URL_FINAL, SERVICE_ROLE_KEY_FINAL, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // ÉTAPE 1 : Créer l'utilisateur dans auth.users
    console.log('📝 Étape 1: Création de l\'utilisateur dans auth.users...');
    
    // S'assurer que le téléphone commence par +
    const normalizedPhone = PHONE.startsWith('+') ? PHONE : `+${PHONE}`;
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      phone: normalizedPhone,
      phone_confirmed: true,
      user_metadata: {
        name: NAME,
      },
    });

    if (authError) {
      // Si l'utilisateur existe déjà, on le récupère
      if (authError.message.includes('already registered') || 
          authError.message.includes('already exists') ||
          authError.message.includes('User already registered') ||
          authError.message.includes('duplicate')) {
        console.log('⚠️  L\'utilisateur existe déjà dans auth.users, récupération...');
        
        // Récupérer l'utilisateur existant par téléphone
        let existingUser = null;
        let page = 0;
        const perPage = 1000;
        
        while (!existingUser) {
          const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
            page: page,
            perPage: perPage,
          });
          
          if (listError) {
            throw new Error(`Erreur lors de la récupération des utilisateurs: ${listError.message}`);
          }

          existingUser = existingUsers.users.find(u => u.phone === PHONE);
          
          if (existingUser) {
            break;
          }
          
          // Si on a moins d'utilisateurs que perPage, on a fini
          if (existingUsers.users.length < perPage) {
            break;
          }
          
          page++;
        }
        
        if (!existingUser) {
          // Si on ne trouve toujours pas, utiliser l'UUID qu'on connaît déjà
          console.log('⚠️  Utilisateur non trouvé dans la liste, utilisation de l\'UUID connu...');
          const knownUserId = '8196837c-049b-4f60-86c0-30829522a70d';
          console.log(`✅ Utilisation de l'UUID: ${knownUserId}`);
          await insertIntoPublicUsers(knownUserId, supabase);
          await verifySuperAdmin(knownUserId, supabase);
          return;
        }

        console.log(`✅ Utilisateur existant trouvé: ${existingUser.id}`);
        
        // ÉTAPE 2 : Insérer ou mettre à jour dans public.users
        await insertIntoPublicUsers(existingUser.id, supabase);
        return;
      }
      
      throw authError;
    }

    if (!authUser.user) {
      throw new Error('Aucun utilisateur créé');
    }

    console.log(`✅ Utilisateur créé dans auth.users: ${authUser.user.id}\n`);

    // ÉTAPE 2 : Insérer dans public.users
    await insertIntoPublicUsers(authUser.user.id, supabase);

    console.log('\n✅ Super Admin créé avec succès !');
    console.log(`   UUID: ${authUser.user.id}`);
    console.log(`   Téléphone: ${PHONE}`);
    console.log(`   Nom: ${NAME}`);
    console.log(`   Rôle: super_admin\n`);

    // Vérification
    await verifySuperAdmin(authUser.user.id, supabase);

  } catch (error) {
    console.error('\n❌ Erreur:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function insertIntoPublicUsers(userId: string, supabase: any) {
  console.log('📝 Étape 2: Insertion dans public.users...');

  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      name: NAME,
      phone: PHONE,
      role: 'super_admin',
      clinic_id: null,
    }, {
      onConflict: 'id',
    })
    .select();

  if (error) {
    throw new Error(`Erreur lors de l'insertion dans public.users: ${error.message}`);
  }

  console.log('✅ Utilisateur inséré/mis à jour dans public.users\n');
}

async function verifySuperAdmin(userId: string, supabase: any) {
  console.log('🔍 Vérification...\n');

  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, role, clinic_id')
    .eq('id', userId)
    .eq('role', 'super_admin')
    .single();

  if (error) {
    console.warn('⚠️  Erreur lors de la vérification:', error.message);
    return;
  }

  if (data) {
    console.log('✅ Vérification réussie:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Nom: ${data.name}`);
    console.log(`   Téléphone: ${data.phone}`);
    console.log(`   Rôle: ${data.role}`);
    console.log(`   Clinic ID: ${data.clinic_id || 'NULL (normal pour super_admin)'}`);
  } else {
    console.warn('⚠️  Aucune donnée trouvée lors de la vérification');
  }
}

// Exécuter le script
createSuperAdmin();

