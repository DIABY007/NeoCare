import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SuperAdminDashboard } from "@/components/dashboard/super-admin-dashboard";

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "super_admin") {
    redirect("/dashboard/admin");
  }

  return <SuperAdminDashboard user={user} />;
}

