import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-5">
        <div className="text-center">
          <LoaderCircle className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />

          <p className="font-display font-semibold">
            Vérification de la session…
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}