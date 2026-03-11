import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

// PATCH /api/appointments/[id] - Mettre à jour le statut d'un rendez-vous
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Vérifier que le rendez-vous appartient à la clinique de l'admin
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("clinic_id")
      .eq("id", id)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: "Rendez-vous non trouvé" },
        { status: 404 }
      );
    }

    if (appointment.clinic_id !== user.clinic_id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Mettre à jour le statut
    const { data: updatedAppointment, error: updateError } = await supabase
      .from("appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur mise à jour rendez-vous:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error) {
    console.error("Erreur API appointments PATCH:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}



