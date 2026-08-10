import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const statusOptions = [
  {
    value: "new",
    label: "Nouvelle",
  },
  {
    value: "contacted",
    label: "Contactée",
  },
  {
    value: "accepted",
    label: "Acceptée",
  },
  {
    value: "rejected",
    label: "Refusée",
  },
];

const statusStyles = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  contacted:
    "border-amber-200 bg-amber-50 text-amber-700",
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected:
    "border-red-200 bg-red-50 text-red-700",
};

function text(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Non renseigné";
  }

  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  return String(value);
}

function dateTime(value) {
  if (!value) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminRequestsManager({
  tableName,
  title,
  eyebrow,
  description,
  accent,
  icon: PageIcon,
  fields,
}) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [searchValue, setSearchValue] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [selectedRequest, setSelectedRequest] =
    useState(null);
  const [updatingId, setUpdatingId] =
    useState(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        `Erreur de chargement ${tableName}:`,
        error
      );

      setErrorMessage(error.message);
      setRequests([]);
    } else {
      setRequests(data || []);
    }

    setIsLoading(false);
  }, [tableName]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    const query = searchValue
      .trim()
      .toLocaleLowerCase("fr-FR");

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" ||
        (request.status || "new") ===
          statusFilter;

      const searchable = [
        request.name,
        request.full_name,
        request.email,
        request.phone,
        request.city,
        request.postal_code,
        request.company,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr-FR");

      return (
        matchesStatus &&
        (!query || searchable.includes(query))
      );
    });
  }, [
    requests,
    searchValue,
    statusFilter,
  ]);

  const newCount = requests.filter(
    (request) =>
      (request.status || "new") === "new"
  ).length;

  async function updateStatus(
    request,
    nextStatus
  ) {
    setUpdatingId(request.id);

    const { error } = await supabase
      .from(tableName)
      .update({
        status: nextStatus,
      })
      .eq("id", request.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setRequests((current) =>
        current.map((item) =>
          item.id === request.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      );

      setSelectedRequest((current) =>
        current?.id === request.id
          ? {
              ...current,
              status: nextStatus,
            }
          : current
      );
    }

    setUpdatingId(null);
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1450px]">
        <motion.header
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative overflow-hidden rounded-[28px] bg-[#050b16] p-6 text-white shadow-[0_20px_65px_rgba(2,7,17,0.14)] sm:p-8"
        >
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
            style={{
              backgroundColor: accent,
            }}
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div
                className="flex items-center gap-2"
                style={{
                  color: accent,
                }}
              >
                <PageIcon className="h-5 w-5" />

                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  {eyebrow}
                </p>
              </div>

              <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">
                {title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {description}
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <p className="text-xs font-bold text-slate-400">
                  Total
                </p>

                <p className="mt-1 font-display text-2xl font-black">
                  {requests.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <p className="text-xs font-bold text-slate-400">
                  Nouvelles
                </p>

                <p
                  className="mt-1 font-display text-2xl font-black"
                  style={{
                    color: accent,
                  }}
                >
                  {newCount}
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(2,7,17,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:p-5">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(
                    event.target.value
                  )
                }
                placeholder="Rechercher un nom, e-mail, téléphone ou ville…"
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold outline-none focus:border-[#17649e] focus:bg-white focus:ring-4 focus:ring-[#17649e]/10"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none"
            >
              <option value="all">
                Tous les statuts
              </option>

              {statusOptions.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadRequests}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-black transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />

              Actualiser
            </button>
          </div>

          {errorMessage ? (
            <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid min-h-[360px] place-items-center">
              <div className="text-center text-slate-500">
                <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />

                <p className="mt-3 text-sm font-bold">
                  Chargement des demandes…
                </p>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="grid min-h-[320px] place-items-center p-6 text-center">
              <div>
                <CheckCircle2 className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 font-black">
                  Aucune demande trouvée
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Modifiez les filtres ou
                  actualisez la page.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map(
                (request) => {
                  const status =
                    request.status || "new";

                  const statusLabel =
                    statusOptions.find(
                      (item) =>
                        item.value === status
                    )?.label || status;

                  const name =
                    request.full_name ||
                    request.name ||
                    "Demande sans nom";

                  return (
                    <button
                      type="button"
                      key={request.id}
                      onClick={() =>
                        setSelectedRequest(
                          request
                        )
                      }
                      className="grid w-full gap-3 p-4 text-left transition hover:bg-slate-50 sm:grid-cols-[minmax(180px,1.1fr)_minmax(180px,1fr)_150px_135px_28px] sm:items-center sm:p-5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#020711]">
                          {name}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {request.city ||
                            request.company ||
                            "Localisation non renseignée"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {request.email ||
                            "E-mail non renseigné"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {request.phone ||
                            "Téléphone non renseigné"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Clock3 className="h-4 w-4" />

                        {dateTime(
                          request.created_at
                        )}
                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black ${
                          statusStyles[
                            status
                          ] || statusStyles.new
                        }`}
                      >
                        {statusLabel}
                      </span>

                      <ChevronRight className="hidden h-5 w-5 text-slate-400 sm:block" />
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>

      {selectedRequest ? (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <button
            type="button"
            onClick={() =>
              setSelectedRequest(null)
            }
            className="absolute inset-0 bg-[#020711]/60 backdrop-blur-sm"
            aria-label="Fermer le détail"
          />

          <motion.aside
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            className="relative h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-xs font-black uppercase tracking-[0.18em]"
                  style={{
                    color: accent,
                  }}
                >
                  Détail de la demande
                </p>

                <h2 className="mt-2 font-display text-2xl font-black">
                  {selectedRequest.full_name ||
                    selectedRequest.name ||
                    "Demande"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(null)
                }
                className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={`mailto:${
                  selectedRequest.email || ""
                }`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 font-bold text-slate-700 hover:bg-slate-50"
              >
                <Mail
                  className="h-5 w-5"
                  style={{
                    color: accent,
                  }}
                />

                <span className="truncate">
                  {selectedRequest.email ||
                    "Sans e-mail"}
                </span>
              </a>

              <a
                href={`tel:${
                  selectedRequest.phone || ""
                }`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 font-bold text-slate-700 hover:bg-slate-50"
              >
                <Phone
                  className="h-5 w-5"
                  style={{
                    color: accent,
                  }}
                />

                <span>
                  {selectedRequest.phone ||
                    "Sans téléphone"}
                </span>
              </a>
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                Statut du dossier
              </span>

              <select
                value={
                  selectedRequest.status ||
                  "new"
                }
                disabled={
                  updatingId ===
                  selectedRequest.id
                }
                onChange={(event) =>
                  updateStatus(
                    selectedRequest,
                    event.target.value
                  )
                }
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-black outline-none"
              >
                {statusOptions.map(
                  (status) => (
                    <option
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </option>
                  )
                )}
              </select>
            </label>

            <div className="mt-7 space-y-3">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="text-xs font-black uppercase tracking-[0.13em] text-slate-400">
                    {field.label}
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-slate-800">
                    {field.format
                      ? field.format(
                          selectedRequest[
                            field.key
                          ],
                          selectedRequest
                        )
                      : text(
                          selectedRequest[
                            field.key
                          ]
                        )}
                  </p>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </div>
  );
}