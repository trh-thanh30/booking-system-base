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
        <div className="mb-3.5 break-all rounded-xl border-[1.5px] border-primary/30 bg-primary/5 p-4 font-mono text-[15px] font-semibold text-primary flex items-center">
          <span className="font-normal text-muted-foreground select-none">
            booking.link/
          </span>
          <input
            value={path}
            maxLength={30}
            onChange={(e) =>
              setPath(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
            }
            className="bg-transparent font-bold focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 flex-1 min-w-0 text-primary caret-primary"
          />
        </div>
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={copy}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition cursor-pointer select-none ${
              copied
                ? "border-success bg-success-bg text-success-surface-foreground"
                : "border-primary bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow active:scale-[0.98]"
            }`}
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "✓ Copied!" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => window.open(fullUrl, "_blank")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2.5 text-[13px] font-semibold text-foreground hover:border-primary hover:text-primary cursor-pointer transition active:scale-[0.98] shadow-sm hover:shadow"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open page
          </button>
        </div>
        <div className="rounded-lg border-l-[3px] border-warning bg-primary px-4 py-2.5 text-[12.5px] text-primary leading-relaxed">
          💡 Paste this link in your Instagram bio, embed it on your website, or
          print the QR code below for in-store checkout.
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Scan to book
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt="Booking QR Code"
          className="h-36 w-36 rounded-lg border border-border bg-surface p-1.5 shadow-sm"
        />
        <a
          href={qrSrc}
          download="booking-qr.png"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-[12px] font-semibold hover:border-primary hover:text-primary transition cursor-pointer text-foreground shadow-sm hover:shadow"
        >
          <Download className="h-3.5 w-3.5" />
          Download QR
        </a>
      </div>
    </div>
  );
}
