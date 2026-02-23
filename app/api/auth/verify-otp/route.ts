import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    console.log("[VERIFY-OTP] Tentative de vérification:", { phone, codeLength: code?.length });

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: "Téléphone et code requis" },
        { status: 400 }
      );
    }

    // Utiliser le client service_role pour vérifier l'utilisateur
    const supabaseAdmin = await createServiceRoleClient();

    // Trouver l'utilisateur par téléphone dans auth.users
    let user = null;
    let page = 0;
    const perPage = 1000;
    const allUsers: Array<{ id: string; phone: string | null }> = [];

    while (!user) {
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: page,
        perPage: perPage,
      });

      if (listError) {
        console.error("[VERIFY-OTP] Erreur listUsers:", listError);
        return NextResponse.json(
          { success: false, error: "Erreur lors de la vérification" },
          { status: 500 }
        );
      }

      // Stocker tous les utilisateurs pour le debug
      usersData.users.forEach((u) => {
        allUsers.push({ id: u.id, phone: u.phone || null });
      });

      // Chercher l'utilisateur avec le numéro exact ou en normalisant
      user = usersData.users.find((u) => {
        if (!u.phone) return false;
        
        // Normaliser les deux numéros (supprimer +, espaces, tirets)
        const normalize = (num: string) => num.replace(/[\s\-\+]/g, "");
        const normalizedPhone = normalize(phone);
        const normalizedUserPhone = normalize(u.phone);
        
        // Comparer les numéros normalisés
        if (normalizedUserPhone === normalizedPhone) return true;
        
        // Comparer avec le numéro exact (au cas où)
        if (u.phone === phone) return true;
        
        return false;
      });

      if (user) break;

      // Si on a moins d'utilisateurs que perPage, on a fini
      if (usersData.users.length < perPage) break;

      page++;
    }

    // Log pour debug
    console.log(`[VERIFY-OTP] Total utilisateurs trouvés: ${allUsers.length}`);
    console.log(`[VERIFY-OTP] Numéros de téléphone dans auth.users:`, 
      allUsers.map(u => u.phone).filter(Boolean)
    );

    if (!user) {
      console.error(`[VERIFY-OTP] Utilisateur non trouvé avec le téléphone: ${phone}`);
      console.error(`[VERIFY-OTP] Vérifiez que l'utilisateur existe dans auth.users avec ce numéro`);
      return NextResponse.json(
        { 
          success: false, 
          error: "Utilisateur non trouvé. Vérifiez que votre numéro est correct ou contactez l'administrateur." 
        },
        { status: 404 }
      );
    }

    console.log(`[VERIFY-OTP] Utilisateur trouvé: ${user.id}`);

    // Récupérer les informations de l'utilisateur depuis public.users
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, name, phone, role, clinic_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("[VERIFY-OTP] Erreur récupération userData:", userError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de la récupération des données utilisateur" },
        { status: 500 }
      );
    }

    console.log(`[VERIFY-OTP] Données utilisateur récupérées:`, { 
      id: userData.id, 
      name: userData.name, 
      role: userData.role 
    });

    // Créer une session pour l'utilisateur
    // Note: Pour l'instant, on utilise un token simple stocké dans les cookies
    // Dans une vraie implémentation, on utiliserait Supabase Auth pour créer une vraie session
    
    // Créer un token de session simple (à améliorer avec JWT)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
    
    // Stocker dans les cookies
    const cookieStore = await cookies();
    cookieStore.set("neocare_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    cookieStore.set("neocare_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        clinic_id: userData.clinic_id,
      },
    });
  } catch (error) {
    console.error("Erreur API verify-otp:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

