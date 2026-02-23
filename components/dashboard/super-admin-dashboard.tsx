"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Power, PowerOff } from "lucide-react";
import type { User } from "@/lib/auth";
import { CreateClinicDialog } from "./create-clinic-dialog";
import { useToast } from "@/hooks/use-toast";

interface SuperAdminDashboardProps {
  user: User;
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<any | null>(null);
  const [updatingClinicId, setUpdatingClinicId] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchClinics() {
    try {
      const response = await fetch("/api/clinics");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des cliniques");
      }
      const data = await response.json();
      setClinics(data.clinics || []);
    } catch (error) {
      console.error("Erreur chargement cliniques:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClinics();
  }, []);

  async function handleToggleStatus(clinic: any) {
    setUpdatingClinicId(clinic.id);
    try {
      const response = await fetch(`/api/clinics/${clinic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: !clinic.is_active,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la mise à jour");
      }

      toast({
        title: "Succès",
        description: `La clinique a été ${!clinic.is_active ? "activée" : "désactivée"} avec succès`,
      });

      // Recharger la liste des cliniques
      await fetchClinics();
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setUpdatingClinicId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Super Admin</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Bienvenue, {user.name}
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingClinic(null);
                setIsDialogOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une clinique
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200 px-4">
            <p className="text-sm sm:text-base text-gray-500 mb-4">Aucune clinique créée pour le moment</p>
            <Button
              onClick={() => {
                setEditingClinic(null);
                setIsDialogOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer la première clinique
            </Button>
          </div>
        ) : (
          <>
            {/* Version mobile : cartes */}
            <div className="block md:hidden space-y-4">
              {clinics.map((clinic) => (
                <div key={clinic.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{clinic.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">/{clinic.slug}</p>
                    </div>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shrink-0 ml-2 ${
                        clinic.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {clinic.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Créée le {new Date(clinic.created_at).toLocaleDateString("fr-FR")}
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingClinic(clinic);
                        setIsDialogOpen(true);
                      }}
                      className="w-full"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant={clinic.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggleStatus(clinic)}
                      disabled={updatingClinicId === clinic.id}
                      className="w-full"
                    >
                      {updatingClinicId === clinic.id ? (
                        "..."
                      ) : clinic.is_active ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-1" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-1" />
                          Activer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Version desktop : tableau */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clinics.map((clinic) => (
                      <tr key={clinic.id}>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {clinic.name}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {clinic.slug}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              clinic.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {clinic.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(clinic.created_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingClinic(clinic);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              <span className="hidden lg:inline">Modifier</span>
                            </Button>
                            <Button
                              variant={clinic.is_active ? "destructive" : "default"}
                              size="sm"
                              onClick={() => handleToggleStatus(clinic)}
                              disabled={updatingClinicId === clinic.id}
                            >
                              {updatingClinicId === clinic.id ? (
                                "..."
                              ) : clinic.is_active ? (
                                <>
                                  <PowerOff className="w-4 h-4 mr-1" />
                                  <span className="hidden lg:inline">Désactiver</span>
                                </>
                              ) : (
                                <>
                                  <Power className="w-4 h-4 mr-1" />
                                  <span className="hidden lg:inline">Activer</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateClinicDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingClinic(null);
          }
        }}
        clinic={editingClinic}
        onSuccess={() => {
          // Recharger la liste des cliniques
          fetchClinics();
          setEditingClinic(null);
        }}
      />
    </div>
  );
}

