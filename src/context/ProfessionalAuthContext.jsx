import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import { useCustomerAuth } from "./CustomerAuthContext";

const ProfessionalAuthContext = createContext(null);

export function ProfessionalAuthProvider({ children }) {
  const { user, isAuthenticated, loading: customerLoading } = useCustomerAuth();
  const [professionalAccount, setProfessionalAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfessionalAccount = useCallback(async (authenticatedUser = user) => {
    if (!authenticatedUser) {
      setProfessionalAccount(null);
      setLoading(false);
      return null;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("qeh_professional_accounts")
      .select("user_id, company_name, siret, vat_number, status, created_at")
      .eq("user_id", authenticatedUser.id)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la vérification du compte professionnel :", error);
      setProfessionalAccount(null);
      setLoading(false);
      return null;
    }

    setProfessionalAccount(data || null);
    setLoading(false);
    return data || null;
  }, [user]);

  useEffect(() => {
    if (customerLoading) return;
    loadProfessionalAccount(user);
  }, [customerLoading, loadProfessionalAccount, user]);

  const value = useMemo(() => ({
    professionalAccount,
    professionalLoading: customerLoading || loading,
    isProfessional: Boolean(
      isAuthenticated && professionalAccount?.status === "approved"
    ),
    refreshProfessionalAccount: loadProfessionalAccount,
  }), [
    professionalAccount,
    customerLoading,
    loading,
    isAuthenticated,
    loadProfessionalAccount,
  ]);

  return (
    <ProfessionalAuthContext.Provider value={value}>
      {children}
    </ProfessionalAuthContext.Provider>
  );
}

export function useProfessionalAuth() {
  const context = useContext(ProfessionalAuthContext);

  if (!context) {
    throw new Error(
      "useProfessionalAuth doit être utilisé à l’intérieur de ProfessionalAuthProvider."
    );
  }

  return context;
}