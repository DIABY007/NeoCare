import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// GET /api/appointments/availability?clinic_id=xxx&date=YYYY-MM-DD
// Endpoint public pour récupérer les rendez-vous d'une date donnée
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinicId = searchParams.get("clinic_id");
    const date = searchParams.get("date");

    if (!clinicId || !date) {
      return NextResponse.json(
        { error: "clinic_id et date sont requis" },
        { status: 400 }
      );
    }

    // Valider le format de la date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Format de date invalide (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Récupérer les rendez-vous pour cette date et cette clinique
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("time, service, status")
      .eq("clinic_id", clinicId)
      .eq("date", date)
      .in("status", ["pending", "confirmed"]); // Seulement les RDV actifs

    if (error) {
      console.error("Erreur récupération rendez-vous:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des rendez-vous" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      appointments: appointments || [],
    });
  } catch (error) {
    console.error("Erreur API availability GET:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}



