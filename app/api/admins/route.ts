import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import * as z from "zod";

const createAdminSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\+226\d{8}$/),
  clinic_id: z.string().uuid(),
});

// POST /api/admins - Créer un nouvel administrateur pour une clinique
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Seuls les admins peuvent créer d'autres admins pour leur clinique
    if (!user || user.role !== "admin" || !user.clinic_id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createAdminSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Vérifier que l'admin crée un admin pour sa propre clinique
    if (data.clinic_id !== user.clinic_id) {
      return NextResponse.json(
        { error: "Vous ne pouvez créer des admins que pour votre propre clinique" },
        { status: 403 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Vérifier que le téléphone n'existe pas déjà
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("phone", data.phone)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Ce numéro de téléphone est déjà utilisé" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà dans auth.users
    let authUser = null;
    let userExistsInAuth = false;

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users.find(
      (u) => u.phone === data.phone || u.phone?.replace(/[\s\-\+]/g, "") === data.phone.replace(/[\s\-\+]/g, "")
    );

    if (existingAuthUser) {
      userExistsInAuth = true;
      authUser = { user: existingAuthUser };
    } else {
      // Créer l'utilisateur admin dans auth.users
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        phone: data.phone,
        phone_confirm: true,
        user_metadata: {
          name: data.name,
        },
      });

      if (authError || !newAuthUser.user) {
        console.error("Erreur création admin auth:", authError);
        return NextResponse.json(
          { error: "Erreur lors de la création de l'administrateur" },
          { status: 500 }
        );
      }

      authUser = newAuthUser;
    }

    // Créer ou mettre à jour l'utilisateur admin dans public.users (upsert)
    const { error: userError } = await supabase
      .from("users")
      .upsert(
        {
          id: authUser.user.id,
          name: data.name,
          phone: data.phone,
          role: "admin",
          clinic_id: data.clinic_id,
        },
        {
          onConflict: "id",
        }
      );

    if (userError) {
      console.error("Erreur création admin public:", userError);
      // Rollback: supprimer l'utilisateur auth si on l'a créé
      if (!userExistsInAuth) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      }
      return NextResponse.json(
        { error: "Erreur lors de la création de l'administrateur" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Administrateur créé avec succès",
    });
  } catch (error) {
    console.error("Erreur API admins POST:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}



