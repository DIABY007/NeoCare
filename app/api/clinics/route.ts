import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import * as z from "zod";

const createClinicSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  whatsapp_number: z.string().regex(/^\+226\d{8}$/),
  public_template: z.enum(["classic", "modern"]),
  admin_template: z.enum(["minimal", "advanced"]),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  hero_title: z.string().min(5),
  hero_subtitle: z.string().min(10),
  services: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      duration: z.number(),
      description: z.string(),
    })
  ),
  is_active: z.boolean().default(true),
  admin_name: z.string().min(2),
  admin_phone: z.string().regex(/^\+226\d{8}$/),
});

// GET /api/clinics - Récupérer toutes les cliniques (super_admin uniquement)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const supabase = await createServiceRoleClient();
    const { data: clinics, error } = await supabase
      .from("clinics")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération cliniques:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des cliniques" },
        { status: 500 }
      );
    }

    return NextResponse.json({ clinics: clinics || [] });
  } catch (error) {
    console.error("Erreur API clinics GET:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST /api/clinics - Créer une nouvelle clinique avec son admin
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createClinicSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;
    const supabase = await createServiceRoleClient();

    // Vérifier que le slug est unique
    const { data: existingClinic } = await supabase
      .from("clinics")
      .select("id")
      .eq("slug", data.slug)
      .single();

    if (existingClinic) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé" },
        { status: 400 }
      );
    }

    // Vérifier que le téléphone admin n'existe pas déjà
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("phone", data.admin_phone)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Ce numéro de téléphone est déjà utilisé" },
        { status: 400 }
      );
    }

    // Créer la clinique
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .insert({
        name: data.name,
        slug: data.slug,
        whatsapp_number: data.whatsapp_number,
        public_template: data.public_template,
        admin_template: data.admin_template,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        hero_title: data.hero_title,
        hero_subtitle: data.hero_subtitle,
        services: data.services,
        is_active: data.is_active,
      })
      .select()
      .single();

    if (clinicError || !clinic) {
      console.error("Erreur création clinique:", clinicError);
      return NextResponse.json(
        { error: "Erreur lors de la création de la clinique" },
        { status: 500 }
      );
    }

    // Vérifier si l'utilisateur existe déjà dans auth.users
    let authUser = null;
    let userExistsInAuth = false;

    // Chercher l'utilisateur existant par téléphone
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users.find(
      (u) => u.phone === data.admin_phone || u.phone?.replace(/[\s\-\+]/g, "") === data.admin_phone.replace(/[\s\-\+]/g, "")
    );

    if (existingAuthUser) {
      // L'utilisateur existe déjà dans auth.users
      userExistsInAuth = true;
      authUser = { user: existingAuthUser };
    } else {
      // Créer l'utilisateur admin dans auth.users
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        phone: data.admin_phone,
        phone_confirm: true,
        user_metadata: {
          name: data.admin_name,
        },
      });

      if (authError || !newAuthUser.user) {
        console.error("Erreur création admin auth:", authError);
        // Rollback: supprimer la clinique créée
        await supabase.from("clinics").delete().eq("id", clinic.id);
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
          name: data.admin_name,
          phone: data.admin_phone,
          role: "admin",
          clinic_id: clinic.id,
        },
        {
          onConflict: "id",
        }
      );

    if (userError) {
      console.error("Erreur création admin public:", userError);
      // Rollback: supprimer la clinique créée
      await supabase.from("clinics").delete().eq("id", clinic.id);
      // Ne supprimer l'utilisateur auth que s'il n'existait pas déjà
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
      clinic,
      message: "Clinique et administrateur créés avec succès",
    });
  } catch (error) {
    console.error("Erreur API clinics POST:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
