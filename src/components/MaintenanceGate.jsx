import React, { useEffect, useState } from "react";
import { LoaderCircle, Mail, Phone, Settings } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function MaintenanceGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [general, setGeneral] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadPublicSettings() {
      const { data, error } = await supabase.rpc("get_qeh_public_settings");

      if (!mounted) return;

      // Le site reste accessible si Supabase est momentanément indisponible.
      if (!error) setGeneral(data?.general || null);
      setLoading(false);
    }

    loadPublicSettings();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#020711] text-white">
        <LoaderCircle className="h-9 w-9 animate-spin text-[#c99532]" />
      </div>
    );
  }

  if (!general?.maintenance_mode) return children;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#020711] px-5 py-12 text-white">
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#17649e]/25 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#69b72d]/20 blur-3xl" />
      <section className="relative w-full max-w-2xl rounded-[36px] border border-white/10 bg-white/[0.06] p-7 text-center shadow-2xl backdrop-blur-xl sm:p-12">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-[#c99532]/40 bg-[#c99532]/10 text-[#f2cf79]">
          <Settings className="h-10 w-10" />
        </div>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-[#f2cf79]">{general.company_name || "QEH"}</p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">Le site évolue.</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-300">
          Une maintenance est en cours. Nous revenons très vite avec une expérience encore meilleure.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {general.contact_email ? <a href={`mailto:${general.contact_email}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-black text-[#020711]"><Mail className="h-5 w-5" />{general.contact_email}</a> : null}
          {general.contact_phone ? <a href={`tel:${String(general.contact_phone).replace(/\s/g, "")}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 font-black"><Phone className="h-5 w-5" />{general.contact_phone}</a> : null}
        </div>
      </section>
    </main>
  );
}