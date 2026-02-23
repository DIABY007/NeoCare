import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import * as z from "zod";

const updateClinicSchema = z.object({
  name: z.string().min(3).optional(),
  slug: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/).optional(),
  whatsapp_number: z.string().regex(/^\+226\d{8}$/).optional(),
  public_template: z.enum(["classic", "modern"]).optional(),
  admin_template: z.enum(["minimal", "advanced"]).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  hero_title: z.string().min(5).optional(),
  hero_subtitle: z.string().min(10).optional(),
  services: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        duration: z.number(),
        description: z.string(),
      })
    )
    .optional(),
  is_active: z.boolean().optional(),
});

// PUT /api/clinics/[id] - Modifier une clinique (super_admin uniquement)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateClinicSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;
    const supabase = await createServiceRoleClient();

    // Vérifier que la clinique existe
    const { data: existingClinic, error: fetchError } = await supabase
      .from("clinics")
      .select("id, slug")
      .eq("id", id)
      .single();

    if (fetchError || !existingClinic) {
      return NextResponse.json(
        { error: "Clinique non trouvée" },
        { status: 404 }
      );
    }

    // Si le slug est modifié, vérifier qu'il est unique
    if (data.slug && data.slug !== existingClinic.slug) {
      const { data: slugClinic } = await supabase
        .from("clinics")
        .select("id")
        .eq("slug", data.slug)
        .single();

      if (slugClinic) {
        return NextResponse.json(
          { error: "Ce slug est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.whatsapp_number !== undefined)
      updateData.whatsapp_number = data.whatsapp_number;
    if (data.public_template !== undefined)
      updateData.public_template = data.public_template;
    if (data.admin_template !== undefined)
      updateData.admin_template = data.admin_template;
    if (data.primary_color !== undefined)
      updateData.primary_color = data.primary_color;
    if (data.secondary_color !== undefined)
      updateData.secondary_color = data.secondary_color;
    if (data.hero_title !== undefined) updateData.hero_title = data.hero_title;
    if (data.hero_subtitle !== undefined)
      updateData.hero_subtitle = data.hero_subtitle;
    if (data.services !== undefined) updateData.services = data.services;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    // Mettre à jour la clinique
    const { data: updatedClinic, error: updateError } = await supabase
      .from("clinics")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedClinic) {
      console.error("Erreur mise à jour clinique:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de la clinique" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clinic: updatedClinic,
      message: "Clinique mise à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur API clinics PUT:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

