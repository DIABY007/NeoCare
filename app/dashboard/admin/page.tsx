import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard/super-admin");
  }

  if (!user.clinic_id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Aucune clinique associée à votre compte</p>
        </div>
      </div>
    );
  }

  // Récupérer le slug de la clinique pour rediriger vers la route avec slug
  const supabase = await createServiceRoleClient();
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("slug")
    .eq("id", user.clinic_id)
    .single();

  if (clinicError || !clinic || !clinic.slug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Erreur lors du chargement de la clinique</p>
        </div>
      </div>
    );
  }

  // Rediriger vers la route avec slug
  redirect(`/dashboard/admin/${clinic.slug}`);
}

