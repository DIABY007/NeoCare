// Types pour la configuration des services
export type ServiceSchedule = {
  day: string; // "monday", "tuesday", etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
};

export type ServiceBreak = {
  id: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
};

export type ServiceConfig = {
  id: string;
  name: string;
  duration: number;
  description: string;
  schedules: ServiceSchedule[];
  breaks: ServiceBreak[];
  dayStartTime: string;
  dayEndTime: string;
  appointmentLimitType: "per_slot" | "per_day";
  appointmentLimit: number;
  bufferBefore: number;
  bufferAfter: number;
  activeDays: string[];
  exceptionDates: string[];
  holidayDates: string[];
};

// Convertir le nom du jour en index (0 = dimanche, 1 = lundi, etc.)
function getDayIndex(dayName: string): number {
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return dayMap[dayName.toLowerCase()] ?? -1;
}

// Convertir l'index du jour en nom anglais (pour correspondre à la config)
function getDayNameEnglish(dayIndex: number): string {
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return dayNames[dayIndex] || "";
}

// Vérifier si une date est dans une liste de dates
function isDateInList(dateString: string, dateList: string[]): boolean {
  return dateList.includes(dateString);
}

// Convertir une heure HH:mm en minutes depuis minuit
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Convertir des minutes depuis minuit en heure HH:mm
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// Vérifier si une heure est dans une plage horaire
function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
  const timeMin = timeToMinutes(time);
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  return timeMin >= startMin && timeMin < endMin;
}

// Vérifier si une heure chevauche une pause
function isTimeInBreak(time: string, duration: number, breaks: ServiceBreak[], date: string): boolean {
  const timeStart = timeToMinutes(time);
  const timeEnd = timeStart + duration;

  for (const breakItem of breaks) {
    // Vérifier si la pause s'applique à cette date
    if (breakItem.isRecurring || breakItem.specificDate === date) {
      const breakStart = timeToMinutes(breakItem.startTime);
      const breakEnd = timeToMinutes(breakItem.endTime);

      // Vérifier si le créneau chevauche la pause
      if (timeStart < breakEnd && timeEnd > breakStart) {
        return true;
      }
    }
  }
  return false;
}

// Normaliser un service (migration depuis l'ancien format)
export function normalizeService(service: any): ServiceConfig {
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
}

// Générer les créneaux disponibles pour un service et une date
export function getAvailableTimeSlots(
  service: ServiceConfig,
  date: string,
  existingAppointments: Array<{ time: string; service: string }> = []
): string[] {
  if (!date || !service) return [];

  const selectedDate = new Date(date);
  const dayIndex = selectedDate.getDay();
  const dayName = getDayNameEnglish(dayIndex);

  // Vérifier si le jour est actif
  if (!service.activeDays.includes(dayName)) {
    return [];
  }

  // Vérifier les exceptions (dates où le service n'est pas disponible)
  if (isDateInList(date, service.exceptionDates)) {
    return [];
  }

  // Vérifier les jours fériés
  if (isDateInList(date, service.holidayDates)) {
    return [];
  }

  // Déterminer les plages horaires pour ce jour
  const daySchedules = service.schedules.filter((s) => s.day === dayName);
  let startTime: string;
  let endTime: string;

  if (daySchedules.length > 0) {
    // Utiliser la première plage horaire trouvée pour ce jour
    startTime = daySchedules[0].startTime;
    endTime = daySchedules[0].endTime;
  } else {
    // Utiliser les bornes jour par défaut
    startTime = service.dayStartTime;
    endTime = service.dayEndTime;
  }

  // Générer les créneaux
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const totalSlotDuration = service.duration + service.bufferBefore + service.bufferAfter;

  // Générer les créneaux par pas de 15 minutes
  for (let slotStartMinutes = startMinutes + service.bufferBefore; slotStartMinutes + service.duration + service.bufferAfter <= endMinutes; slotStartMinutes += 15) {
    const slotTime = minutesToTime(slotStartMinutes);
    const slotEndMinutes = slotStartMinutes + service.duration;
    const bufferStartMinutes = slotStartMinutes - service.bufferBefore;
    const bufferEndMinutes = slotEndMinutes + service.bufferAfter;

    // Vérifier que le créneau (avec buffers) est dans la plage horaire
    if (bufferStartMinutes >= startMinutes && bufferEndMinutes <= endMinutes) {
      // Vérifier que le créneau ne chevauche pas une pause
      if (!isTimeInBreak(slotTime, service.duration, service.breaks, date)) {
        // Vérifier que le créneau est dans la plage horaire
        if (isTimeInRange(slotTime, startTime, endTime)) {
          slots.push(slotTime);
        }
      }
    }
  }

  // Filtrer selon les limites de RDV
  if (service.appointmentLimitType === "per_day") {
    // Limite par jour : compter tous les RDV de ce service pour cette date
    const appointmentsForService = existingAppointments.filter(
      (apt) => apt.service === service.id
    );
    if (appointmentsForService.length >= service.appointmentLimit) {
      return [];
    }
  } else {
    // Limite par créneau : filtrer les créneaux qui ont atteint la limite
    return slots.filter((slot) => {
      const appointmentsAtSlot = existingAppointments.filter(
        (apt) => apt.service === service.id && apt.time === slot
      );
      return appointmentsAtSlot.length < service.appointmentLimit;
    });
  }

  return slots;
}

// Valider si une date est disponible pour un service
export function isDateAvailable(service: ServiceConfig, date: string): boolean {
  if (!date || !service) return false;

  const selectedDate = new Date(date);
  const dayIndex = selectedDate.getDay();
  const dayName = getDayNameEnglish(dayIndex);

  // Vérifier si le jour est actif
  if (!service.activeDays.includes(dayName)) {
    return false;
  }

  // Vérifier les exceptions
  if (isDateInList(date, service.exceptionDates)) {
    return false;
  }

  // Vérifier les jours fériés
  if (isDateInList(date, service.holidayDates)) {
    return false;
  }

  // Vérifier que la date n'est pas dans le passé
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return false;
  }

  // Vérifier que la date n'est pas plus de 3 mois dans le futur
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  if (selectedDate > maxDate) {
    return false;
  }

  return true;
}

