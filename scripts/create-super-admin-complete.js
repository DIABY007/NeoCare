#!/usr/bin/env node
/**
 * Script tout-en-un pour créer le Super Admin
 * 
 * Ce script automatise complètement la création du premier super admin :
 * 1. Crée l'utilisateur dans auth.users via l'API Supabase Admin
 * 2. Insère l'utilisateur dans public.users avec le rôle super_admin
 * 3. Vérifie que tout a été créé correctement
 * 
 * Le script est idempotent : il peut être exécuté plusieurs fois sans problème.
 * Si l'utilisateur existe déjà, il sera mis à jour au lieu d'être créé.
 * 
 * Prérequis :
 * - Avoir exécuté le script create-tables.sql dans Supabase
 * - Avoir un fichier .env.local avec NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
 * 
 * Usage:
 *   node scripts/create-super-admin-complete.js
 *   ou
 *   npm run create-super-admin
 * 
 * Configuration :
 *   Modifiez les constantes PHONE et NAME dans le script si nécessaire
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Erreur: Fichier .env.local introuvable');
    console.error('Créez le fichier .env.local avec vos clés Supabase (voir ENV_SETUP.md)');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        // Supprimer les guillemets simples ou doubles autour de la valeur
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key.trim()] = value;
      }
    }
  });

  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erreur: Variables d\'environnement manquantes');
  console.error('Vérifiez que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local');
  process.exit(1);
}

// Configuration
const PHONE = '+22656636039'; // ⚠️ Modifiez si nécessaire
const NAME = 'Super Admin';    // ⚠️ Modifiez si nécessaire

async function createSuperAdmin() {
  console.log('🚀 Création du Super Admin...\n');
  console.log(`   Téléphone: ${PHONE}`);
  console.log(`   Nom: ${NAME}\n`);

  // Créer le client Supabase avec service_role pour les opérations admin
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // ÉTAPE 1 : Créer l'utilisateur dans auth.users
    console.log('📝 Étape 1: Création de l\'utilisateur dans auth.users...');
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      phone: PHONE,
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
        console.log('   Recherche de l\'utilisateur existant...');
        let existingUser = null;
        let page = 0;
        const perPage = 1000;
        let hasMore = true;
        
        while (!existingUser && hasMore) {
          const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
            page: page,
            perPage: perPage,
          });
          
          if (listError) {
            throw new Error(`Erreur lors de la récupération des utilisateurs: ${listError.message}`);
          }

          if (!existingUsers || !existingUsers.users) {
            break;
          }

          // Chercher l'utilisateur par téléphone (normalisé pour éviter les problèmes de format)
          existingUser = existingUsers.users.find(u => {
            const userPhone = u.phone?.trim();
            const searchPhone = PHONE.trim();
            return userPhone === searchPhone || 
                   userPhone?.replace(/\s/g, '') === searchPhone.replace(/\s/g, '');
          });
          
          if (existingUser) {
            break;
          }
          
          // Si on a moins d'utilisateurs que perPage, on a fini
          if (existingUsers.users.length < perPage) {
            hasMore = false;
          } else {
            page++;
          }
        }
        
        if (!existingUser) {
          // Si on ne trouve toujours pas, on ne peut pas continuer
          throw new Error(
            `Utilisateur avec le téléphone ${PHONE} non trouvé dans auth.users.\n` +
            `Veuillez créer l'utilisateur dans auth.users d'abord via l'interface Supabase ou l'API.`
          );
        }

        console.log(`✅ Utilisateur existant trouvé: ${existingUser.id}`);
        
        // ÉTAPE 2 : Insérer ou mettre à jour dans public.users
        await insertIntoPublicUsers(existingUser.id, supabase);
        
        console.log('\n✅ Super Admin mis à jour avec succès !');
        console.log(`   UUID: ${existingUser.id}`);
        console.log(`   Téléphone: ${PHONE}`);
        console.log(`   Nom: ${NAME}`);
        console.log(`   Rôle: super_admin\n`);
        
        // Vérification
        await verifySuperAdmin(existingUser.id, supabase);
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
    console.error('\n❌ Erreur:', error.message || error);
    
    // Afficher des suggestions selon le type d'erreur
    if (error.message && error.message.includes('auth.users')) {
      console.error('\n💡 Suggestion:');
      console.error('   Créez d\'abord l\'utilisateur dans auth.users via:');
      console.error('   - L\'interface Supabase Dashboard (Authentication > Users)');
      console.error('   - Ou via l\'API avec curl (voir la documentation)');
    }
    
    if (error.message && error.message.includes('table') && error.message.includes('does not exist')) {
      console.error('\n💡 Suggestion:');
      console.error('   Exécutez d\'abord le script create-tables.sql dans Supabase SQL Editor');
    }
    
    if (error.message && error.message.includes('permission') || error.message.includes('RLS')) {
      console.error('\n💡 Suggestion:');
      console.error('   Vérifiez que votre SERVICE_ROLE_KEY est correcte dans .env.local');
      console.error('   Vérifiez que les politiques RLS sont bien configurées dans Supabase');
    }
    
    if (error.stack && process.env.DEBUG) {
      console.error('\nStack trace:', error.stack);
    }
    
    process.exit(1);
  }
}

async function insertIntoPublicUsers(userId, supabase) {
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
    // Vérifier si c'est une erreur de table manquante
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      throw new Error(
        `Erreur: La table public.users n'existe pas.\n` +
        `Veuillez d'abord exécuter le script create-tables.sql dans Supabase.`
      );
    }
    // Vérifier si c'est une erreur de permissions
    if (error.message.includes('permission') || error.message.includes('RLS')) {
      throw new Error(
        `Erreur de permissions: ${error.message}\n` +
        `Vérifiez que votre SERVICE_ROLE_KEY est correcte et que les politiques RLS sont bien configurées.`
      );
    }
    throw new Error(`Erreur lors de l'insertion dans public.users: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Aucune donnée retournée après l\'insertion dans public.users');
  }

  console.log('✅ Utilisateur inséré/mis à jour dans public.users\n');
}

async function verifySuperAdmin(userId, supabase) {
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
createSuperAdmin().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});

