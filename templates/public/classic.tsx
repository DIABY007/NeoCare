"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar, Clock, User, Phone, MessageSquare } from "lucide-react";
import type { PublicTemplateProps } from "./index";
import { getAvailableTimeSlots, isDateAvailable, type ServiceConfig } from "@/lib/appointment-utils";

const appointmentFormSchema = z.object({
  patient_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  patient_phone: z.string().regex(/^\+226\d{8}$/, "Format: +226XXXXXXXX (8 chiffres après +226)"),
  service: z.string().min(1, "Veuillez sélectionner un service"),
  date: z.string().min(1, "Veuillez sélectionner une date"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format d'heure invalide (HH:mm)"),
  message: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

export function ClassicPublicTemplate({ clinic, onSubmitAppointment }: PublicTemplateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patient_name: "",
      patient_phone: "+226",
      service: "",
      date: "",
      time: "",
      message: "",
    },
  });

  const selectedService = form.watch("service");
  const selectedDate = form.watch("date");

  // Charger les créneaux disponibles quand le service ou la date change
  useEffect(() => {
    async function loadAvailableTimes() {
      if (!selectedService || !selectedDate) {
        setAvailableTimes([]);
        form.setValue("time", "");
        return;
      }

      const service = clinic.services.find((s) => s.id === selectedService);
      if (!service) {
        setAvailableTimes([]);
        return;
      }

      setLoadingTimes(true);
      try {
        // Récupérer les rendez-vous existants pour cette date
        const response = await fetch(
          `/api/appointments/availability?clinic_id=${clinic.id}&date=${selectedDate}`
        );
        const result = await response.json();
        const existingAppointments = result.appointments || [];

        // Générer les créneaux disponibles
        const slots = getAvailableTimeSlots(
          service as ServiceConfig,
          selectedDate,
          existingAppointments
        );
        setAvailableTimes(slots);

        // Réinitialiser l'heure si elle n'est plus disponible
        const currentTime = form.getValues("time");
        if (currentTime && !slots.includes(currentTime)) {
          form.setValue("time", "");
        }
      } catch (error) {
        console.error("Erreur chargement créneaux:", error);
        setAvailableTimes([]);
      } finally {
        setLoadingTimes(false);
      }
    }

    loadAvailableTimes();
  }, [selectedService, selectedDate, clinic.id, clinic.services, form]);

  async function onSubmit(data: AppointmentFormData) {
    setIsSubmitting(true);
    try {
      await onSubmitAppointment(data);
      form.reset();
      setAvailableTimes([]);
    } catch (error) {
      // L'erreur est déjà gérée dans le composant parent
    } finally {
      setIsSubmitting(false);
    }
  }

  // Validation de la date selon la configuration du service
  function validateDate(dateString: string, serviceId: string): boolean {
    if (!dateString || !serviceId) return false;

    const service = clinic.services.find((s) => s.id === serviceId);
    if (!service) return false;

    return isDateAvailable(service as ServiceConfig, dateString);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="text-white py-20"
        style={{
          background: `linear-gradient(135deg, ${clinic.primary_color} 0%, ${clinic.secondary_color} 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{clinic.hero_title}</h1>
          <p className="text-xl text-white/90">{clinic.hero_subtitle}</p>
        </div>
      </div>

      {/* Formulaire de rendez-vous */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Prendre un rendez-vous</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="patient_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" {...field} className="text-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patient_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center gap-1.5 h-10 px-3 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm font-semibold select-none shrink-0">
                            +226
                          </span>
                          <Input
                            type="tel"
                            placeholder="56636039"
                            maxLength={8}
                            {...field}
                            value={field.value.replace("+226", "")}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                              field.onChange(`+226${val}`);
                            }}
                            className="flex-1 text-black"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background text-black"
                      >
                        <option value="">Sélectionnez un service</option>
                        {clinic.services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} ({service.duration} min)
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          max={(() => {
                            const maxDate = new Date();
                            maxDate.setMonth(maxDate.getMonth() + 3);
                            return maxDate.toISOString().split("T")[0];
                          })()}
                          {...field}
                          onChange={(e) => {
                            const date = e.target.value;
                            const serviceId = form.getValues("service");
                            if (serviceId && validateDate(date, serviceId)) {
                              field.onChange(date);
                            } else if (serviceId) {
                              form.setError("date", {
                                type: "manual",
                                message: "Cette date n'est pas disponible pour ce service",
                              });
                            } else {
                              field.onChange(date);
                            }
                          }}
                          className="text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={!selectedService || !selectedDate || loadingTimes}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed text-black"
                        >
                          <option value="">
                            {loadingTimes
                              ? "Chargement..."
                              : !selectedService
                              ? "Sélectionnez d'abord un service"
                              : !selectedDate
                              ? "Sélectionnez d'abord une date"
                              : availableTimes.length === 0
                              ? "Aucun créneau disponible"
                              : "Sélectionnez une heure"}
                          </option>
                          {availableTimes.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (optionnel)</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background text-black"
                        placeholder="Informations supplémentaires..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                style={{ backgroundColor: clinic.primary_color }}
              >
                {isSubmitting ? "Envoi en cours..." : "Réserver"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

