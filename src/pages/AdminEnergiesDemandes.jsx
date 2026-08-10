import React from "react";
import { Zap } from "lucide-react";

import AdminRequestsManager from "../components/AdminRequestsManager";

export default function AdminEnergiesDemandes() {
  return (
    <AdminRequestsManager
      tableName="solar_consumer_requests"
      eyebrow="QEH Énergies"
      title="Demandes d’électricité locale"
      description="Consultez les consommateurs souhaitant bénéficier d’une énergie solaire locale et organisez leur suivi."
      accent="#69b72d"
      icon={Zap}
      fields={[
        {
          key: "address",
          label: "Adresse",
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
          key: "annual_consumption_kwh",
          label: "Consommation annuelle",
          format: (value) =>
            value
              ? `${Number(value).toLocaleString(
                  "fr-FR"
                )} kWh`
              : "Non renseignée",
        },
        {
          key: "created_at",
          label: "Demande reçue le",
          format: (value) =>
            new Date(value).toLocaleString(
              "fr-FR"
            ),
        },
      ]}
    />
  );
}