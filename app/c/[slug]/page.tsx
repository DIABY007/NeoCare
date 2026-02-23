import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { PublicTemplate } from "@/templates/public";
import { PublicClinicPage } from "@/components/public/clinic-page";
import { normalizeService } from "@/lib/appointment-utils";

export default async function ClinicPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServiceRoleClient();

  // Récupérer la clinique par slug
  const { data: clinic, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !clinic) {
    notFound();
  }

  // Normaliser les services pour s'assurer qu'ils ont toutes les propriétés
  const normalizedClinic = {
    ...clinic,
    services: Array.isArray(clinic.services)
      ? clinic.services.map(normalizeService)
      : [],
  };

  return <PublicClinicPage clinic={normalizedClinic} />;
}

