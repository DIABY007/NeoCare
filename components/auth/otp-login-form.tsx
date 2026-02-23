"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Globe } from "lucide-react";

// Schéma de validation pour le numéro local (8 chiffres)
const phoneSchema = z.object({
  localNumber: z
    .string()
    .length(8, "Le numéro doit contenir 8 chiffres")
    .regex(/^\d+$/, "Le numéro doit contenir uniquement des chiffres"),
});

// Schéma de validation pour le code OTP
const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d+$/, "Le code doit contenir uniquement des chiffres"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export function OTPLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [localNumber, setLocalNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      localNumber: "",
    },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  // Étape 1 : Envoyer le code OTP
  const onSendOTP = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      // Construire le numéro complet avec le préfixe +226
      const fullPhone = `+226${data.localNumber}`;
      
      // Générer un code OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Envoyer le code via WasenderAPI
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
          code: otpCode,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de l'envoi du code");
      }

      // Stocker le code et le téléphone dans le sessionStorage (temporaire)
      sessionStorage.setItem("otp_code", otpCode);
      sessionStorage.setItem("otp_phone", fullPhone);
      sessionStorage.setItem("otp_expires", String(Date.now() + 10 * 60 * 1000)); // 10 minutes

      setPhoneNumber(fullPhone);
      setStep("otp");
      
      toast({
        title: "Code envoyé",
        description: "Vérifiez votre WhatsApp pour le code de vérification",
      });
    } catch (error) {
      console.error("Erreur envoi OTP:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'envoi du code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 2 : Vérifier le code OTP et créer la session
  const onVerifyOTP = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      const storedCode = sessionStorage.getItem("otp_code");
      const storedPhone = sessionStorage.getItem("otp_phone");
      const expiresAt = sessionStorage.getItem("otp_expires");

      // Vérifier que le code n'a pas expiré
      if (!expiresAt || Date.now() > parseInt(expiresAt)) {
        throw new Error("Le code a expiré. Veuillez en demander un nouveau.");
      }

      // Vérifier le code
      if (data.code !== storedCode) {
        throw new Error("Code incorrect. Veuillez réessayer.");
      }

      if (!storedPhone) {
        throw new Error("Session expirée. Veuillez recommencer.");
      }

      // Vérifier l'utilisateur dans Supabase et créer la session
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: storedPhone,
          code: data.code,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de la vérification");
      }

      // Nettoyer le sessionStorage
      sessionStorage.removeItem("otp_code");
      sessionStorage.removeItem("otp_phone");
      sessionStorage.removeItem("otp_expires");

      toast({
        title: "Connexion réussie",
        description: "Redirection en cours...",
      });

      // Rediriger selon le rôle
      if (result.user?.role === "super_admin") {
        router.push("/dashboard/super-admin");
      } else if (result.user?.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }

      // Rafraîchir pour mettre à jour la session
      router.refresh();
    } catch (error) {
      console.error("Erreur vérification OTP:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Code incorrect",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    sessionStorage.removeItem("otp_code");
    sessionStorage.removeItem("otp_phone");
    sessionStorage.removeItem("otp_expires");
    otpForm.reset();
  };

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Vérification</h2>
          <p className="text-sm text-gray-600 mt-1">
            Entrez le code à 6 chiffres envoyé au {phoneNumber}
          </p>
        </div>

        <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code de vérification</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              maxLength={6}
              {...otpForm.register("code")}
              className="text-center text-2xl tracking-widest"
            />
            {otpForm.formState.errors.code && (
              <p className="text-sm text-destructive">
                {otpForm.formState.errors.code.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToPhone}
              className="flex-1"
            >
              Retour
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Vérification..." : "Vérifier"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={phoneForm.handleSubmit(onSendOTP)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="localNumber">Numéro de téléphone</Label>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center gap-1.5 h-10 px-3 bg-muted border border-input rounded-md text-sm font-semibold select-none shrink-0">
            <Globe className="w-4 h-4 text-primary" /> +226
          </span>
          <Input
            id="localNumber"
            type="tel"
            inputMode="numeric"
            placeholder="56636039"
            maxLength={8}
            {...phoneForm.register("localNumber", {
              onChange: (e) => {
                // Ne garder que les chiffres et limiter à 8
                const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                setLocalNumber(val);
                phoneForm.setValue("localNumber", val, { shouldValidate: true });
              },
            })}
            value={localNumber}
            className="flex-1"
          />
        </div>
        <div className="flex items-center justify-between">
          {phoneForm.formState.errors.localNumber && (
            <p className="text-sm text-destructive">
              {phoneForm.formState.errors.localNumber.message}
            </p>
          )}
          <p
            className={`text-xs font-medium transition-colors ml-auto ${
              localNumber.length === 8
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground"
            }`}
          >
            {localNumber.length}/8 chiffres
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || localNumber.length !== 8}
        className="w-full"
      >
        {isLoading ? "Envoi en cours..." : "Envoyer le code"}
      </Button>
    </form>
  );
}

