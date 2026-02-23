import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: "super_admin" | "admin";
  clinic_id: string | null;
}

/**
 * Récupère l'utilisateur actuellement connecté depuis les cookies
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("neocare_user_id")?.value;

    if (!userId) {
      return null;
    }

    const supabase = await createServiceRoleClient();
    const { data: userData, error } = await supabase
      .from("users")
      .select("id, name, phone, role, clinic_id")
      .eq("id", userId)
      .single();

    if (error || !userData) {
      return null;
    }

    return {
      id: userData.id,
      name: userData.name,
      phone: userData.phone,
      role: userData.role as "super_admin" | "admin",
      clinic_id: userData.clinic_id,
    };
  } catch (error) {
    console.error("Erreur getCurrentUser:", error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export async function hasRole(role: "super_admin" | "admin"): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Déconnecte l'utilisateur en supprimant les cookies
 */
export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("neocare_session");
  cookieStore.delete("neocare_user_id");
}

