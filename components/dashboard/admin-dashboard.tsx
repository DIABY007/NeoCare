"use client";

import { useState, useEffect } from "react";
import type { User } from "@/lib/auth";
import { AdminTemplate } from "@/templates/admin";
import { useToast } from "@/hooks/use-toast";
import { CreateAdminDialog } from "./create-admin-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

interface AdminDashboardProps {
  user: User;
  clinic: {
    id: string;
    name: string;
    primary_color: string;
    secondary_color: string;
    admin_template: "minimal" | "advanced";
    services: Array<{
      id: string;
      name: string;
      duration: number;
      description: string;
    }>;
  };
}

export function AdminDashboard({ user, clinic }: AdminDashboardProps) {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAppointments() {
    try {
      const response = await fetch("/api/appointments");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des rendez-vous");
      }
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Erreur chargement rendez-vous:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(
    appointmentId: string,
    status: "pending" | "confirmed" | "cancelled"
  ) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      const data = await response.json();
      
      // Mettre à jour la liste locale
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? data.appointment : apt))
      );

      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
              <Button
                onClick={() => setIsAdminDialogOpen(true)}
                size="lg"
                style={{ backgroundColor: clinic.primary_color }}
                className="w-full sm:w-auto shadow-lg"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Ajouter un admin
              </Button>
            </CardContent>
          </Card>

          <AdminTemplate
            clinic={{
              id: clinic.id,
              name: clinic.name,
              primary_color: clinic.primary_color,
              secondary_color: clinic.secondary_color,
              admin_template: clinic.admin_template,
            }}
            services={clinic.services}
            appointments={appointments}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
      </div>

      <CreateAdminDialog
        open={isAdminDialogOpen}
        onOpenChange={setIsAdminDialogOpen}
        clinicId={clinic.id}
        onSuccess={() => {
          toast({
            title: "Succès",
            description: "L'administrateur a été créé avec succès",
          });
        }}
      />
    </>
  );
}

