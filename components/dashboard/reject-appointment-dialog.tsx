"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RejectAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    patient_name: string;
    patient_phone: string;
    service: string;
    date: string;
    time: string;
  };
  serviceName: string;
  onReject: (reason?: string) => void;
  primaryColor?: string;
}

export function RejectAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  serviceName,
  onReject,
  primaryColor,
}: RejectAppointmentDialogProps) {
  const [reason, setReason] = useState("");

  function handleReject() {
    onReject(reason.trim() || undefined);
    setReason("");
    onOpenChange(false);
  }

  function handleCancel() {
    setReason("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeter le rendez-vous</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de rejeter le rendez-vous de {appointment.patient_name}. 
            Vous pouvez optionnellement indiquer une raison qui sera incluse dans le message WhatsApp.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du rejet (optionnel)</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Créneau déjà réservé, Service non disponible..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Si vous laissez ce champ vide, le message ne contiendra pas de raison spécifique.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleReject}>
            Rejeter et ouvrir WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

