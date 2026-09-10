import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import MondialRelayPicker from "./MondialRelayPicker";

const STORAGE_KEY = "qeh_selected_mondial_relay";
const ACTIVE_KEY = "qeh_mondial_relay_active";
const PORTAL_ID = "qeh-mondial-relay-portal";

function readInput(placeholder) {
  const element = Array.from(document.querySelectorAll("input")).find(
    (input) => input.getAttribute("placeholder") === placeholder,
  );
  return element?.value ?? "";
}

function readSelectValue() {
  const select = Array.from(document.querySelectorAll("select")).find((element) =>
    Array.from(element.options || []).some(
      (option) => option.value === "particulier" || option.value === "entreprise",
    ),
  );
  return select?.value ?? "particulier";
}

function readDestination() {
  return {
    name: readInput("Nom et prénom *"),
    company: readInput("Nom de l’entreprise *"),
    email: readInput("E-mail *"),
    phone: readInput("Téléphone *"),
    type: readSelectValue(),
    country: "FR",
    addressLine1: readInput("Adresse *"),
    addressLine2: readInput("Complément d’adresse"),
    postalCode: readInput("Code postal *"),
    city: readInput("Ville *"),
  };
}

function findMondialRelayButton() {
  return Array.from(document.querySelectorAll("aside button")).find((button) =>
    /MONDIAL\s*RELAY/i.test(button.textContent || ""),
  );
}

function isOfferSelected(button) {
  if (!button) return false;
  return (
    button.className.includes("border-[#0b5ca8]") &&
    button.className.includes("bg-blue-50")
  );
}

function getOrCreatePortalHost(button) {
  let host = document.getElementById(PORTAL_ID);

  if (!host) {
    host = document.createElement("div");
    host.id = PORTAL_ID;
  }

  if (button?.parentNode && host.previousSibling !== button) {
    button.insertAdjacentElement("afterend", host);
  }

  return host;
}

function findCheckoutButton() {
  return document.querySelector('[data-testid="checkout-button"]');
}

export default function MondialRelayPortal() {
  const [host, setHost] = useState(null);
  const [active, setActive] = useState(false);
  const [destination, setDestination] = useState(readDestination);
  const [selectedPoint, setSelectedPoint] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const destinationKey = useMemo(
    () =>
      [
        destination.country,
        destination.addressLine1,
        destination.postalCode,
        destination.city,
      ].join("|"),
    [destination],
  );

  useEffect(() => {
    let frame = null;

    const sync = () => {
      const button = findMondialRelayButton();
      const selected = isOfferSelected(button);
      const nextDestination = readDestination();

      setDestination((current) => {
        const currentSerialized = JSON.stringify(current);
        const nextSerialized = JSON.stringify(nextDestination);
        return currentSerialized === nextSerialized ? current : nextDestination;
      });

      if (button && selected) {
        const portalHost = getOrCreatePortalHost(button);
        setHost(portalHost);
        setActive(true);
        sessionStorage.setItem(ACTIVE_KEY, "1");
      } else {
        setActive(false);
        sessionStorage.removeItem(ACTIVE_KEY);
      }

      frame = window.requestAnimationFrame(sync);
    };

    frame = window.requestAnimationFrame(sync);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      sessionStorage.removeItem(ACTIVE_KEY);
    };
  }, []);

  useEffect(() => {
    if (!active) {
      const checkoutButton = findCheckoutButton();
      if (checkoutButton) {
        checkoutButton.dataset.relayBlocked = "0";
      }
      return;
    }

    setSelectedPoint((current) => {
      if (!current) return null;

      const storedSearchKey = current.__searchKey;
      if (storedSearchKey && storedSearchKey !== destinationKey) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return current;
    });
  }, [active, destinationKey]);

  useEffect(() => {
    const checkoutButton = findCheckoutButton();
    if (!checkoutButton) return;

    if (active && !selectedPoint) {
      checkoutButton.disabled = true;
      checkoutButton.dataset.relayBlocked = "1";
      checkoutButton.title = "Choisissez votre Point Relais Mondial Relay avant de payer.";
    } else if (checkoutButton.dataset.relayBlocked === "1") {
      checkoutButton.disabled = false;
      checkoutButton.dataset.relayBlocked = "0";
      checkoutButton.removeAttribute("title");
    }
  }, [active, selectedPoint]);

  const handleSelect = (point) => {
    if (!point) {
      setSelectedPoint(null);
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    const normalizedPoint = {
      ...point,
      __searchKey: destinationKey,
    };

    setSelectedPoint(normalizedPoint);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedPoint));
  };

  if (!host || !active) return null;

  return createPortal(
    <MondialRelayPicker
      active={active}
      destination={destination}
      selectedPoint={selectedPoint}
      onSelect={handleSelect}
    />,
    host,
  );
}
