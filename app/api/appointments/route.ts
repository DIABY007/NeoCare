import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import * as z from "zod";

const appointmentSchema = z.object({
  clinic_id: z.string().uuid(),
  patient_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  patient_phone: z.string().regex(/^\+226\d{8}$/, "Format: +226XXXXXXXX (8 chiffres après +226)"),
  service: z.string().min(1, "Veuillez sélectionner un service"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format d'heure invalide (HH:mm)"),
  message: z.string().optional(),
});

// GET /api/appointments - Récupérer les rendez-vous de la clinique de l'admin
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin" || !user.clinic_id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const supabase = await createServiceRoleClient();
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("clinic_id", user.clinic_id)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      console.error("Erreur récupération rendez-vous:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des rendez-vous" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointments: appointments || [] });
  } catch (error) {
    console.error("Erreur API appointments GET:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Créer un nouveau rendez-vous (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = appointmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;
    const supabase = await createServiceRoleClient();

    // Vérifier que la clinique existe et est active
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, is_active")
      .eq("id", data.clinic_id)
      .single();

    if (clinicError || !clinic || !clinic.is_active) {
      return NextResponse.json(
        { error: "Clinique non trouvée ou inactive" },
        { status: 404 }
      );
    }

    // Vérifier que le service existe dans la liste des services de la clinique
    const { data: fullClinic } = await supabase
      .from("clinics")
      .select("services")
      .eq("id", data.clinic_id)
      .single();

    if (fullClinic?.services) {
      const services = fullClinic.services as Array<{ id: string; name: string }>;
      const serviceExists = services.some((s) => s.id === data.service);
      if (!serviceExists) {
        return NextResponse.json(
          { error: "Service invalide" },
          { status: 400 }
        );
      }
    }

    // Vérifier que la date n'est pas dans le passé
    const appointmentDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return NextResponse.json(
        { error: "La date ne peut pas être dans le passé" },
        { status: 400 }
      );
    }

    // Vérifier que la date n'est pas plus de 3 mois dans le futur
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (appointmentDate > maxDate) {
      return NextResponse.json(
        { error: "La date ne peut pas être plus de 3 mois dans le futur" },
        { status: 400 }
      );
    }

    // Vérifier que ce n'est pas un dimanche
    if (appointmentDate.getDay() === 0) {
      return NextResponse.json(
        { error: "Les rendez-vous ne sont pas disponibles le dimanche" },
        { status: 400 }
      );
    }

    // Vérifier que l'heure est entre 08:00 et 19:00
    const [hours, minutes] = data.time.split(":").map(Number);
    if (hours < 8 || hours > 19 || (hours === 19 && minutes > 0)) {
      return NextResponse.json(
        { error: "L'heure doit être entre 08:00 et 19:00" },
        { status: 400 }
      );
    }

    // Créer le rendez-vous
    const { data: appointment, error: insertError } = await supabase
      .from("appointments")
      .insert({
        clinic_id: data.clinic_id,
        patient_name: data.patient_name,
        patient_phone: data.patient_phone,
        service: data.service,
        date: data.date,
        time: data.time,
        message: data.message || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError || !appointment) {
      console.error("Erreur création rendez-vous:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la création du rendez-vous" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment,
      message: "Rendez-vous créé avec succès",
    });
  } catch (error) {
    console.error("Erreur API appointments POST:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
