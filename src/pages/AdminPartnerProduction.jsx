import React from "react";
import { Factory } from "lucide-react";

import AdminRequestsManager from "../components/AdminRequestsManager";

export default function AdminPartnerProduction() {
  return (
    <AdminRequestsManager
      tableName="qeh_partner_producer_applications"
      eyebrow="QEH Partner"
      title="Demandes de production"
      description="Analysez les projets de production solaire destinés à rejoindre les opérations d’autoconsommation collective."
      accent="#c99532"
      icon={Factory}
      fields={[
        {
          key: "address",
          label: "Adresse du projet",
        },
        {
          key: "postal_code",
          label: "Code postal",
        },
        {
          key: "city",
          label: "Ville",
        },
        {
          key: "project_type",
          label: "Type de projet",
        },
        {
          key: "project_stage",
          label: "Avancement",
        },
        {
          key: "roof_area",
          label: "Surface disponible",
          format: (value) =>
            value
              ? `${value} m²`
              : "Non renseignée",
        },
        {
          key: "estimated_power",
          label: "Puissance estimée",
          format: (value) =>
            value
              ? `${value} kWc`
              : "Non renseignée",
        },
        {
          key: "annual_consumption",
          label: "Consommation annuelle",
          format: (value) =>
            value
              ? `${value} kWh`
              : "Non renseignée",
        },
        {
          key: "message",
          label: "Message",
        },
      ]}
    />
  );
}