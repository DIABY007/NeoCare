#!/usr/bin/env tsx
/**
 * Script de diagnostic pour vérifier le format du téléphone dans auth.users
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Charger les variables d'environnement
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkUsers() {
  console.log('🔍 Recherche de tous les utilisateurs dans auth.users...\n');

  const targetPhone = '+22656636039';
  let page = 0;
  const perPage = 1000;
  const allUsers: Array<{ id: string; phone: string | null; email: string | null }> = [];

  while (true) {
    const { data: usersData, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: perPage,
    });

    if (error) {
      console.error('❌ Erreur:', error);
      break;
    }

    usersData.users.forEach((u) => {
      allUsers.push({
        id: u.id,
        phone: u.phone || null,
        email: u.email || null,
      });
    });

    if (usersData.users.length < perPage) break;
    page++;
  }

  console.log(`📊 Total d'utilisateurs trouvés: ${allUsers.length}\n`);

  if (allUsers.length === 0) {
    console.log('⚠️  Aucun utilisateur trouvé dans auth.users');
    return;
  }

  console.log('📋 Liste des utilisateurs:');
  allUsers.forEach((u, index) => {
    console.log(`\n${index + 1}. ID: ${u.id}`);
    console.log(`   Téléphone: ${u.phone || '(aucun)'}`);
    console.log(`   Email: ${u.email || '(aucun)'}`);
    
    if (u.phone) {
      const normalized = u.phone.replace(/[\s\-]/g, '');
      const targetNormalized = targetPhone.replace(/[\s\-]/g, '');
      const matches = normalized === targetNormalized || u.phone === targetPhone;
      console.log(`   ✅ Correspond à ${targetPhone}: ${matches ? 'OUI' : 'NON'}`);
    }
  });

  // Chercher l'utilisateur cible
  console.log(`\n🎯 Recherche de l'utilisateur avec le téléphone: ${targetPhone}`);
  const foundUser = allUsers.find((u) => {
    if (!u.phone) return false;
    const normalized = u.phone.replace(/[\s\-]/g, '');
    const targetNormalized = targetPhone.replace(/[\s\-]/g, '');
    return normalized === targetNormalized || u.phone === targetPhone;
  });

  if (foundUser) {
    console.log(`✅ Utilisateur trouvé: ${foundUser.id}`);
    console.log(`   Téléphone stocké: "${foundUser.phone}"`);
  } else {
    console.log(`❌ Utilisateur NON trouvé avec le téléphone: ${targetPhone}`);
    console.log(`\n💡 Suggestions:`);
    console.log(`   1. Vérifiez que l'utilisateur existe dans Supabase Dashboard`);
    console.log(`   2. Vérifiez le format exact du téléphone stocké`);
    console.log(`   3. Exécutez: npm run create-super-admin`);
  }
}

checkUsers().catch(console.error);



