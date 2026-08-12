import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
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
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabase";

const SEARCH_RADIUS_METERS = 2000;
const DEFAULT_CENTER = [47.184494, 4.27971];

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
  const firstLatitude = degreesToRadians(firstPoint.latitude);
  const secondLatitude = degreesToRadians(secondPoint.latitude);

  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
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

  const [longitude, latitude] = feature.geometry.coordinates;

  return {
    latitude,
    longitude,
    label: feature.properties.label,
  };
}

function RecenterMap({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.1 });
  }, [center, map, zoom]);

  return null;
}

function ProducerButton({ fullWidth = false }) {
  return (
    <div
      className={`group relative ${fullWidth ? "mt-5 w-full" : ""}`}
    >
      <span className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#8f641b] via-[#f2cf79] to-[#c99532] opacity-45 blur-md animate-pulse transition group-hover:opacity-75" />

      <Link
        to="/qeh-partner/production"
        className={`relative isolate inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#f2cf79]/70 bg-gradient-to-r from-[#8f641b] via-[#c99532] to-[#f2cf79] px-6 font-black text-[#020711] shadow-[0_12px_34px_rgba(201,149,50,0.3)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_18px_45px_rgba(242,207,121,0.42)] active:translate-y-0 ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <span className="qeh-producer-shine pointer-events-none absolute inset-y-[-40%] left-[-35%] w-1/4 rotate-12 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm" />
        <span className="pointer-events-none absolute left-3 top-2 h-1.5 w-1.5 rounded-full bg-white animate-ping" />
        <span className="pointer-events-none absolute bottom-2 right-5 h-1 w-1 rounded-full bg-white/90 animate-ping [animation-delay:700ms]" />

        <Sparkles className="relative h-5 w-5 transition duration-500 group-hover:rotate-12 group-hover:scale-110" />
        <span className="relative">Devenir producteur</span>
        <Sun className="relative h-5 w-5 animate-[spin_7s_linear_infinite] transition group-hover:scale-110" />
      </Link>
    </div>
  );
}

export default function QEHEnergiesCarte() {
  const [address, setAddress] = useState("");
  const [searchCenter, setSearchCenter] = useState(null);
  const [searchedAddress, setSearchedAddress] = useState("");
  const [producers, setProducers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingProducers, setIsLoadingProducers] = useState(true);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    document.title = "Carte solaire | QEH Énergies";
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

      if (!isMounted) return;

      if (error) {
        console.error("Impossible de charger les producteurs :", error);
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
    if (!searchCenter) return [];

    return [...REGISTERED_ZONES, ...producers]
      .map((producer) => ({
        ...producer,
        distance: distanceInMeters(searchCenter, {
          latitude: Number(producer.latitude),
          longitude: Number(producer.longitude),
        }),
      }))
      .filter((producer) => producer.distance <= SEARCH_RADIUS_METERS)
      .sort((first, second) => first.distance - second.distance);
  }, [producers, searchCenter]);

  async function handleAddressSearch(event) {
    event.preventDefault();

    if (!address.trim()) {
      setSearchError("Saisissez une adresse, un code postal et une ville.");
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
    <div data-testid="qeh-energies-carte-page">
      <style>{`
        @keyframes qehProducerShine {
          0% { left: -35%; opacity: 0; }
          15% { opacity: 1; }
          55% { left: 115%; opacity: 1; }
          70%, 100% { left: 115%; opacity: 0; }
        }

        .qeh-producer-shine {
          animation: qehProducerShine 2.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .qeh-producer-shine { animation: none; }
        }
      `}</style>
      <section className="relative overflow-hidden bg-[#020711] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-0 h-[430px] w-[430px] rounded-full bg-[#17649e]/25 blur-3xl" />
          <div className="absolute -bottom-52 right-0 h-[480px] w-[480px] rounded-full bg-[#69b72d]/18 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(23,100,158,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(23,100,158,0.1)_1px,transparent_1px)] bg-[size:52px_52px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#69b72d]/40 bg-[#69b72d]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#82d246]">
              <LocateFixed className="h-4 w-4" />
              Carte solaire locale
            </div>

            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
              Trouvez l’énergie solaire à moins de{" "}
              <span className="text-[#82d246]">2 km</span> de chez vous.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Entrez votre adresse pour visualiser les zones solaires et les producteurs référencés autour de vous.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#recherche-carte"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#69b72d] px-6 font-black text-[#020711] transition hover:bg-[#82d246]"
              >
                Lancer ma recherche
                <Search className="h-5 w-5" />
              </a>

              <Link
                to="/qeh-energies/comment-ca-marche"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 font-bold transition hover:border-[#17649e] hover:bg-[#17649e]/20"
              >
                Comprendre le fonctionnement
                <ArrowRight className="h-5 w-5" />
              </Link>

              <ProducerButton />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="group relative min-h-[330px] overflow-hidden rounded-3xl border border-[#17649e]/55 bg-black/30 shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
          >
            <img
              src="/images/qeh-energies/realisations/qeh-maison-solaire.webp"
              alt="Maison équipée d’une installation photovoltaïque"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020711] via-[#020711]/15 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-[#020711]/80 p-5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#69b72d]/20 text-[#82d246]">
                  <Sun className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-xl font-black">Rayon automatique</p>
                  <p className="mt-1 text-sm text-slate-300">2 000 mètres autour de l’adresse recherchée</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="recherche-carte"
        className="mx-auto max-w-7xl scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20"
      >
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#4f9720]">
            Recherche locale
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-[#020711] sm:text-4xl">
            Carte des zones solaires QEH Énergies
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            La carte trace un disque transparent de 2 km autour de chaque zone enregistrée. Les coordonnées exactes restent confidentielles.
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
              onChange={(event) => setAddress(event.target.value)}
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

              <RecenterMap center={mapCenter} zoom={searchCenter ? 14 : 13} />

              {REGISTERED_ZONES.map((zone) => (
                <Circle
                  key={zone.id}
                  center={[zone.latitude, zone.longitude]}
                  radius={SEARCH_RADIUS_METERS}
                  pathOptions={{
                    color: "#59a923",
                    fillColor: "#69b72d",
                    fillOpacity: 0.22,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <strong>{zone.public_name}</strong>
                    <br />
                    {zone.address}
                    <br />
                    {zone.postal_code} {zone.city}
                    <br />
                    Zone locale : rayon de 2 km
                  </Popup>
                </Circle>
              ))}

              {searchCenter ? (
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
              ) : null}

              {nearbyProducers
                .filter((producer) => !producer.is_registered_zone)
                .map((producer) => (
                  <CircleMarker
                    key={producer.id}
                    center={[
                      Number(producer.latitude),
                      Number(producer.longitude),
                    ]}
                    radius={9}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor: "#69b72d",
                      fillOpacity: 1,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <strong>{producer.public_name || "Producteur solaire"}</strong>
                      <br />
                      {producer.city}
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>
          </div>

          <aside className="border-t border-slate-200 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#69b72d]/12 text-[#4f9720]">
                <Sun className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Rayon analysé</p>
                <p className="font-display text-xl font-black text-[#020711]">
                  2 kilomètres
                </p>
              </div>
            </div>

            <div className="my-6 h-px bg-slate-200" />

            {!searchCenter ? (
              <>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                  Saisissez votre adresse pour lancer la recherche autour de chez vous.
                </div>

                <ProducerButton fullWidth />
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-500">Autour de</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {searchedAddress}
                </p>

                <div className="mt-5 rounded-2xl bg-[#17649e]/[0.08] p-4">
                  <p className="font-display text-4xl font-black text-[#17649e]">
                    {isLoadingProducers ? "…" : nearbyProducers.length}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    zone{nearbyProducers.length > 1 ? "s" : ""} ou producteur
                    {nearbyProducers.length > 1 ? "s" : ""} référencé
                    {nearbyProducers.length > 1 ? "s" : ""}
                  </p>
                </div>

                {!isLoadingProducers && nearbyProducers.length === 0 ? (
                  <div className="mt-4">
                    <p className="text-sm leading-relaxed text-slate-600">
                      Aucun producteur n’est encore référencé dans ce rayon.
                    </p>
                    <Link
                      to="/qeh-energies/participer"
                      className="mt-4 inline-flex items-center gap-2 font-bold text-[#17649e]"
                    >
                      Être recontacté
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : null}

                {nearbyProducers.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {nearbyProducers.map((producer) => (
                      <div
                        key={producer.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <p className="font-bold text-slate-950">
                          {producer.public_name || "Producteur solaire"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {producer.city} · environ {Math.round(producer.distance)} m
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
          Les points des producteurs sont volontairement approximatifs. Les adresses exactes et les coordonnées personnelles restent confidentielles.
        </div>
      </section>

      <section className="bg-[#020711] py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-[#82d246]">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-black uppercase tracking-[0.18em]">
                Une possibilité près de chez vous ?
              </span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-black">
              Déposez votre demande en quelques minutes.
            </h2>
          </div>
          <Link
            to="/qeh-energies/participer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#69b72d] px-6 font-black text-[#020711] transition hover:bg-[#82d246]"
          >
            Participer
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}