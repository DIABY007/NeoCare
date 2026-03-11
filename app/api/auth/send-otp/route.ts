import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/wasender";
import { cleanPhoneNumber, isValidPhoneNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: "Téléphone et code requis" },
        { status: 400 }
      );
    }

    // Nettoyer et valider le numéro de téléphone
    const cleanedPhone = cleanPhoneNumber(phone);
    
    if (!isValidPhoneNumber(cleanedPhone)) {
      return NextResponse.json(
        { success: false, error: "Format de téléphone invalide" },
        { status: 400 }
      );
    }

    // Envoyer le code OTP via WasenderAPI
    const result = await sendOTP({
      to: cleanedPhone,
      code: code,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Erreur lors de l'envoi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Code OTP envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur API send-otp:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
}



