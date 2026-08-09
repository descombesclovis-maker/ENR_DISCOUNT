import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleHelp,
  LoaderCircle,
  LocateFixed,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Sun,
  UserRound,
  UsersRound,
  Zap,
} from "lucide-react";

import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import {
  toast,
} from "sonner";

import "leaflet/dist/leaflet.css";

import {
  supabase,
} from "../lib/supabase";

const SEARCH_RADIUS_METERS = 2000;
const REGISTERED_ZONES = [
  {
    id: "liernais-rue-de-la-mare",
    public_name: "Zone solaire de Liernais",
    address: "5 rue de la Mare",
    postal_code: "21430",
    city: "Liernais",
    latitude: 47.197738,
    longitude: 4.273241,
    is_registered_zone: true,
  },
  {
    id: "brazey-rue-de-chevannes",
    public_name: "Zone solaire de Brazey-en-Morvan",
    address: "7 rue de Chevannes",
    postal_code: "21430",
    city: "Brazey-en-Morvan",
    latitude: 47.17125,
    longitude: 4.286179,
    is_registered_zone: true,
  },
];

const DEFAULT_CENTER = [47.184494, 4.27971];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  installedPowerKwc: "",
  estimatedSurplusKwh: "",
  annualConsumptionKwh: "",
  consent: false,
};

function degreesToRadians(value) {
  return value * (Math.PI / 180);
}

function distanceInMeters(firstPoint, secondPoint) {
  const earthRadius = 6371000;
  const latitudeDelta = degreesToRadians(
    secondPoint.latitude - firstPoint.latitude
  );
  const longitudeDelta = degreesToRadians(
    secondPoint.longitude - firstPoint.longitude
  );

  const firstLatitude = degreesToRadians(
    firstPoint.latitude
  );
  const secondLatitude = degreesToRadians(
    secondPoint.latitude
  );

  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    )
  );
}

async function geocodeAddress(query) {
  const response = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
      query
    )}&limit=1`
  );

  if (!response.ok) {
    throw new Error(
      "Le service de recherche d’adresse est momentanément indisponible."
    );
  }

  const result = await response.json();
  const feature = result.features?.[0];

  if (!feature) {
    throw new Error(
      "Adresse introuvable. Vérifiez la rue, le code postal et la ville."
    );
  }

  const [longitude, latitude] =
    feature.geometry.coordinates;

  return {
    latitude,
    longitude,
    label: feature.properties.label,
    city: feature.properties.city || "",
    postalCode: feature.properties.postcode || "",
  };
}

function RecenterMap({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.1,
    });
  }, [center, map, zoom]);

  return null;
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  min,
  step,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">
        {label}
        {required ? " *" : ""}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition focus:border-[#17649e] focus:ring-4 focus:ring-[#17649e]/10"
      />
    </label>
  );
}

function RegistrationForm({ type }) {
  const isProducer = type === "producer";
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function handleChange(event) {
    const { name, value, checked, type: inputType } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        inputType === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.consent) {
      toast.error(
        "Votre accord est nécessaire pour traiter la demande."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const completeAddress = [
        form.address,
        form.postalCode,
        form.city,
      ]
        .filter(Boolean)
        .join(" ");

      const position = await geocodeAddress(
        completeAddress
      );

      const sharedValues = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        address: form.address.trim(),
        postal_code:
          form.postalCode.trim() ||
          position.postalCode,
        city: form.city.trim() || position.city,
        latitude: position.latitude,
        longitude: position.longitude,
        consent_given: true,
      };

      const tableName = isProducer
        ? "solar_producer_applications"
        : "solar_consumer_requests";

      const values = isProducer
        ? {
            ...sharedValues,
            installed_power_kwc: Number(
              form.installedPowerKwc
            ),
            estimated_surplus_kwh:
              form.estimatedSurplusKwh
                ? Number(form.estimatedSurplusKwh)
                : null,
          }
        : {
            ...sharedValues,
            annual_consumption_kwh:
              form.annualConsumptionKwh
                ? Number(form.annualConsumptionKwh)
                : null,
          };

      const { error } = await supabase
        .from(tableName)
        .insert(values);

      if (error) {
        throw error;
      }

      toast.success(
        isProducer
          ? "Votre installation a bien été proposée. Nous vous recontacterons après étude."
          : "Votre demande a bien été enregistrée. Nous vous recontacterons par e-mail."
      );

      setForm(initialForm);
    } catch (error) {
      console.error(
        "Erreur d’enregistrement QEH énergies :",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer votre demande."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(2,7,20,0.08)] sm:p-7"
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#69b72d]/12 text-[#4f9720]">
          {isProducer ? (
            <Sun className="h-6 w-6" />
          ) : (
            <UserRound className="h-6 w-6" />
          )}
        </div>

        <div>
          <h3 className="font-display text-xl font-black text-[#020711]">
            {isProducer
              ? "Je suis producteur solaire"
              : "Je cherche de l’énergie locale"}
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {isProducer
              ? "Proposez votre surplus solaire pour rejoindre une opération locale."
              : "Laissez vos coordonnées pour vérifier les possibilités autour de votre adresse."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nom et prénom"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <Field
          label="E-mail"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <Field
          label="Téléphone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
        />

        <Field
          label="Adresse"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="5 rue Basse"
          required
        />

        <Field
          label="Code postal"
          name="postalCode"
          value={form.postalCode}
          onChange={handleChange}
          placeholder="21430"
          required
        />

        <Field
          label="Ville"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Savilly"
          required
        />

        {isProducer ? (
          <>
            <Field
              label="Puissance installée (kWc)"
              name="installedPowerKwc"
              type="number"
              min="0.1"
              step="0.1"
              value={form.installedPowerKwc}
              onChange={handleChange}
              required
            />

            <Field
              label="Surplus annuel estimé (kWh)"
              name="estimatedSurplusKwh"
              type="number"
              min="0"
              step="1"
              value={form.estimatedSurplusKwh}
              onChange={handleChange}
            />
          </>
        ) : (
          <Field
            label="Consommation annuelle (kWh)"
            name="annualConsumptionKwh"
            type="number"
            min="0"
            step="1"
            value={form.annualConsumptionKwh}
            onChange={handleChange}
          />
        )}
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
        <input
          type="checkbox"
          name="consent"
          checked={form.consent}
          onChange={handleChange}
          className="mt-1 h-4 w-4 accent-[#17649e]"
        />

        <span>
          J’accepte que QEH énergies utilise ces informations pour étudier ma demande et me recontacter. Mes coordonnées exactes ne seront pas publiées sur la carte.
        </span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#17649e] px-6 font-black text-white transition hover:bg-[#0e527f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <Mail className="h-5 w-5" />
        )}

        {isSubmitting
          ? "Enregistrement..."
          : "Envoyer ma demande"}
      </button>
    </form>
  );
}

export default function QEHEnergies() {
  const [address, setAddress] = useState("");
  const [searchCenter, setSearchCenter] = useState(null);
  const [searchedAddress, setSearchedAddress] =
    useState("");
  const [producers, setProducers] = useState([]);
  const [isSearching, setIsSearching] =
    useState(false);
  const [isLoadingProducers, setIsLoadingProducers] =
    useState(true);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const previousTitle = document.title;

    document.title =
      "QEH énergies | Énergie solaire locale";
    document.body.classList.add("qeh-energies-site");

    return () => {
      document.title = previousTitle;
      document.body.classList.remove(
        "qeh-energies-site"
      );
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProducers() {
      const { data, error } = await supabase
        .from("solar_producers")
        .select(`
          id,
          public_name,
          city,
          latitude,
          longitude,
          installed_power_kwc,
          available_surplus_kwh
        `)
        .eq("is_active", true);

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(
          "Impossible de charger les producteurs :",
          error
        );
        setProducers([]);
      } else {
        setProducers(data || []);
      }

      setIsLoadingProducers(false);
    }

    loadProducers();

    return () => {
      isMounted = false;
    };
  }, []);

  const nearbyProducers = useMemo(() => {
    if (!searchCenter) {
      return [];
    }

    return [...REGISTERED_ZONES, ...producers]
      .map((producer) => ({
        ...producer,
        distance: distanceInMeters(
          searchCenter,
          {
            latitude: Number(producer.latitude),
            longitude: Number(producer.longitude),
          }
        ),
      }))
      .filter(
        (producer) =>
          producer.distance <= SEARCH_RADIUS_METERS
      )
      .sort(
        (firstProducer, secondProducer) =>
          firstProducer.distance - secondProducer.distance
      );
  }, [producers, searchCenter]);

  async function handleAddressSearch(event) {
    event.preventDefault();

    if (!address.trim()) {
      setSearchError(
        "Saisissez une adresse, un code postal et une ville."
      );
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const result = await geocodeAddress(address.trim());

      setSearchCenter({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setSearchedAddress(result.label);
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "Impossible de localiser cette adresse."
      );
    } finally {
      setIsSearching(false);
    }
  }

  const mapCenter = searchCenter
    ? [searchCenter.latitude, searchCenter.longitude]
    : DEFAULT_CENTER;

  return (
    <div
      id="qeh-energies-top"
      data-testid="qeh-energies-page"
      className="min-h-screen bg-[#f4f8fb] text-slate-950"
    >
      <style>{`
        body.qeh-energies-site #root header,
        body.qeh-energies-site #root footer {
          display: none !important;
        }
      `}</style>

      <div
        role="banner"
        className="sticky top-0 z-[1000] border-b border-[#17649e]/35 bg-[#020711]/95 text-white shadow-[0_12px_40px_rgba(2,7,17,0.24)] backdrop-blur-xl"
      >
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <a
              href="#qeh-energies-top"
              aria-label="Accueil QEH énergies"
              className="shrink-0"
            >
              <img
                src="/images/qeh-energies-logo.png"
                alt="QEH énergies"
                className="h-12 w-auto max-w-[150px] object-contain sm:h-14 sm:max-w-[190px]"
              />
            </a>

            <span className="hidden h-10 w-px bg-white/20 sm:block" />

            <Link
              to="/"
              aria-label="Revenir sur QEH OUTLET"
              className="hidden shrink-0 rounded-xl border border-white/10 bg-white/5 p-1.5 transition hover:border-[#17649e] sm:block"
            >
              <img
                src="/images/qeh-outlet-logo.jpg"
                alt="QEH OUTLET"
                className="h-9 w-auto max-w-[140px] object-contain"
              />
            </Link>
          </div>

          <nav
            aria-label="Navigation QEH énergies"
            className="hidden items-center gap-7 text-sm font-bold lg:flex"
          >
            <a
              href="#carte"
              className="text-slate-300 transition hover:text-[#82d246]"
            >
              Carte solaire
            </a>

            <a
              href="#fonctionnement"
              className="text-slate-300 transition hover:text-[#82d246]"
            >
              Comment ça marche
            </a>

            <a
              href="#participer"
              className="text-slate-300 transition hover:text-[#82d246]"
            >
              Participer
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#participer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#69b72d] px-5 text-sm font-black text-[#020711] transition hover:bg-[#7bcc3d]"
            >
              Rejoindre le réseau
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden bg-[#020711]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-40 top-0 h-[430px] w-[430px] rounded-full bg-[#17649e]/25 blur-3xl" />
          <div className="absolute -bottom-52 right-0 h-[480px] w-[480px] rounded-full bg-[#69b72d]/18 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(23,100,158,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(23,100,158,0.1)_1px,transparent_1px)] bg-[size:52px_52px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:py-20">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à QEH OUTLET
          </Link>

          <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div
              initial={{
                opacity: 0,
                x: -24,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.55,
              }}
              className="rounded-3xl border border-[#17649e]/55 bg-black/30 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
            >
              <img
                src="/images/qeh-energies-logo.png"
                alt="QEH énergies"
                className="h-auto w-full object-contain"
              />
            </motion.div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#69b72d]/40 bg-[#69b72d]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#82d246]">
                <Zap className="h-4 w-4" />
                Autoconsommation collective
              </div>

              <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                L’énergie solaire locale, à moins de{" "}
                <span className="text-[#82d246]">2 km</span>
                {" "}de chez vous.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                QEH énergies met en relation les producteurs solaires et les consommateurs d’un même secteur afin d’étudier une opération d’autoconsommation collective locale.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#carte"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#69b72d] px-6 font-black text-[#020711] transition hover:bg-[#7bcc3d]"
                >
                  Rechercher autour de moi
                  <LocateFixed className="h-5 w-5" />
                </a>

                <a
                  href="#participer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 font-bold text-white transition hover:border-[#17649e] hover:bg-[#17649e]/20"
                >
                  Participer au projet
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="carte"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20"
      >
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#4f9720]">
            Recherche locale
          </p>

          <h2 className="mt-3 font-display text-3xl font-black text-[#020711] sm:text-4xl">
            Trouvez les producteurs solaires proches de vous
          </h2>

          <p className="mt-4 leading-relaxed text-slate-600">
            Entrez votre adresse : la carte trace automatiquement un rayon de 2 km et n’affiche que les producteurs ayant accepté d’être référencés.
          </p>
        </div>

        <form
          onSubmit={handleAddressSearch}
          className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
        >
          <label className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#17649e]" />

            <input
              type="search"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              placeholder="Ex. 5 rue Basse, 21430 Savilly"
              aria-label="Votre adresse"
              className="min-h-12 w-full rounded-xl border border-transparent bg-slate-50 pl-12 pr-4 outline-none transition focus:border-[#17649e] focus:bg-white focus:ring-4 focus:ring-[#17649e]/10"
            />
          </label>

          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#17649e] px-6 font-black text-white transition hover:bg-[#0e527f] disabled:opacity-60"
          >
            {isSearching ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            Rechercher
          </button>
        </form>

        {searchError ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {searchError}
          </div>
        ) : null}

        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(2,7,20,0.1)] lg:grid-cols-[1fr_330px]">
          <div className="h-[440px] sm:h-[540px]">
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={13}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <RecenterMap
                center={mapCenter}
                zoom={searchCenter ? 14 : 13}
              />

              {REGISTERED_ZONES.map((zone) => (
                <React.Fragment key={zone.id}>
                  <Circle
                    center={[
                      zone.latitude,
                      zone.longitude,
                    ]}
                    radius={SEARCH_RADIUS_METERS}
                    pathOptions={{
                      color: "#69b72d",
                      fillColor: "#69b72d",
                      fillOpacity: 0.1,
                      weight: 2,
                    }}
                  />

                  <CircleMarker
                    center={[
                      zone.latitude,
                      zone.longitude,
                    ]}
                    radius={11}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor: "#69b72d",
                      fillOpacity: 1,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <strong>{zone.public_name}</strong>
                      <br />
                      {zone.address}
                      <br />
                      {zone.postal_code} {zone.city}
                      <br />
                      Rayon local : 2 km
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              ))}

              {searchCenter ? (
                <>
                  <Circle
                    center={mapCenter}
                    radius={SEARCH_RADIUS_METERS}
                    pathOptions={{
                      color: "#17649e",
                      fillColor: "#17649e",
                      fillOpacity: 0.1,
                      weight: 2,
                    }}
                  />

                  <CircleMarker
                    center={mapCenter}
                    radius={8}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor: "#17649e",
                      fillOpacity: 1,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      Point de recherche
                    </Popup>
                  </CircleMarker>
                </>
              ) : null}

              {nearbyProducers
                .filter(
                  (producer) =>
                    !producer.is_registered_zone
                )
                .map((producer) => (
                <CircleMarker
                  key={producer.id}
                  center={[
                    Number(producer.latitude),
                    Number(producer.longitude),
                  ]}
                  radius={10}
                  pathOptions={{
                    color: "#ffffff",
                    fillColor: "#69b72d",
                    fillOpacity: 1,
                    weight: 3,
                  }}
                >
                  <Popup>
                    <strong>
                      {producer.public_name ||
                        "Producteur solaire"}
                    </strong>
                    <br />
                    {producer.city}
                    <br />
                    {producer.installed_power_kwc
                      ? `${Number(
                          producer.installed_power_kwc
                        ).toLocaleString("fr-FR")} kWc`
                      : "Puissance non communiquée"}
                  </Popup>
                </CircleMarker>
                ))}
            </MapContainer>
          </div>

          <aside className="border-t border-slate-200 p-5 lg:border-l lg:border-t-0 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#69b72d]/12 text-[#4f9720]">
                <Sun className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Rayon analysé
                </p>
                <p className="font-display text-xl font-black text-[#020711]">
                  2 kilomètres
                </p>
              </div>
            </div>

            <div className="my-6 h-px bg-slate-200" />

            {!searchCenter ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                Saisissez votre adresse pour lancer la recherche autour de chez vous.
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-500">
                  Autour de
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {searchedAddress}
                </p>

                <div className="mt-5 rounded-2xl bg-[#17649e]/8 p-4">
                  <p className="font-display text-4xl font-black text-[#17649e]">
                    {isLoadingProducers
                      ? "…"
                      : nearbyProducers.length}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    producteur
                    {nearbyProducers.length > 1 ? "s" : ""}
                    {" "}référencé
                    {nearbyProducers.length > 1 ? "s" : ""}
                  </p>
                </div>

                {!isLoadingProducers &&
                nearbyProducers.length === 0 ? (
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    Aucun producteur n’est encore référencé dans ce rayon. Déposez votre demande : nous vous recontacterons par e-mail dès qu’une possibilité locale pourra être étudiée.
                  </p>
                ) : null}

                {nearbyProducers.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {nearbyProducers.map((producer) => (
                      <div
                        key={producer.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <p className="font-bold text-slate-950">
                          {producer.public_name ||
                            "Producteur solaire"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {producer.city} · environ{" "}
                          {Math.round(producer.distance)} m
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </aside>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#17649e]/15 bg-[#17649e]/5 p-4 text-sm leading-relaxed text-slate-600">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#17649e]" />
          Les points affichés sont volontairement approximatifs. Les adresses exactes et les coordonnées personnelles restent confidentielles.
        </div>
      </section>

      <section
        id="fonctionnement"
        className="scroll-mt-24 bg-[#020711] py-14 text-white sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 md:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: "Dans un rayon de 2 km",
              description:
                "La recherche mesure automatiquement la distance entre le lieu de consommation et les producteurs référencés.",
            },
            {
              icon: UsersRound,
              title: "Un projet collectif",
              description:
                "Producteurs et consommateurs sont réunis dans une opération locale encadrée par une personne morale organisatrice.",
            },
            {
              icon: Building2,
              title: "Une étude avant engagement",
              description:
                "QEH énergies vérifie la faisabilité technique, contractuelle et administrative avant toute proposition.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#69b72d]/15 text-[#82d246]">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 font-display text-xl font-black">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="participer"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20"
      >
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#4f9720]">
            Participer
          </p>

          <h2 className="mt-3 font-display text-3xl font-black text-[#020711] sm:text-4xl">
            Construisons le réseau solaire local
          </h2>

          <p className="mt-4 leading-relaxed text-slate-600">
            Inscrivez votre installation ou votre besoin. QEH énergies étudiera les possibilités et vous contactera directement.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RegistrationForm type="producer" />
          <RegistrationForm type="consumer" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <CircleHelp className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />

            <div>
              <h2 className="font-display text-lg font-black text-amber-950">
                Une étude de faisabilité, pas une promesse contractuelle
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
                La présence d’un producteur dans le rayon ne garantit pas automatiquement l’accès à son énergie. Une opération d’autoconsommation collective doit respecter les conditions techniques et réglementaires applicables, organiser les participants et être coordonnée avec le gestionnaire de réseau.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-900">
                <CheckCircle2 className="h-4 w-4" />
                Chaque dossier est vérifié avant mise en relation.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        role="contentinfo"
        className="border-t border-[#17649e]/30 bg-[#020711] text-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-slate-400 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/qeh-energies-logo.png"
              alt="QEH énergies"
              className="h-10 w-auto object-contain"
            />
            <span>Énergie solaire locale</span>
          </div>

          <Link
            to="/"
            className="font-bold text-slate-300 transition hover:text-white"
          >
            Revenir sur QEH OUTLET
          </Link>
        </div>
      </div>
    </div>
  );
}