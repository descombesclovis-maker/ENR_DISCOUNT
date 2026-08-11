import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useProfessionalAuth } from "../context/ProfessionalAuthContext";

export default function ProfessionalRoute() {
  const location = useLocation();
  const { isAuthenticated, loading: customerLoading } = useCustomerAuth();
  const { isProfessional, professionalLoading } = useProfessionalAuth();

  if (customerLoading || professionalLoading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#020714] text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-[#f2cf79]" />
          <p className="mt-4 font-bold">Vérification de votre accès professionnel…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isProfessional) {
    return (
      <Navigate
        to="/qeh-partner/connexion-pro"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}