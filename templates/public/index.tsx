import { ClassicPublicTemplate } from "./classic";
import { ModernPublicTemplate } from "./modern";

export type PublicTemplateType = "classic" | "modern";

import type { ServiceConfig } from "@/lib/appointment-utils";

export interface PublicTemplateProps {
  clinic: {
    id: string;
    name: string;
    slug: string;
    whatsapp_number: string;
    primary_color: string;
    secondary_color: string;
    hero_title: string;
    hero_subtitle: string;
    services: ServiceConfig[];
    public_template: PublicTemplateType;
  };
  onSubmitAppointment: (data: {
    patient_name: string;
    patient_phone: string;
    service: string;
    date: string;
    time: string;
    message?: string;
  }) => Promise<void>;
}

const publicTemplates: Record<PublicTemplateType, React.ComponentType<PublicTemplateProps>> = {
  classic: ClassicPublicTemplate,
  modern: ModernPublicTemplate,
};

export function PublicTemplate({ clinic, onSubmitAppointment }: PublicTemplateProps) {
  const TemplateComponent = publicTemplates[clinic.public_template] || ClassicPublicTemplate;

  return <TemplateComponent clinic={clinic} onSubmitAppointment={onSubmitAppointment} />;
}

