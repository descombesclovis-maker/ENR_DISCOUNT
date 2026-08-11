import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileBadge2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const statuses = {
  pending: { label: "À vérifier", className: "border-amber-200 bg-amber-50 text-amber-700" },
  processing: { label: "Traitement…", className: "border-blue-200 bg-blue-50 text-blue-700" },
  approved: { label: "Approuvée", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  rejected: { label: "Refusée", className: "border-red-200 bg-red-50 text-red-700" },
  error: { label: "Erreur", className: "border-rose-200 bg-rose-50 text-rose-700" },
};

function formatDate(value) {
  if (!value) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminPartnerProfessionals() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("qeh_professional_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setApplications([]);
    } else {
      setApplications(data || []);
      setSelected((current) => {
        if (!current) return null;
        return (data || []).find((item) => item.id === current.id) || null;
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase("fr-FR");

    return applications.filter((application) => {
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const content = [
        application.company_name,
        application.siret,
        application.first_name,
        application.last_name,
        application.email,
        application.phone,
        application.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr-FR");

      return matchesStatus && (!query || content.includes(query));
    });
  }, [applications, searchValue, statusFilter]);

  const pendingCount = applications.filter((item) => item.status === "pending").length;
  const approvedCount = applications.filter((item) => item.status === "approved").length;

  async function decide(decision) {
    if (!selected || action) return;

    if (decision === "reject" && rejectionReason.trim().length < 8) {
      toast.error("Précisez la raison du refus afin d’informer le professionnel.");
      return;
    }

    setAction(decision);

    try {
      const { data, error } = await supabase.functions.invoke(
        "qeh-professional-approva",
        {
          body: {
            application_id: selected.id,
            decision,
            rejection_reason: decision === "reject" ? rejectionReason.trim() : undefined,
          },
        }
      );

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "La décision n’a pas été enregistrée.");

      toast.success(
        decision === "approve"
          ? "Compte professionnel créé et e-mail d’activation envoyé."
          : "Demande refusée et professionnel informé par e-mail."
      );

      setRejectionReason("");
      await loadApplications();
    } catch (error) {
      toast.error(error?.message || "Impossible de traiter cette demande.");
    } finally {
      setAction(null);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[30px] bg-[#050b16] p-6 text-white shadow-[0_22px_70px_rgba(2,7,17,.16)] sm:p-8"
        >
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#c99532]/25 blur-3xl" />
          <div className="absolute inset-y-0 right-[22%] w-px bg-gradient-to-b from-transparent via-[#f3d98b]/30 to-transparent" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#f3d98b]"><UserCheck className="h-5 w-5" /> QEH Partner</p>
              <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">Comptes professionnels</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Vérifiez chaque entreprise. Une approbation crée son accès Matériel Pro et envoie automatiquement un lien sécurisé pour choisir son mot de passe.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[[applications.length, "Total"], [pendingCount, "À vérifier"], [approvedCount, "Approuvées"]].map(([value, label]) => (
                <div key={label} className="min-w-[105px] rounded-2xl border border-white/10 bg-white/[.06] p-4">
                  <p className="text-xs font-bold text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-black text-[#f3d98b]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(2,7,17,.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:p-5">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input type="search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Rechercher une entreprise, un SIRET, un nom ou un e-mail…" className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold outline-none focus:border-[#c99532] focus:bg-white focus:ring-4 focus:ring-[#c99532]/10" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none">
              <option value="all">Tous les statuts</option>
              {Object.entries(statuses).map(([value, status]) => <option key={value} value={value}>{status.label}</option>)}
            </select>
            <button type="button" onClick={loadApplications} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-black hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Actualiser</button>
          </div>

          {errorMessage ? <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700"><CircleAlert className="mr-2 inline h-5 w-5" />{errorMessage}</div> : null}

          {loading ? (
            <div className="grid min-h-[420px] place-items-center"><LoaderCircle className="h-9 w-9 animate-spin text-[#c99532]" /></div>
          ) : filtered.length === 0 ? (
            <div className="grid min-h-[420px] place-items-center p-8 text-center"><div><UserCheck className="mx-auto h-14 w-14 text-slate-300" /><h2 className="mt-5 text-xl font-black">Aucune candidature trouvée</h2><p className="mt-2 text-slate-500">Modifiez les filtres ou attendez une nouvelle demande.</p></div></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((application, index) => {
                const status = statuses[application.status] || statuses.pending;
                return (
                  <motion.button
                    type="button"
                    key={application.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035 }}
                    onClick={() => { setSelected(application); setRejectionReason(""); }}
                    className="grid w-full gap-4 p-5 text-left transition hover:bg-amber-50/40 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,.9fr)_160px_34px] sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#050b16] text-[#f3d98b]"><Building2 className="h-6 w-6" /></div><div className="min-w-0"><p className="truncate font-black text-slate-950">{application.company_name}</p><p className="mt-1 truncate text-sm text-slate-500">{application.first_name} {application.last_name}</p></div></div>
                    <div className="min-w-0 text-sm"><p className="truncate font-bold text-slate-700">{application.email}</p><p className="mt-1 truncate text-slate-500">SIRET · {application.siret}</p></div>
                    <div><span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${status.className}`}>{status.label}</span><p className="mt-2 text-xs text-slate-400">{formatDate(application.created_at)}</p></div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {selected ? (
          <>
            <motion.button type="button" aria-label="Fermer" className="fixed inset-0 z-[90] bg-[#020711]/65 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} />
            <motion.aside className="fixed inset-y-0 right-0 z-[100] w-full max-w-[600px] overflow-y-auto bg-white shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 220, damping: 25 }}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#050b16] p-5 text-white"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#f3d98b]">Candidature Matériel Pro</p><h2 className="mt-1 text-xl font-black">{selected.company_name}</h2></div><button type="button" onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><X className="h-5 w-5" /></button></div>
              <div className="p-5 sm:p-7">
                <div className="flex items-center justify-between gap-4"><span className={`rounded-full border px-3 py-1.5 text-xs font-black ${(statuses[selected.status] || statuses.pending).className}`}>{(statuses[selected.status] || statuses.pending).label}</span><span className="flex items-center gap-2 text-xs font-semibold text-slate-400"><Clock3 className="h-4 w-4" />{formatDate(selected.created_at)}</span></div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    [Building2, "Entreprise", selected.company_name],
                    [FileBadge2, "SIRET", selected.siret],
                    [ShieldCheck, "TVA", selected.vat_number || "Non renseigné"],
                    [UserCheck, "Responsable", `${selected.first_name} ${selected.last_name}`],
                    [Mail, "E-mail", selected.email],
                    [Phone, "Téléphone", selected.phone],
                    [MapPin, "Adresse", `${selected.address}, ${selected.postal_code} ${selected.city}`],
                  ].map(([Icon, label, value], index) => (
                    <div key={label} className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 ${index === 6 ? "sm:col-span-2" : ""}`}><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-slate-400"><Icon className="h-4 w-4 text-[#c99532]" />{label}</div><p className="mt-2 break-words font-bold text-slate-900">{value}</p></div>
                  ))}
                </div>

                {selected.processing_error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"><CircleAlert className="mr-2 inline h-5 w-5" />{selected.processing_error}</div> : null}
                {selected.approval_email_sent_at ? <div className="mt-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><Send className="h-5 w-5 shrink-0" /><div><strong>E-mail d’activation envoyé</strong><p className="mt-1">{formatDate(selected.approval_email_sent_at)}</p></div></div> : null}
                {selected.rejection_reason ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><strong>Motif du refus</strong><p className="mt-1">{selected.rejection_reason}</p></div> : null}

                {["pending", "error"].includes(selected.status) ? (
                  <div className="mt-7 border-t border-slate-200 pt-6">
                    <label><span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-slate-500">Motif à communiquer en cas de refus</span><textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows="3" placeholder="Expliquez clairement la raison du refus…" className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-semibold outline-none focus:border-[#c99532] focus:ring-4 focus:ring-[#c99532]/10" /></label>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button type="button" disabled={Boolean(action)} onClick={() => decide("reject")} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 font-black text-red-700 disabled:opacity-50">{action === "reject" ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />} Refuser</button>
                      <button type="button" disabled={Boolean(action)} onClick={() => decide("approve")} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#a8751f] via-[#f3d98b] to-[#bd8426] px-5 font-black text-[#07101c] shadow-lg disabled:opacity-50">{action === "approve" ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <BadgeCheck className="h-5 w-5" />} Approuver et envoyer</button>
                    </div>
                  </div>
                ) : selected.status === "approved" ? (
                  <div className="mt-7 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800"><CheckCircle2 className="h-6 w-6" />Ce professionnel peut accéder au catalogue Matériel Pro.</div>
                ) : null}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}