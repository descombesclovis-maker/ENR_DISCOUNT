import React, { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CheckCircle2, LoaderCircle, MapPin, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

const DEFAULT_CENTER = [46.603354, 1.888334];
const MONDIAL_RELAY_LOGO = "/images/mondial-relay-logo.svg";

function createRelayIcon(selected = false) {
  const size = selected ? 54 : 46;
  const badgeSize = selected ? 46 : 38;
  const borderColor = selected ? "#0b5ca8" : "#e40087";
  const glow = selected
    ? "0 0 0 5px rgba(11,92,168,.16),0 8px 20px rgba(2,7,20,.28)"
    : "0 7px 18px rgba(2,7,20,.24)";

  return L.divIcon({
    className: selected ? "qeh-relay-marker-selected" : "qeh-relay-marker",
    html: `
      <div style="width:${size}px;height:${size + 8}px;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 2px rgba(0,0,0,.08));">
        <div style="width:${badgeSize}px;height:${badgeSize}px;border-radius:14px;background:#fff;border:3px solid ${borderColor};box-shadow:${glow};display:flex;align-items:center;justify-content:center;overflow:hidden;padding:4px;box-sizing:border-box;">
          <img src="${MONDIAL_RELAY_LOGO}" alt="Mondial Relay" style="display:block;width:100%;height:100%;object-fit:contain;" />
        </div>
        <div style="width:11px;height:11px;background:#fff;border-right:3px solid ${borderColor};border-bottom:3px solid ${borderColor};transform:translateY(-5px) rotate(45deg);box-sizing:border-box;"></div>
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 4],
    popupAnchor: [0, -(size - 3)],
  });
}

const relayIcon = createRelayIcon(false);
const selectedRelayIcon = createRelayIcon(true);

function FitRelayPoints({ points }) {
  const map = useMap();

  useEffect(() => {
    const coordinates = points
      .filter(
        (point) =>
          Number.isFinite(Number(point.latitude)) &&
          Number.isFinite(Number(point.longitude)),
      )
      .map((point) => [Number(point.latitude), Number(point.longitude)]);

    if (coordinates.length === 1) {
      map.setView(coordinates[0], 14);
      return;
    }

    if (coordinates.length > 1) {
      map.fitBounds(L.latLngBounds(coordinates), {
        padding: [35, 35],
        maxZoom: 15,
      });
    }
  }, [map, points]);

  return null;
}

function distanceLabel(value) {
  const meters = Number(value);
  if (!Number.isFinite(meters)) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

function relayAddress(point) {
  return [point.address, [point.postalCode, point.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

export default function MondialRelayPicker({
  active,
  destination,
  selectedPoint,
  onSelect,
}) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSearch = Boolean(
    destination?.postalCode?.trim() && destination?.city?.trim(),
  );

  const searchKey = useMemo(
    () =>
      [
        destination?.country,
        destination?.addressLine1,
        destination?.postalCode,
        destination?.city,
      ].join("|"),
    [destination],
  );

  const loadPoints = async () => {
    if (!active || !canSearch) return;

    setLoading(true);
    setErrorMessage("");
    onSelect(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "boxtal-relay-points",
        {
          body: {
            country: destination.country || "FR",
            address: destination.addressLine1 || "",
            postalCode: destination.postalCode,
            city: destination.city,
            limit: 20,
          },
        },
      );

      if (error) throw error;
      if (data?.success === false) {
        throw new Error(data?.error || "Impossible de rechercher les Points Relais.");
      }

      const relayPoints = Array.isArray(data?.relayPoints)
        ? data.relayPoints.filter((point) => point?.code)
        : [];

      setPoints(relayPoints);

      if (relayPoints.length === 0) {
        setErrorMessage(
          "Aucun Point Relais Mondial Relay n’a été trouvé autour de cette adresse.",
        );
      }
    } catch (error) {
      console.error("Recherche Mondial Relay impossible :", error);
      setPoints([]);
      setErrorMessage(
        error?.message || "Impossible de charger les Points Relais Mondial Relay.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!active) {
      setPoints([]);
      setErrorMessage("");
      return;
    }

    if (canSearch) {
      loadPoints();
    }
    // searchKey déclenche une nouvelle recherche lorsque l'adresse change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, canSearch, searchKey]);

  if (!active) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#0b5ca8]/25 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-slate-950">Choisissez votre Point Relais®</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Sélectionnez le commerce ou locker Mondial Relay où vous souhaitez retirer votre commande.
            </p>
          </div>
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5a00]" />
        </div>
      </div>

      {!canSearch ? (
        <div className="p-4 text-sm text-slate-600">
          Renseignez le code postal et la ville pour afficher les Points Relais disponibles.
        </div>
      ) : loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 p-6 text-sm font-semibold text-slate-600">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#0b5ca8]" />
          Recherche des Points Relais…
        </div>
      ) : errorMessage ? (
        <div className="p-4">
          <p className="text-sm leading-relaxed text-amber-800">{errorMessage}</p>
          <button
            type="button"
            onClick={loadPoints}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#0b5ca8] hover:text-[#0b5ca8]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Réessayer
          </button>
        </div>
      ) : (
        <>
          <div className="h-[310px] w-full border-b border-slate-200">
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={6}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitRelayPoints points={points} />
              {points.map((point) => {
                const latitude = Number(point.latitude);
                const longitude = Number(point.longitude);
                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                  return null;
                }

                const isSelected = selectedPoint?.code === point.code;

                return (
                  <Marker
                    key={point.code}
                    position={[latitude, longitude]}
                    icon={isSelected ? selectedRelayIcon : relayIcon}
                    eventHandlers={{ click: () => onSelect(point) }}
                  >
                    <Popup>
                      <div style={{ minWidth: 190 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                          <img
                            src={MONDIAL_RELAY_LOGO}
                            alt="Mondial Relay"
                            style={{ width: 34, height: 34, objectFit: "contain" }}
                          />
                          <strong>{point.name || "Point Relais"}</strong>
                        </div>
                        <div style={{ marginTop: 5 }}>{relayAddress(point)}</div>
                        {distanceLabel(point.distanceMeters) && (
                          <div style={{ marginTop: 5 }}>
                            À {distanceLabel(point.distanceMeters)}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelect(point)}
                          style={{
                            marginTop: 10,
                            border: 0,
                            borderRadius: 999,
                            padding: "7px 12px",
                            background: "#0b5ca8",
                            color: "white",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Choisir ce relais
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <div className="max-h-[320px] space-y-2 overflow-y-auto p-3">
            {points.map((point) => {
              const isSelected = selectedPoint?.code === point.code;
              return (
                <button
                  key={point.code}
                  type="button"
                  onClick={() => onSelect(point)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? "border-[#0b5ca8] bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-[#0b5ca8]/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-white p-1 ${
                        isSelected ? "border-[#0b5ca8]" : "border-[#e40087]/40"
                      }`}
                    >
                      <img
                        src={MONDIAL_RELAY_LOGO}
                        alt="Mondial Relay"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-950">
                          {point.name || "Point Relais"}
                        </p>
                        {distanceLabel(point.distanceMeters) && (
                          <span className="shrink-0 text-xs font-bold text-[#ff5a00]">
                            {distanceLabel(point.distanceMeters)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {relayAddress(point)}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Point {point.code}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {selectedPoint && (
        <div className="border-t border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-start gap-2 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <span className="font-black">Point Relais sélectionné : </span>
              <span>{selectedPoint.name}</span>
              <div className="mt-0.5 text-xs text-emerald-800">
                {relayAddress(selectedPoint)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
