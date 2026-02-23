import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère un code OTP à 6 chiffres
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Valide un numéro de téléphone au format E.164
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Format E.164: +code pays + numéro (10-15 caractères total)
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

/**
 * Nettoie un numéro de téléphone pour le format E.164
 */
export function cleanPhoneNumber(phone: string): string {
  // Supprime espaces, tirets, points
  let cleaned = phone.replace(/[\s\-\.]/g, "");
  
  // Si ne commence pas par +, ajoute +33 par défaut (France)
  if (!cleaned.startsWith("+")) {
    // Si commence par 0, remplace par +33
    if (cleaned.startsWith("0")) {
      cleaned = "+33" + cleaned.substring(1);
    } else {
      cleaned = "+" + cleaned;
    }
  }
  
  return cleaned;
}

/**
 * Formate une date au format français (ex: "lundi 15 janvier 2024")
 */
export function formatDateFrench(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Génère un lien WhatsApp avec un message pré-rempli
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[\s\-\+]/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Génère un message de confirmation de rendez-vous
 */
export function generateConfirmationMessage(
  patientName: string,
  serviceName: string,
  date: string,
  time: string
): string {
  const formattedDate = formatDateFrench(date);
  return `Bonjour ${patientName}, votre rendez-vous pour ${serviceName} le ${formattedDate} à ${time} a été confirmé.`;
}

/**
 * Génère un message de rejet de rendez-vous
 */
export function generateRejectionMessage(
  patientName: string,
  serviceName: string,
  date: string,
  time: string,
  reason?: string
): string {
  const formattedDate = formatDateFrench(date);
  let message = `Bonjour ${patientName}, votre rendez-vous pour ${serviceName} le ${formattedDate} à ${time} ne peut pas être confirmé`;
  
  if (reason && reason.trim()) {
    message += ` pour la raison suivante : ${reason.trim()}`;
  }
  
  message += ". Merci de nous recontacter.";
  
  return message;
}

