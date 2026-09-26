"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CAFE } from "@/lib/config";

export default function QrCodes() {
  const [tables, setTables] = useState(CAFE.tables);
  // Default to the address this site is running on (e.g. your Vercel URL)
  const [baseUrl, setBaseUrl] = useState(() => window.location.origin);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-5 shadow-sm print:hidden">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Number of tables</span>
          <input
            type="number"
            min={1}
            max={100}
            value={tables}
            onChange={(e) => setTables(Math.max(1, Math.min(100, Number(e.target.value))))}
            className="w-24 rounded-xl border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="min-w-64 flex-1 text-sm">
          <span className="mb-1 block font-medium">Website address</span>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value.replace(/\/$/, ""))}
            className="w-full rounded-xl border border-stone-300 px-3 py-2"
          />
        </label>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-amber-900 px-5 py-2 text-sm font-semibold text-amber-50"
        >
          Print
        </button>
        {baseUrl.includes("localhost") && (
          <p className="w-full text-sm text-amber-700">
            Tip: localhost only works on this Mac. Deploy to Vercel first, then print the QR codes with your real URL.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3">
        {Array.from({ length: tables }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className="flex break-inside-avoid flex-col items-center rounded-2xl border-2 border-amber-900 bg-white p-4 text-center"
          >
            <p className="text-xs uppercase tracking-widest text-amber-700">{CAFE.name}</p>
            <p className="mb-3 text-2xl font-bold text-amber-900">Table {n}</p>
            <QRCodeSVG value={`${baseUrl}/t/${n}`} size={140} marginSize={1} />
            <p className="mt-3 text-xs text-stone-600">Scan to order</p>
          </div>
        ))}
      </div>
    </div>
  );
}
