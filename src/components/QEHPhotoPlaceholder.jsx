import React from "react";
import { ImagePlus } from "lucide-react";

export default function QEHPhotoPlaceholder({
  number,
  subject,
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`relative isolate flex h-full w-full items-center justify-center overflow-hidden bg-[#06101f] px-6 text-center text-white ${className}`}
      role="img"
      aria-label={`Photo ${number} à fournir : ${subject}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(23,100,158,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(23,100,158,0.16)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#17649e]/25 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#69b72d]/20 blur-3xl" />

      <div className="relative max-w-md">
        <div
          className={`mx-auto grid place-items-center rounded-2xl border border-[#82d246]/30 bg-[#69b72d]/10 text-[#9ce565] ${
            compact ? "h-10 w-10" : "h-14 w-14"
          }`}
        >
          <ImagePlus className={compact ? "h-5 w-5" : "h-7 w-7"} />
        </div>
        <p
          className={`font-display font-black uppercase tracking-[0.18em] text-[#82d246] ${
            compact ? "mt-3 text-[10px]" : "mt-5 text-xs"
          }`}
        >
          Photo {number} à fournir
        </p>
        <p
          className={`mx-auto mt-2 leading-relaxed text-slate-300 ${
            compact ? "text-xs" : "text-sm sm:text-base"
          }`}
        >
          {subject}
        </p>
      </div>
    </div>
  );
}
