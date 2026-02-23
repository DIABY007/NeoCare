"use client";

import { useState } from "react";
import { PublicTemplate } from "@/templates/public";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import type { ServiceConfig } from "@/lib/appointment-utils";

interface ClinicPageProps {
  clinic: {
    id: string;
    name: string;
    slug: string;
    whatsapp_number: string;
    primary_color: string;
    secondary_color: string;
    hero_title: string;
    hero_subtitle: string;
    services: ServiceConfig[];
    public_template: "classic" | "modern";
  };
}

export function PublicClinicPage({ clinic }: ClinicPageProps) {
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmitAppointment(data: {
    patient_name: string;
    patient_phone: string;
    service: string;
    date: string;
    time: string;
    message?: string;
  }) {
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          clinic_id: clinic.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création du rendez-vous");
      }

      toast({
        title: "Succès",
        description: "Votre demande de rendez-vous a été enregistrée",
      });

      // Construire le message WhatsApp
      const serviceName = clinic.services.find((s) => s.id === data.service)?.name || data.service;
      const dateFormatted = new Date(data.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const whatsappMessage = encodeURIComponent(
        `Bonjour, je viens de confirmer ma demande de rendez-vous pour ${serviceName} le ${dateFormatted} à ${data.time}.\n\nNom: ${data.patient_name}\nTéléphone: ${data.patient_phone}${data.message ? `\nMessage: ${data.message}` : ""}`
      );

      const cleanPhone = clinic.whatsapp_number.replace(/[\s\-\+]/g, "");
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

      // Rediriger vers WhatsApp
      window.open(whatsappUrl, "_blank");
    } catch (error) {
      console.error("Erreur création rendez-vous:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  }

  return <PublicTemplate clinic={clinic} onSubmitAppointment={handleSubmitAppointment} />;
}

