import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ["/", "/login", "/clinique"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Si c'est une route publique, laisser passer
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Routes du dashboard nécessitent une authentification
  if (pathname.startsWith("/dashboard")) {
    // Vérifier la session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Si pas d'utilisateur, vérifier les cookies de session personnalisés
    if (!user) {
      const sessionCookie = request.cookies.get("neocare_session");
      const userIdCookie = request.cookies.get("neocare_user_id");

      if (!sessionCookie || !userIdCookie) {
        // Rediriger vers la page de connexion
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Vérifier que l'utilisateur existe toujours
      const supabaseAdmin = await import("@/lib/supabase/server").then(
        (m) => m.createServiceRoleClient()
      );

      const { data: userData, error } = await supabaseAdmin
        .from("users")
        .select("id, role, clinic_id")
        .eq("id", userIdCookie.value)
        .single();

      if (error || !userData) {
        // Utilisateur invalide, rediriger vers login
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Vérifier le routage basé sur les rôles
      if (pathname.startsWith("/dashboard/super-admin")) {
        if (userData.role !== "super_admin") {
          // Rediriger vers le dashboard approprié
          if (userData.role === "admin") {
            return NextResponse.redirect(new URL("/dashboard/admin", request.url));
          }
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }

      if (pathname.startsWith("/dashboard/admin")) {
        if (userData.role !== "admin") {
          // Rediriger vers le dashboard approprié
          if (userData.role === "super_admin") {
            return NextResponse.redirect(
              new URL("/dashboard/super-admin", request.url)
            );
          }
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }
    } else {
      // Si on a un utilisateur Supabase Auth, vérifier le rôle
      const supabaseAdmin = await import("@/lib/supabase/server").then(
        (m) => m.createServiceRoleClient()
      );

      const { data: userData, error } = await supabaseAdmin
        .from("users")
        .select("id, role, clinic_id")
        .eq("id", user.id)
        .single();

      if (!error && userData) {
        // Vérifier le routage basé sur les rôles
        if (pathname.startsWith("/dashboard/super-admin")) {
          if (userData.role !== "super_admin") {
            if (userData.role === "admin") {
              return NextResponse.redirect(new URL("/dashboard/admin", request.url));
            }
            return NextResponse.redirect(new URL("/login", request.url));
          }
        }

        if (pathname.startsWith("/dashboard/admin")) {
          if (userData.role !== "admin") {
            if (userData.role === "super_admin") {
              return NextResponse.redirect(
                new URL("/dashboard/super-admin", request.url)
              );
            }
            return NextResponse.redirect(new URL("/login", request.url));
          }
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

