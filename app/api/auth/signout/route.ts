import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  // Supprimer les cookies de session
  cookieStore.delete("neocare_session");
  cookieStore.delete("neocare_user_id");

  return NextResponse.json({ success: true });
}

