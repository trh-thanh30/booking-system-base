"use client";

import { useState } from "react";
import { Copy, ExternalLink, Download } from "lucide-react";

export function PanelShare() {
  const [path, setPath] = useState("glow-salon");
  const [copied, setCopied] = useState(false);
  const fullUrl = `https://booking.link/${path}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid grid-cols-1 items-center gap-7 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="mb-3.5 break-all rounded-xl border-[1.5px] border-brand-blue/30 bg-brand-blue/5 p-4 font-mono text-[15px] font-semibold text-brand-blue flex items-center">
          <span className="font-normal text-text-muted select-none">
            booking.link/
          </span>
          <input
            value={path}
            maxLength={30}
            onChange={(e) =>
              setPath(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
            }
            className="bg-transparent font-bold outline-none flex-1 min-w-0 text-brand-blue caret-brand-blue"
          />
        </div>
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={copy}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition cursor-pointer select-none ${
              copied
                ? "border-success bg-success-bg text-emerald-700"
                : "border-brand-blue bg-brand-blue text-white hover:bg-brand-blue-hover shadow-sm hover:shadow active:scale-[0.98]"
            }`}
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "✓ Copied!" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => window.open(fullUrl, "_blank")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-light bg-bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary hover:border-brand-blue hover:text-brand-blue cursor-pointer transition active:scale-[0.98] shadow-sm hover:shadow"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open page
          </button>
        </div>
        <div className="rounded-lg border-l-[3px] border-warning bg-[#fef3c7] px-4 py-2.5 text-[12.5px] text-[#92400e] leading-relaxed">
          💡 Paste this link in your Instagram bio, embed it on your website, or
          print the QR code below for in-store checkout.
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-light bg-bg-primary p-5 text-center shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted">
          Scan to book
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt="Booking QR Code"
          className="h-36 w-36 rounded-lg border border-border-light bg-white p-1.5 shadow-sm"
        />
        <a
          href={qrSrc}
          download="booking-qr.png"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border-light bg-bg-primary px-4 py-2 text-[12px] font-semibold hover:border-brand-blue hover:text-brand-blue transition cursor-pointer text-text-primary shadow-sm hover:shadow"
        >
          <Download className="h-3.5 w-3.5" />
          Download QR
        </a>
      </div>
    </div>
  );
}
