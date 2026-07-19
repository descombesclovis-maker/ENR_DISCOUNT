import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdminProfile = useCallback(
    async (authenticatedUser) => {
      if (!authenticatedUser) {
        setAdminProfile(null);
        return null;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select(`
          user_id,
          email,
          full_name,
          is_active
        `)
        .eq("user_id", authenticatedUser.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error(
          "Erreur lors de la vérification administrateur :",
          error
        );

        setAdminProfile(null);
        return null;
      }

      setAdminProfile(data || null);

      return data || null;
    },
    []
  );

  const signIn = useCallback(
    async (email, password) => {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error(
          "La connexion n’a pas pu être établie."
        );
      }

      const profile = await loadAdminProfile(data.user);

      if (!profile) {
        await supabase.auth.signOut();

        setSession(null);
        setUser(null);
        setAdminProfile(null);

        throw new Error(
          "Ce compte n’est pas autorisé à accéder à l’administration."
        );
      }

      setSession(data.session);
      setUser(data.user);
      setAdminProfile(profile);

      return {
        session: data.session,
        user: data.user,
        adminProfile: profile,
      };
    },
    [loadAdminProfile]
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setUser(null);
    setAdminProfile(null);
  }, []);

  useEffect(() => {
    let componentIsMounted = true;

    const initializeAuth = async () => {
      setLoading(true);

      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!componentIsMounted) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await loadAdminProfile(currentSession.user);
        } else {
          setAdminProfile(null);
        }
      } catch (error) {
        console.error(
          "Erreur lors de l’initialisation de la session :",
          error
        );

        if (componentIsMounted) {
          setSession(null);
          setUser(null);
          setAdminProfile(null);
        }
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!componentIsMounted) {
          return;
        }

        setSession(nextSession);
        setUser(nextSession?.user || null);

        if (nextSession?.user) {
          await loadAdminProfile(nextSession.user);
        } else {
          setAdminProfile(null);
        }

        if (componentIsMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      componentIsMounted = false;
      subscription.unsubscribe();
    };
  }, [loadAdminProfile]);

  const value = useMemo(
    () => ({
      session,
      user,
      adminProfile,
      isAdmin: Boolean(
        user &&
          adminProfile &&
          adminProfile.is_active
      ),
      loading,
      signIn,
      signOut,
    }),
    [
      session,
      user,
      adminProfile,
      loading,
      signIn,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l’intérieur de AuthProvider."
    );
  }

  return context;
}