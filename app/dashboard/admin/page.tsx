import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
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

  // Récupérer les informations de la clinique
  const supabase = await createServiceRoleClient();
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("id, name, primary_color, secondary_color, admin_template, services")
    .eq("id", user.clinic_id)
    .single();

  if (clinicError || !clinic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Erreur lors du chargement de la clinique</p>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      user={user}
      clinic={{
        id: clinic.id,
        name: clinic.name,
        primary_color: clinic.primary_color,
        secondary_color: clinic.secondary_color,
        admin_template: clinic.admin_template,
        services: (clinic.services as Array<{ id: string; name: string; duration: number; description: string }>) || [],
      }}
    />
  );
}

