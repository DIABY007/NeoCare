"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { AdminTemplateProps } from "./index";
import { RejectAppointmentDialog } from "@/components/dashboard/reject-appointment-dialog";
import {
  generateConfirmationMessage,
  generateRejectionMessage,
  generateWhatsAppLink,
} from "@/lib/utils";

export function MinimalAdminTemplate({ clinic, services, appointments, onUpdateStatus }: AdminTemplateProps) {
  const [selectedDate, setSelectedDate] = useState<string>(""); // Vide = tous les RDV
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    patient_name: string;
    patient_phone: string;
    service: string;
    date: string;
    time: string;
  } | null>(null);

  const filteredAppointments = selectedDate
    ? appointments.filter((apt) => apt.date === selectedDate)
    : appointments;

  const todayAppointments = appointments.filter(
    (apt) => apt.date === new Date().toISOString().split("T")[0]
  );

  const pendingCount = todayAppointments.filter((apt) => apt.status === "pending").length;
  const confirmedCount = todayAppointments.filter((apt) => apt.status === "confirmed").length;
  const cancelledCount = todayAppointments.filter((apt) => apt.status === "cancelled").length;

  async function handleStatusUpdate(appointmentId: string, status: "pending" | "confirmed" | "cancelled") {
    setIsUpdating(appointmentId);
    try {
      await onUpdateStatus(appointmentId, status);
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
    } finally {
      setIsUpdating(null);
    }
  }

  function getServiceName(serviceId: string): string {
    const service = services.find((s) => s.id === serviceId);
    return service?.name || serviceId;
  }

  function handleValidate(appointment: {
    id: string;
    patient_name: string;
    patient_phone: string;
    service: string;
    date: string;
    time: string;
  }) {
    const serviceName = getServiceName(appointment.service);
    const message = generateConfirmationMessage(
      appointment.patient_name,
      serviceName,
      appointment.date,
      appointment.time
    );
    const whatsappUrl = generateWhatsAppLink(appointment.patient_phone, message);
    
    // Ouvrir WhatsApp
    window.open(whatsappUrl, "_blank");
    
    // Mettre à jour le statut
    handleStatusUpdate(appointment.id, "confirmed");
  }

  function handleRejectClick(appointment: {
    id: string;
    patient_name: string;
    patient_phone: string;
    service: string;
    date: string;
    time: string;
  }) {
    setSelectedAppointment(appointment);
    setRejectDialogOpen(true);
  }

  function handleRejectConfirm(reason?: string) {
    if (!selectedAppointment) return;

    const serviceName = getServiceName(selectedAppointment.service);
    const message = generateRejectionMessage(
      selectedAppointment.patient_name,
      serviceName,
      selectedAppointment.date,
      selectedAppointment.time,
      reason
    );
    const whatsappUrl = generateWhatsAppLink(selectedAppointment.patient_phone, message);
    
    // Ouvrir WhatsApp
    window.open(whatsappUrl, "_blank");
    
    // Mettre à jour le statut
    handleStatusUpdate(selectedAppointment.id, "cancelled");
    
    setSelectedAppointment(null);
  }

  function getWhatsAppLink(phone: string) {
    const cleanPhone = phone.replace(/[\s\-\+]/g, "");
    return `https://wa.me/${cleanPhone}`;
  }

  function getStatusBadge(status: string) {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };

    const icons = {
      pending: AlertCircle,
      confirmed: CheckCircle,
      cancelled: XCircle,
    };

    const labels = {
      pending: "En attente",
      confirmed: "Confirmé",
      cancelled: "Annulé",
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}
      >
        <Icon className="w-3 h-3" />
        {labels[status as keyof typeof labels]}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: clinic.primary_color + "20" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: clinic.primary_color }}>
            {clinic.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Gestion des rendez-vous</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Statistiques du jour */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">En attente</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Confirmés</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{confirmedCount}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Annulés</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{cancelledCount}</p>
              </div>
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Filtre par date */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
              <label htmlFor="date-filter" className="text-xs sm:text-sm font-medium text-gray-700">
                Filtrer par date :
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              <input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ "--tw-ring-color": clinic.primary_color } as React.CSSProperties}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate("")}
                disabled={!selectedDate}
                className="w-full sm:w-auto"
              >
                Afficher tout
              </Button>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              {filteredAppointments.length} rendez-vous{selectedDate ? ` pour cette date` : " au total"}
            </span>
          </div>
        </div>

        {/* Liste des rendez-vous */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun rendez-vous pour cette date</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{appointment.patient_name}</h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{getServiceName(appointment.service)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{appointment.patient_phone}</span>
                        </div>
                        {appointment.message && (
                          <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 sm:col-span-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2 break-words">{appointment.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 sm:gap-2 sm:ml-4 sm:min-w-[120px]">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(getWhatsAppLink(appointment.patient_phone), "_blank")}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        Contacter
                      </Button>
                      {appointment.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleValidate({
                                id: appointment.id,
                                patient_name: appointment.patient_name,
                                patient_phone: appointment.patient_phone,
                                service: appointment.service,
                                date: appointment.date,
                                time: appointment.time,
                              })
                            }
                            disabled={isUpdating === appointment.id}
                            className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            {isUpdating === appointment.id ? "..." : "Valider"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleRejectClick({
                                id: appointment.id,
                                patient_name: appointment.patient_name,
                                patient_phone: appointment.patient_phone,
                                service: appointment.service,
                                date: appointment.date,
                                time: appointment.time,
                              })
                            }
                            disabled={isUpdating === appointment.id}
                            className="flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            {isUpdating === appointment.id ? "..." : "Rejeter"}
                          </Button>
                        </>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                          disabled={isUpdating === appointment.id}
                          className="flex-1 sm:flex-none text-xs sm:text-sm"
                        >
                          {isUpdating === appointment.id ? "..." : "Annuler"}
                        </Button>
                      )}
                      {appointment.status === "cancelled" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(appointment.id, "pending")}
                          disabled={isUpdating === appointment.id}
                          style={{ backgroundColor: clinic.primary_color }}
                          className="text-white flex-1 sm:flex-none text-xs sm:text-sm"
                        >
                          {isUpdating === appointment.id ? "..." : "Réactiver"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedAppointment && (
        <RejectAppointmentDialog
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
          appointment={selectedAppointment}
          serviceName={getServiceName(selectedAppointment.service)}
          onReject={handleRejectConfirm}
          primaryColor={clinic.primary_color}
        />
      )}
    </div>
  );
}

