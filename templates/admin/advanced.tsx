"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, MessageSquare, CheckCircle, XCircle, AlertCircle, Filter } from "lucide-react";
import type { AdminTemplateProps } from "./index";
import { RejectAppointmentDialog } from "@/components/dashboard/reject-appointment-dialog";
import {
  generateConfirmationMessage,
  generateRejectionMessage,
  generateWhatsAppLink,
} from "@/lib/utils";

export function AdvancedAdminTemplate({ clinic, services, appointments, onUpdateStatus }: AdminTemplateProps) {
  const [selectedDate, setSelectedDate] = useState<string>(""); // Vide = tous les RDV
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
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

  const filteredAppointments = appointments
    .filter((apt) => !selectedDate || apt.date === selectedDate)
    .filter((apt) => statusFilter === "all" || apt.status === statusFilter)
    .sort((a, b) => {
      // Trier par date puis par heure
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.time.localeCompare(b.time);
    });

  const todayAppointments = appointments.filter(
    (apt) => apt.date === new Date().toISOString().split("T")[0]
  );

  const pendingCount = todayAppointments.filter((apt) => apt.status === "pending").length;
  const confirmedCount = todayAppointments.filter((apt) => apt.status === "confirmed").length;
  const cancelledCount = todayAppointments.filter((apt) => apt.status === "cancelled").length;
  const totalCount = todayAppointments.length;

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
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}
      >
        <Icon className="w-3 h-3" />
        {labels[status as keyof typeof labels]}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec gradient */}
      <div
        className="bg-gradient-to-r text-white"
        style={{
          background: `linear-gradient(135deg, ${clinic.primary_color} 0%, ${clinic.secondary_color} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{clinic.name}</h1>
          <p className="text-sm sm:text-base text-white/90">Tableau de bord avancé - Gestion des rendez-vous</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total aujourd&apos;hui</p>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: clinic.primary_color }}>
              {totalCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">En attente</p>
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Confirmés</p>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{confirmedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Annulés</p>
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{cancelledCount}</p>
          </div>
        </div>

        {/* Filtres avancés */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1 w-full sm:w-auto">
              <label htmlFor="date-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Date
              </label>
              <div className="flex gap-2">
                <input
                  id="date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ "--tw-ring-color": clinic.primary_color } as React.CSSProperties}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate("")}
                  disabled={!selectedDate}
                  className="text-xs sm:text-sm"
                >
                  Tout
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label htmlFor="status-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Statut
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ "--tw-ring-color": clinic.primary_color } as React.CSSProperties}
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmés</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left sm:mb-0 mb-2">
              {filteredAppointments.length} résultat(s)
            </div>
          </div>
        </div>

        {/* Liste des rendez-vous en grille */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun rendez-vous trouvé</p>
            <p className="text-gray-400 text-sm mt-2">
              Ajustez les filtres pour voir plus de résultats
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{appointment.patient_name}</h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 font-medium truncate">{getServiceName(appointment.service)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 truncate">{appointment.patient_phone}</span>
                  </div>
                  {appointment.message && (
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 line-clamp-2 break-words">{appointment.message}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={() => window.open(getWhatsAppLink(appointment.patient_phone), "_blank")}
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 text-xs sm:text-sm"
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
                        className="flex-1 text-xs sm:text-sm"
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
                      className="flex-1 text-xs sm:text-sm"
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
                      className="text-white flex-1 text-xs sm:text-sm"
                    >
                      {isUpdating === appointment.id ? "..." : "Réactiver"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
    </div>
  );
}

