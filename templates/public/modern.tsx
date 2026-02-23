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
import { Calendar, Clock, User, Phone, MessageSquare, Sparkles } from "lucide-react";
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

export function ModernPublicTemplate({ clinic, onSubmitAppointment }: PublicTemplateProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section avec effet moderne */}
      <div className="relative overflow-hidden">
        <div
          className="text-white py-24 relative"
          style={{
            background: `linear-gradient(135deg, ${clinic.primary_color} 0%, ${clinic.secondary_color} 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-white/80" />
              <h1 className="text-5xl md:text-6xl font-bold mb-6">{clinic.hero_title}</h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                {clinic.hero_subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services disponibles */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nos services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinic.services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} minutes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire de rendez-vous moderne */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Réservez votre rendez-vous</h2>
            <p className="text-gray-600">Remplissez le formulaire ci-dessous</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="patient_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nom complet
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" {...field} />
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
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </FormLabel>
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
                            className="flex-1"
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          max={(() => {
                            const maxDate = new Date();
                            maxDate.setMonth(maxDate.getMonth() + 3);
                            return maxDate.toISOString().split("T")[0];
                          })()}
                          disabled={!selectedService}
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
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Heure
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={!selectedService || !selectedDate || loadingTimes}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <FormLabel className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message (optionnel)
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
                className="w-full text-lg py-6"
                style={{ backgroundColor: clinic.primary_color }}
              >
                {isSubmitting ? "Envoi en cours..." : "Réserver maintenant"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

