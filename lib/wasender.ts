/**
 * Client WasenderAPI pour l'envoi de messages WhatsApp
 */

const WASENDER_API_URL = process.env.WASENDER_API_URL || "https://www.wasenderapi.com/api";
const WASENDER_API_KEY = process.env.WASENDER_API_KEY || "";

export interface SendOTPParams {
  to: string; // Format E.164
  code: string; // Code OTP à envoyer
}

export interface SendMessageParams {
  to: string; // Format E.164
  text: string;
}

export interface WasenderResponse {
  success: boolean;
  data?: {
    msgId: number;
    jid: string;
    status: string;
  };
  error?: string;
}

/**
 * Envoie un code OTP via WhatsApp
 */
export async function sendOTP({ to, code }: SendOTPParams): Promise<WasenderResponse> {
  const message = `Votre code de vérification NeoCare est : ${code}\n\nCe code est valide pendant 10 minutes.`;

  return sendMessage({ to, text: message });
}

/**
 * Envoie un message texte via WhatsApp
 */
export async function sendMessage({ to, text }: SendMessageParams): Promise<WasenderResponse> {
  try {
    const response = await fetch(`${WASENDER_API_URL}/send-message`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WASENDER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Erreur lors de l'envoi du message",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Erreur WasenderAPI:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

