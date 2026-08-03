import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const CustomerAuthContext =
  createContext(null);

const EMPTY_PROFILE = {
  first_name: "",
  last_name: "",
  company: "",
  phone: "",
  address: "",
  address2: "",
  postal_code: "",
  city: "",
  country: "France",
};

function getOAuthRedirectUrl() {
  const origin =
    window.location.origin;

  return `${origin}/mon-compte`;
}

function normalizeProfile(
  profile,
  authenticatedUser
) {
  const metadata =
    authenticatedUser
      ?.user_metadata || {};

  return {
    ...EMPTY_PROFILE,
    ...(profile || {}),

    first_name:
      profile?.first_name ||
      metadata.first_name ||
      metadata.given_name ||
      "",

    last_name:
      profile?.last_name ||
      metadata.last_name ||
      metadata.family_name ||
      "",

    country:
      profile?.country ||
      "France",
  };
}

export function CustomerAuthProvider({
  children,
}) {
  const [
    session,
    setSession,
  ] = useState(null);

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);

  const loadProfile =
    useCallback(
      async (
        authenticatedUser
      ) => {
        if (
          !authenticatedUser
        ) {
          setProfile(null);
          return null;
        }

        setProfileLoading(true);

        try {
          const {
            data,
            error,
          } = await supabase
            .from(
              "customer_profiles"
            )
            .select("*")
            .eq(
              "id",
              authenticatedUser.id
            )
            .maybeSingle();

          if (error) {
            throw error;
          }

          const normalizedProfile =
            normalizeProfile(
              data,
              authenticatedUser
            );

          /*
           * Si aucun profil n’existe encore,
           * on le crée automatiquement.
           *
           * C’est utile pour les connexions
           * Google, Apple et X/Twitter.
           */
          if (!data) {
            const {
              data:
                createdProfile,
              error:
                creationError,
            } = await supabase
              .from(
                "customer_profiles"
              )
              .insert({
                id:
                  authenticatedUser.id,

                first_name:
                  normalizedProfile
                    .first_name,

                last_name:
                  normalizedProfile
                    .last_name,

                company: "",

                phone: "",

                address: "",

                address2: "",

                postal_code: "",

                city: "",

                country:
                  "France",
              })
              .select("*")
              .single();

            if (
              creationError
            ) {
              throw creationError;
            }

            const finalProfile =
              normalizeProfile(
                createdProfile,
                authenticatedUser
              );

            setProfile(
              finalProfile
            );

            return finalProfile;
          }

          setProfile(
            normalizedProfile
          );

          return normalizedProfile;
        } catch (error) {
          console.error(
            "Erreur lors du chargement du profil client :",
            error
          );

          setProfile(
            normalizeProfile(
              null,
              authenticatedUser
            )
          );

          return null;
        } finally {
          setProfileLoading(
            false
          );
        }
      },
      []
    );

  const signUp =
    useCallback(
      async ({
        email,
        password,
        first_name,
        last_name,
      }) => {
        const cleanedEmail =
          String(email || "")
            .trim()
            .toLowerCase();

        const cleanedFirstName =
          String(
            first_name || ""
          ).trim();

        const cleanedLastName =
          String(
            last_name || ""
          ).trim();

        const {
          data,
          error,
        } =
          await supabase.auth.signUp(
            {
              email:
                cleanedEmail,

              password,

              options: {
                data: {
                  first_name:
                    cleanedFirstName,

                  last_name:
                    cleanedLastName,
                },

                emailRedirectTo:
                  getOAuthRedirectUrl(),
              },
            }
          );

        if (error) {
          throw error;
        }

        /*
         * Si Supabase connecte immédiatement
         * le nouvel utilisateur, on crée son
         * profil maintenant.
         *
         * Si la confirmation par e-mail est
         * obligatoire, le profil sera créé
         * automatiquement à sa première
         * connexion.
         */
        if (
          data.user &&
          data.session
        ) {
          await loadProfile(
            data.user
          );
        }

        return {
          user:
            data.user || null,

          session:
            data.session ||
            null,

          emailConfirmationRequired:
            Boolean(
              data.user &&
                !data.session
            ),
        };
      },
      [loadProfile]
    );

  const signIn =
    useCallback(
      async (
        email,
        password
      ) => {
        const cleanedEmail =
          String(email || "")
            .trim()
            .toLowerCase();

        const {
          data,
          error,
        } =
          await supabase.auth
            .signInWithPassword({
              email:
                cleanedEmail,

              password,
            });

        if (error) {
          throw error;
        }

        if (
          !data.user ||
          !data.session
        ) {
          throw new Error(
            "La connexion n’a pas pu être établie."
          );
        }

        setSession(
          data.session
        );

        setUser(
          data.user
        );

        await loadProfile(
          data.user
        );

        return {
          session:
            data.session,

          user:
            data.user,
        };
      },
      [loadProfile]
    );

  const signInWithProvider =
    useCallback(
      async (provider) => {
        const allowedProviders =
          [
            "google",
            "apple",
            "twitter",
          ];

        if (
          !allowedProviders.includes(
            provider
          )
        ) {
          throw new Error(
            "Fournisseur de connexion non pris en charge."
          );
        }

        const {
          data,
          error,
        } =
          await supabase.auth
            .signInWithOAuth({
              provider,

              options: {
                redirectTo:
                  getOAuthRedirectUrl(),

                /*
                 * Google permet de choisir
                 * son compte à chaque
                 * connexion.
                 */
                queryParams:
                  provider ===
                  "google"
                    ? {
                        prompt:
                          "select_account",
                      }
                    : undefined,
              },
            });

        if (error) {
          throw error;
        }

        return data;
      },
      []
    );

  const signInWithGoogle =
    useCallback(
      async () => {
        return signInWithProvider(
          "google"
        );
      },
      [signInWithProvider]
    );

  const signInWithApple =
    useCallback(
      async () => {
        return signInWithProvider(
          "apple"
        );
      },
      [signInWithProvider]
    );

  const signInWithX =
    useCallback(
      async () => {
        /*
         * Dans Supabase, le fournisseur
         * correspondant à X conserve le
         * nom technique "twitter".
         */
        return signInWithProvider(
          "twitter"
        );
      },
      [signInWithProvider]
    );

  const signOut =
    useCallback(
      async () => {
        const {
          error,
        } =
          await supabase.auth
            .signOut();

        if (error) {
          throw error;
        }

        setSession(null);
        setUser(null);
        setProfile(null);
      },
      []
    );

  const updateProfile =
    useCallback(
      async (values) => {
        if (!user) {
          throw new Error(
            "Vous devez être connecté pour modifier votre profil."
          );
        }

        const profileValues = {
          first_name:
            String(
              values?.first_name ||
                ""
            ).trim(),

          last_name:
            String(
              values?.last_name ||
                ""
            ).trim(),

          company:
            String(
              values?.company ||
                ""
            ).trim(),

          phone:
            String(
              values?.phone ||
                ""
            ).trim(),

          address:
            String(
              values?.address ||
                ""
            ).trim(),

          address2:
            String(
              values?.address2 ||
                ""
            ).trim(),

          postal_code:
            String(
              values?.postal_code ||
                ""
            ).trim(),

          city:
            String(
              values?.city ||
                ""
            ).trim(),

          country:
            String(
              values?.country ||
                "France"
            ).trim(),

          updated_at:
            new Date()
              .toISOString(),
        };

        const {
          data,
          error,
        } = await supabase
          .from(
            "customer_profiles"
          )
          .upsert(
            {
              id: user.id,
              ...profileValues,
            },
            {
              onConflict: "id",
            }
          )
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        const normalizedProfile =
          normalizeProfile(
            data,
            user
          );

        setProfile(
          normalizedProfile
        );

        return normalizedProfile;
      },
      [user]
    );

  const refreshProfile =
    useCallback(
      async () => {
        if (!user) {
          setProfile(null);
          return null;
        }

        return loadProfile(
          user
        );
      },
      [
        user,
        loadProfile,
      ]
    );

  useEffect(() => {
    let componentIsMounted =
      true;

    const initializeAuth =
      async () => {
        setLoading(true);

        try {
          const {
            data: {
              session:
                currentSession,
            },
            error,
          } =
            await supabase.auth
              .getSession();

          if (error) {
            throw error;
          }

          if (
            !componentIsMounted
          ) {
            return;
          }

          setSession(
            currentSession
          );

          setUser(
            currentSession
              ?.user || null
          );

          if (
            currentSession?.user
          ) {
            await loadProfile(
              currentSession.user
            );
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error(
            "Erreur lors de l’initialisation de la session client :",
            error
          );

          if (
            componentIsMounted
          ) {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        } finally {
          if (
            componentIsMounted
          ) {
            setLoading(false);
          }
        }
      };

    initializeAuth();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth
        .onAuthStateChange(
          async (
            _event,
            nextSession
          ) => {
            if (
              !componentIsMounted
            ) {
              return;
            }

            setSession(
              nextSession
            );

            setUser(
              nextSession?.user ||
                null
            );

            if (
              nextSession?.user
            ) {
              await loadProfile(
                nextSession.user
              );
            } else {
              setProfile(null);
            }

            if (
              componentIsMounted
            ) {
              setLoading(false);
            }
          }
        );

    return () => {
      componentIsMounted =
        false;

      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const hasCompleteShippingAddress =
    useMemo(() => {
      if (!profile) {
        return false;
      }

      return Boolean(
        profile.first_name &&
          profile.last_name &&
          profile.phone &&
          profile.address &&
          profile.postal_code &&
          profile.city &&
          profile.country
      );
    }, [profile]);

  const value =
    useMemo(
      () => ({
        session,
        user,
        profile,

        loading:
          loading ||
          profileLoading,

        authLoading:
          loading,

        profileLoading,

        isAuthenticated:
          Boolean(
            session &&
              user
          ),

        hasCompleteShippingAddress,

        signUp,
        signIn,

        signInWithProvider,
        signInWithGoogle,
        signInWithApple,
        signInWithX,

        signOut,
        updateProfile,
        refreshProfile,
      }),
      [
        session,
        user,
        profile,
        loading,
        profileLoading,
        hasCompleteShippingAddress,
        signUp,
        signIn,
        signInWithProvider,
        signInWithGoogle,
        signInWithApple,
        signInWithX,
        signOut,
        updateProfile,
        refreshProfile,
      ]
    );

  return (
    <CustomerAuthContext.Provider
      value={value}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context =
    useContext(
      CustomerAuthContext
    );

  if (!context) {
    throw new Error(
      "useCustomerAuth doit être utilisé à l’intérieur de CustomerAuthProvider."
    );
  }

  return context;
}