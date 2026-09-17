import React, { useCallback, useEffect, useRef, useState } from "react";

const INTRO_SESSION_KEY = "qeh_intro_seen_v1";
const INTRO_FALLBACK_MS = 5000;
const FADE_MS = 320;

export default function QEHIntro() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const finishedRef = useRef(false);
  const closeTimerRef = useRef(null);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      // sessionStorage may be unavailable in strict privacy modes.
    }

    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, FADE_MS);
  }, []);

  useEffect(() => {
    let alreadySeen = false;

    try {
      alreadySeen = sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      finishedRef.current = true;
      setVisible(false);
      return undefined;
    }

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reducedMotion) {
      finish();
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const fallbackTimer = window.setTimeout(finish, INTRO_FALLBACK_MS);

    return () => {
      window.clearTimeout(fallbackTimer);
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      document.body.style.overflow = previousOverflow;
    };
  }, [finish]);

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      onClick={finish}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100dvh",
        minHeight: "100svh",
        zIndex: 2147483647,
        overflow: "hidden",
        background: "#06131f",
        opacity: closing ? 0 : 1,
        pointerEvents: closing ? "none" : "auto",
        transition: `opacity ${FADE_MS}ms cubic-bezier(.22,.61,.36,1)`,
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        style={{
          position: "absolute",
          inset: "-3px",
          width: "calc(100% + 6px)",
          height: "calc(100% + 6px)",
          display: "block",
          objectFit: "cover",
          objectPosition: "center center",
          background: "#06131f",
          transform: "translateZ(0)",
        }}
      >
        <source src="/videos/qeh-outlet-intro.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
