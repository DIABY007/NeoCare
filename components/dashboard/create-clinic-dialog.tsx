"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const baseClinicSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  slug: z
    .string()
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .max(30, "Le slug ne peut pas dépasser 30 caractères")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"
    )
    .refine((val) => !val.startsWith("-") && !val.endsWith("-"), {
      message: "Le slug ne peut pas commencer ou se terminer par un tiret",
    }),
  whatsapp_number: z
    .string()
    .regex(/^\+226\d{8}$/, "Format: +226XXXXXXXX (8 chiffres après +226)"),
  public_template: z.enum(["classic", "modern"], {
    required_error: "Veuillez sélectionner un template public",
  }),
  admin_template: z.enum(["minimal", "advanced"], {
    required_error: "Veuillez sélectionner un template admin",
  }),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format hexadécimal requis (ex: #000000)"),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format hexadécimal requis (ex: #FFFFFF)"),
  hero_title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  hero_subtitle: z.string().min(10, "Le sous-titre doit contenir au moins 10 caractères"),
  is_active: z.boolean().default(true),
});

// Schéma pour la création (avec admin requis)
const createClinicSchema = baseClinicSchema.extend({
  admin_name: z.string().min(2, "Le nom de l'admin doit contenir au moins 2 caractères"),
  admin_phone: z
    .string()
    .regex(/^\+226\d{8}$/, "Format: +226XXXXXXXX (8 chiffres après +226)"),
});

// Schéma pour l'édition (sans admin)
const editClinicSchema = baseClinicSchema.extend({
  admin_name: z.string().optional(),
  admin_phone: z.string().optional(),
});

// Type qui accepte les deux cas
type ClinicFormData = z.infer<typeof createClinicSchema>;

interface CreateClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clinic?: any; // Clinique à modifier (si fournie, mode édition)
}

export function CreateClinicDialog({
  open,
  onOpenChange,
  onSuccess,
  clinic,
}: CreateClinicDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!clinic;
  
  // Type étendu pour les services avec toutes les nouvelles fonctionnalités
  type ServiceSchedule = {
    day: string; // "monday", "tuesday", etc.
    startTime: string; // "09:00"
    endTime: string; // "17:00"
  };

  type ServiceBreak = {
    id: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean; // true = récurrente (tous les jours), false = ponctuelle (date spécifique)
    specificDate?: string; // Date si ponctuelle (format YYYY-MM-DD)
  };

  type ServiceConfig = {
    id: string;
    name: string;
    duration: number;
    description: string;
    // Plages horaires par service
    schedules: ServiceSchedule[];
    // Heures de pause et bornes jour
    breaks: ServiceBreak[];
    dayStartTime: string; // Heure de début de journée (ex: "08:00")
    dayEndTime: string; // Heure de fin de journée (ex: "18:00")
    // Limite de RDV
    appointmentLimitType: "per_slot" | "per_day"; // Par créneau ou par jour
    appointmentLimit: number; // Nombre max de RDV
    // Durée consultation + buffer
    bufferBefore: number; // Buffer avant (minutes)
    bufferAfter: number; // Buffer après (minutes)
    // Jours actifs
    activeDays: string[]; // ["monday", "tuesday", ...]
    exceptionDates: string[]; // Dates exceptionnelles (format YYYY-MM-DD)
    holidayDates: string[]; // Jours fériés (format YYYY-MM-DD)
  };
  
  const [services, setServices] = useState<ServiceConfig[]>([
    { 
      id: "cons-01", 
      name: "Consultation Générale", 
      duration: 30, 
      description: "Examen de routine et diagnostic",
      schedules: [],
      breaks: [],
      dayStartTime: "08:00",
      dayEndTime: "18:00",
      appointmentLimitType: "per_slot",
      appointmentLimit: 1,
      bufferBefore: 0,
      bufferAfter: 0,
      activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      exceptionDates: [],
      holidayDates: [],
    },
  ]);

  // Utiliser le schéma approprié selon le mode
  const schema = useMemo(() => {
    return isEditMode ? editClinicSchema : createClinicSchema;
  }, [isEditMode]);

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      whatsapp_number: "+226",
      public_template: "classic",
      admin_template: "minimal",
      primary_color: "#000000",
      secondary_color: "#FFFFFF",
      hero_title: "",
      hero_subtitle: "",
      is_active: true,
      admin_name: "",
      admin_phone: "+226",
    },
  });

  // Fonction pour normaliser un service (migration depuis l'ancien format)
  const normalizeService = useMemo(() => {
    return (service: any): ServiceConfig => {
      if (
        service.schedules !== undefined &&
        service.breaks !== undefined &&
        service.dayStartTime !== undefined
      ) {
        // Service déjà au nouveau format
        return service as ServiceConfig;
      }
      // Migration depuis l'ancien format
      return {
        id: service.id || `service-${Date.now()}`,
        name: service.name || "",
        duration: service.duration || 30,
        description: service.description || "",
        schedules: service.schedules || [],
        breaks: service.breaks || [],
        dayStartTime: service.dayStartTime || "08:00",
        dayEndTime: service.dayEndTime || "18:00",
        appointmentLimitType: service.appointmentLimitType || "per_slot",
        appointmentLimit: service.appointmentLimit || 1,
        bufferBefore: service.bufferBefore || 0,
        bufferAfter: service.bufferAfter || 0,
        activeDays: service.activeDays || ["monday", "tuesday", "wednesday", "thursday", "friday"],
        exceptionDates: service.exceptionDates || [],
        holidayDates: service.holidayDates || [],
      };
    };
  }, []);

  // Charger les données de la clinique en mode édition
  useEffect(() => {
    if (clinic && open) {
      form.reset({
        name: clinic.name || "",
        slug: clinic.slug || "",
        whatsapp_number: clinic.whatsapp_number || "+226",
        public_template: clinic.public_template || "classic",
        admin_template: clinic.admin_template || "minimal",
        primary_color: clinic.primary_color || "#000000",
        secondary_color: clinic.secondary_color || "#FFFFFF",
        hero_title: clinic.hero_title || "",
        hero_subtitle: clinic.hero_subtitle || "",
        is_active: clinic.is_active ?? true,
        admin_name: "", // On ne charge pas l'admin en mode édition
        admin_phone: "+226",
      });
      if (clinic.services && Array.isArray(clinic.services)) {
        setServices(clinic.services.map(normalizeService));
      }
    } else if (!clinic && open) {
      // Réinitialiser en mode création
      form.reset({
        name: "",
        slug: "",
        whatsapp_number: "+226",
        public_template: "classic",
        admin_template: "minimal",
        primary_color: "#000000",
        secondary_color: "#FFFFFF",
        hero_title: "",
        hero_subtitle: "",
        is_active: true,
        admin_name: "",
        admin_phone: "+226",
      });
      setServices([{ 
        id: "cons-01", 
        name: "Consultation Générale", 
        duration: 30, 
        description: "Examen de routine et diagnostic",
        schedules: [],
        breaks: [],
        dayStartTime: "08:00",
        dayEndTime: "18:00",
        appointmentLimitType: "per_slot",
        appointmentLimit: 1,
        bufferBefore: 0,
        bufferAfter: 0,
        activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        exceptionDates: [],
        holidayDates: [],
      }]);
    }
  }, [clinic, open, form, normalizeService]);

  async function onSubmit(data: ClinicFormData) {
    setIsSubmitting(true);
    try {
      const url = isEditMode ? `/api/clinics/${clinic.id}` : "/api/clinics";
      const method = isEditMode ? "PUT" : "POST";
      
      // En mode édition, on n'envoie pas les données admin
      const body = isEditMode
        ? {
            name: data.name,
            slug: data.slug,
            whatsapp_number: data.whatsapp_number,
            public_template: data.public_template,
            admin_template: data.admin_template,
            primary_color: data.primary_color,
            secondary_color: data.secondary_color,
            hero_title: data.hero_title,
            hero_subtitle: data.hero_subtitle,
            services: services,
            is_active: data.is_active,
          }
        : {
            ...data,
            services: services,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erreur lors de la ${isEditMode ? "modification" : "création"}`);
      }

      toast({
        title: "Succès",
        description: `La clinique a été ${isEditMode ? "modifiée" : "créée"} avec succès`,
      });

      if (!isEditMode) {
        form.reset();
        setServices([{ 
          id: "cons-01", 
          name: "Consultation Générale", 
          duration: 30, 
          description: "Examen de routine et diagnostic",
          schedules: [],
          breaks: [],
          dayStartTime: "08:00",
          dayEndTime: "18:00",
          appointmentLimitType: "per_slot",
          appointmentLimit: 1,
          bufferBefore: 0,
          bufferAfter: 0,
          activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          exceptionDates: [],
          holidayDates: [],
        }]);
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function addService() {
    const newId = `service-${Date.now()}`;
    setServices([...services, { 
      id: newId, 
      name: "", 
      duration: 30, 
      description: "",
      schedules: [],
      breaks: [],
      dayStartTime: "08:00",
      dayEndTime: "18:00",
      appointmentLimitType: "per_slot",
      appointmentLimit: 1,
      bufferBefore: 0,
      bufferAfter: 0,
      activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      exceptionDates: [],
      holidayDates: [],
    }]);
  }

  function removeService(index: number) {
    setServices(services.filter((_, i) => i !== index));
  }

  function updateService(index: number, field: string, value: any) {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  }

  function addSchedule(serviceIndex: number) {
    const updated = [...services];
    updated[serviceIndex].schedules.push({
      day: "monday",
      startTime: "09:00",
      endTime: "17:00",
    });
    setServices(updated);
  }

  function removeSchedule(serviceIndex: number, scheduleIndex: number) {
    const updated = [...services];
    updated[serviceIndex].schedules = updated[serviceIndex].schedules.filter((_, i) => i !== scheduleIndex);
    setServices(updated);
  }

  function updateSchedule(serviceIndex: number, scheduleIndex: number, field: string, value: string) {
    const updated = [...services];
    updated[serviceIndex].schedules[scheduleIndex] = {
      ...updated[serviceIndex].schedules[scheduleIndex],
      [field]: value,
    };
    setServices(updated);
  }

  function addBreak(serviceIndex: number) {
    const updated = [...services];
    updated[serviceIndex].breaks.push({
      id: `break-${Date.now()}`,
      startTime: "12:00",
      endTime: "13:00",
      isRecurring: true,
    });
    setServices(updated);
  }

  function removeBreak(serviceIndex: number, breakIndex: number) {
    const updated = [...services];
    updated[serviceIndex].breaks = updated[serviceIndex].breaks.filter((_, i) => i !== breakIndex);
    setServices(updated);
  }

  function updateBreak(serviceIndex: number, breakIndex: number, field: string, value: any) {
    const updated = [...services];
    updated[serviceIndex].breaks[breakIndex] = {
      ...updated[serviceIndex].breaks[breakIndex],
      [field]: value,
    };
    setServices(updated);
  }

  function toggleActiveDay(serviceIndex: number, day: string) {
    const updated = [...services];
    const activeDays = updated[serviceIndex].activeDays;
    if (activeDays.includes(day)) {
      updated[serviceIndex].activeDays = activeDays.filter(d => d !== day);
    } else {
      updated[serviceIndex].activeDays = [...activeDays, day];
    }
    setServices(updated);
  }

  function addExceptionDate(serviceIndex: number, date: string) {
    const updated = [...services];
    if (!updated[serviceIndex].exceptionDates.includes(date)) {
      updated[serviceIndex].exceptionDates = [...updated[serviceIndex].exceptionDates, date];
    }
    setServices(updated);
  }

  function removeExceptionDate(serviceIndex: number, date: string) {
    const updated = [...services];
    updated[serviceIndex].exceptionDates = updated[serviceIndex].exceptionDates.filter(d => d !== date);
    setServices(updated);
  }

  function addHolidayDate(serviceIndex: number, date: string) {
    const updated = [...services];
    if (!updated[serviceIndex].holidayDates.includes(date)) {
      updated[serviceIndex].holidayDates = [...updated[serviceIndex].holidayDates, date];
    }
    setServices(updated);
  }

  function removeHolidayDate(serviceIndex: number, date: string) {
    const updated = [...services];
    updated[serviceIndex].holidayDates = updated[serviceIndex].holidayDates.filter(d => d !== date);
    setServices(updated);
  }

  const daysOfWeek = [
    { value: "monday", label: "Lundi" },
    { value: "tuesday", label: "Mardi" },
    { value: "wednesday", label: "Mercredi" },
    { value: "thursday", label: "Jeudi" },
    { value: "friday", label: "Vendredi" },
    { value: "saturday", label: "Samedi" },
    { value: "sunday", label: "Dimanche" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Modifier la clinique" : "Créer une nouvelle clinique"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifiez les informations de la clinique."
              : "Remplissez les informations pour créer une nouvelle clinique et son administrateur."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations de base</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la clinique</FormLabel>
                      <FormControl>
                        <Input placeholder="Clinique du Centre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="clinique-centre" {...field} />
                      </FormControl>
                      <FormDescription>
                        Utilisé dans l&apos;URL: /clinique/{field.value || "slug"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro WhatsApp</FormLabel>
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

            {/* Templates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Templates</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="public_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Public</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="classic">Classic</option>
                          <option value="modern">Modern</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Admin</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="minimal">Minimal</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Couleurs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Couleurs</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur principale</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="color" {...field} className="w-20 h-10" />
                          <Input placeholder="#000000" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur secondaire</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="color" {...field} className="w-20 h-10" />
                          <Input placeholder="#FFFFFF" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Hero */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Section Hero</h3>
              <FormField
                control={form.control}
                name="hero_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre Hero</FormLabel>
                    <FormControl>
                      <Input placeholder="Bienvenue à la Clinique du Centre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hero_subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sous-titre Hero</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Prenez rendez-vous facilement en ligne"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Services */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Services</h3>
                <Button type="button" variant="outline" size="sm" onClick={addService}>
                  Ajouter un service
                </Button>
              </div>
              {services.map((service, index) => (
                <div key={service.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  {/* Informations de base du service */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Nom du service</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(index, "name", e.target.value)}
                          placeholder="Consultation Générale"
                        />
                      </div>
                      <div>
                        <Label>Durée (minutes)</Label>
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(index, "duration", parseInt(e.target.value) || 30)}
                          min={15}
                          max={120}
                          step={15}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={service.description}
                        onChange={(e) => updateService(index, "description", e.target.value)}
                        placeholder="Examen de routine et diagnostic"
                      />
                    </div>
                  </div>

                  {/* Durée consultation + buffer */}
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="text-sm font-semibold">Buffer avant/après consultation</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Buffer avant (minutes)</Label>
                        <Input
                          type="number"
                          value={service.bufferBefore}
                          onChange={(e) => updateService(index, "bufferBefore", parseInt(e.target.value) || 0)}
                          min={0}
                          max={60}
                          step={5}
                        />
                      </div>
                      <div>
                        <Label>Buffer après (minutes)</Label>
                        <Input
                          type="number"
                          value={service.bufferAfter}
                          onChange={(e) => updateService(index, "bufferAfter", parseInt(e.target.value) || 0)}
                          min={0}
                          max={60}
                          step={5}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bornes jour */}
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="text-sm font-semibold">Bornes de journée</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Heure de début</Label>
                        <Input
                          type="time"
                          value={service.dayStartTime}
                          onChange={(e) => updateService(index, "dayStartTime", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Heure de fin</Label>
                        <Input
                          type="time"
                          value={service.dayEndTime}
                          onChange={(e) => updateService(index, "dayEndTime", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Plages horaires par service */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Plages horaires par jour</h4>
                      <Button type="button" variant="outline" size="sm" onClick={() => addSchedule(index)}>
                        Ajouter une plage
                      </Button>
                    </div>
                    {service.schedules.map((schedule, schedIndex) => (
                      <div key={schedIndex} className="flex gap-2 items-end p-2 bg-white rounded border">
                        <div className="flex-1">
                          <Label>Jour</Label>
                          <Select
                            value={schedule.day}
                            onValueChange={(value) => updateSchedule(index, schedIndex, "day", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {daysOfWeek.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label>Début</Label>
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => updateSchedule(index, schedIndex, "startTime", e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Fin</Label>
                          <Input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => updateSchedule(index, schedIndex, "endTime", e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSchedule(index, schedIndex)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Heures de pause */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Heures de pause</h4>
                      <Button type="button" variant="outline" size="sm" onClick={() => addBreak(index)}>
                        Ajouter une pause
                      </Button>
                    </div>
                    {service.breaks.map((breakItem, breakIndex) => (
                      <div key={breakItem.id} className="p-2 bg-white rounded border space-y-2">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label>Début</Label>
                            <Input
                              type="time"
                              value={breakItem.startTime}
                              onChange={(e) => updateBreak(index, breakIndex, "startTime", e.target.value)}
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Fin</Label>
                            <Input
                              type="time"
                              value={breakItem.endTime}
                              onChange={(e) => updateBreak(index, breakIndex, "endTime", e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={breakItem.isRecurring}
                              onChange={(e) => updateBreak(index, breakIndex, "isRecurring", e.target.checked)}
                              label="Récurrente"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeBreak(index, breakIndex)}
                          >
                            ×
                          </Button>
                        </div>
                        {!breakItem.isRecurring && (
                          <div>
                            <Label>Date spécifique (si ponctuelle)</Label>
                            <Input
                              type="date"
                              value={breakItem.specificDate || ""}
                              onChange={(e) => updateBreak(index, breakIndex, "specificDate", e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Limite de RDV par service */}
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="text-sm font-semibold">Limite de rendez-vous</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type de limite</Label>
                        <Select
                          value={service.appointmentLimitType}
                          onValueChange={(value: "per_slot" | "per_day") => updateService(index, "appointmentLimitType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="per_slot">Par créneau</SelectItem>
                            <SelectItem value="per_day">Par jour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Nombre maximum</Label>
                        <Input
                          type="number"
                          value={service.appointmentLimit}
                          onChange={(e) => updateService(index, "appointmentLimit", parseInt(e.target.value) || 1)}
                          min={1}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sélection de jours actifs */}
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="text-sm font-semibold">Jours actifs</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {daysOfWeek.map((day) => (
                        <Checkbox
                          key={day.value}
                          checked={service.activeDays.includes(day.value)}
                          onChange={() => toggleActiveDay(index, day.value)}
                          label={day.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Exceptions et jours fériés */}
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="text-sm font-semibold">Dates exceptionnelles</h4>
                    <div className="space-y-2">
                      <div>
                        <Label>Ajouter une date d&apos;exception</Label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            id={`exception-${index}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(`exception-${index}`) as HTMLInputElement;
                              if (input?.value) {
                                addExceptionDate(index, input.value);
                                input.value = "";
                              }
                            }}
                          >
                            Ajouter
                          </Button>
                        </div>
                        {service.exceptionDates.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {service.exceptionDates.map((date) => (
                              <span
                                key={date}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                              >
                                {date}
                                <button
                                  type="button"
                                  onClick={() => removeExceptionDate(index, date)}
                                  className="text-yellow-800 hover:text-yellow-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Ajouter un jour férié</Label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            id={`holiday-${index}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(`holiday-${index}`) as HTMLInputElement;
                              if (input?.value) {
                                addHolidayDate(index, input.value);
                                input.value = "";
                              }
                            }}
                          >
                            Ajouter
                          </Button>
                        </div>
                        {service.holidayDates.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {service.holidayDates.map((date) => (
                              <span
                                key={date}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                              >
                                {date}
                                <button
                                  type="button"
                                  onClick={() => removeHolidayDate(index, date)}
                                  className="text-red-800 hover:text-red-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {services.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeService(index)}
                      className="w-full"
                    >
                      Supprimer ce service
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Admin - Seulement en mode création */}
            {!isEditMode && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Administrateur</h3>
                <FormField
                  control={form.control}
                  name="admin_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l&apos;administrateur</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Jean Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone de l&apos;administrateur</FormLabel>
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
                            value={field.value?.replace("+226", "") || ""}
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
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? "Modification..."
                    : "Création..."
                  : isEditMode
                  ? "Modifier la clinique"
                  : "Créer la clinique"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

