import React from "react";
import { Building2 } from "lucide-react";

import AdminRequestsManager from "../components/AdminRequestsManager";

export default function AdminPartnerFranchises() {
  return (
    <AdminRequestsManager
      tableName="qeh_partner_franchise_applications"
      eyebrow="QEH Partner"
      title="Demandes de franchise"
      description="Étudiez les profils, les secteurs souhaités et les capacités d’investissement des futurs partenaires QEH."
      accent="#c99532"
      icon={Building2}
      fields={[
        {
          key: "company",
          label: "Entreprise actuelle",
        },
        {
          key: "city",
          label: "Ville",
        },
        {
          key: "department",
          label: "Département",
        },
        {
          key: "preferred_area",
          label: "Secteur souhaité",
        },
        {
          key: "current_activity",
          label: "Activité actuelle",
        },
        {
          key: "management_experience",
          label: "Expérience en gestion",
        },
        {
          key: "investment_budget",
          label: "Budget d’investissement",
        },
        {
          key: "start_timeline",
          label: "Délai de démarrage",
        },
        {
          key: "motivation",
          label: "Motivation",
        },
      ]}
    />
  );
}