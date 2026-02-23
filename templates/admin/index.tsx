import { MinimalAdminTemplate } from "./minimal";
import { AdvancedAdminTemplate } from "./advanced";

export type AdminTemplateType = "minimal" | "advanced";

export interface AdminTemplateProps {
  clinic: {
    id: string;
    name: string;
    primary_color: string;
    secondary_color: string;
    admin_template: AdminTemplateType;
  };
  services: Array<{
    id: string;
    name: string;
    duration: number;
    description: string;
  }>;
  appointments: Array<{
    id: string;
    patient_name: string;
    patient_phone: string;
    service: string;
    date: string;
    time: string;
    status: "pending" | "confirmed" | "cancelled";
    message?: string;
    created_at: string;
  }>;
  onUpdateStatus: (appointmentId: string, status: "pending" | "confirmed" | "cancelled") => Promise<void>;
}

const adminTemplates: Record<AdminTemplateType, React.ComponentType<AdminTemplateProps>> = {
  minimal: MinimalAdminTemplate,
  advanced: AdvancedAdminTemplate,
};

export function AdminTemplate({ clinic, services, appointments, onUpdateStatus }: AdminTemplateProps) {
  const TemplateComponent = adminTemplates[clinic.admin_template] || MinimalAdminTemplate;

  return <TemplateComponent clinic={clinic} services={services} appointments={appointments} onUpdateStatus={onUpdateStatus} />;
}

