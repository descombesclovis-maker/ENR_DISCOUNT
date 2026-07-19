import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function SupabaseTest() {
  const [status, setStatus] = useState(
    "Connexion en cours…"
  );

  const [message, setMessage] = useState("");

  useEffect(() => {
    let componentIsMounted = true;

    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug")
          .limit(1);

        if (error) {
          throw error;
        }

        if (!componentIsMounted) {
          return;
        }

        setStatus("Connexion Supabase réussie");

        if (data.length === 0) {
          setMessage(
            "La table categories est accessible et elle est encore vide."
          );
        } else {
          setMessage(
            `Catégorie trouvée : ${data[0].name}`
          );
        }
      } catch (error) {
        if (!componentIsMounted) {
          return;
        }

        console.error(
          "Erreur Supabase :",
          error
        );

        setStatus("Échec de la connexion Supabase");

        setMessage(
          error?.message ||
            "Une erreur inconnue est survenue."
        );
      }
    };

    testSupabaseConnection();

    return () => {
      componentIsMounted = false;
    };
  }, []);

  const connectionSucceeded =
    status === "Connexion Supabase réussie";

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24">
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <p className="overline text-primary mb-3">
          Test technique
        </p>

        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight mb-5">
          Connexion à Supabase
        </h1>

        <p
          className={`font-semibold text-lg ${
            connectionSucceeded
              ? "text-primary"
              : "text-foreground"
          }`}
        >
          {status}
        </p>

        {message && (
          <p className="text-muted-foreground mt-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}