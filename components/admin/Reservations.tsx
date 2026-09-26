"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CAFE, todayMY, waNumber } from "@/lib/config";
import type { Reservation } from "@/lib/types";
import { useLive } from "./useLive";

const BADGE: Record<Reservation["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-stone-200 text-stone-500",
};

export default function Reservations() {
  const [list, setList] = useState<Reservation[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    supabase
      .from("reservations")
      .select("*")
      .gte("date", todayMY())
      .order("date")
      .order("time")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setList((data ?? []) as Reservation[]);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useLive("reservations", load);

  async function setStatus(id: string, status: Reservation["status"]) {
    await supabase.from("reservations").update({ status }).eq("id", id);
    load();
  }

  function whatsappLink(r: Reservation) {
    const msg =
      r.status === "cancelled"
        ? `Hi ${r.name}, sorry, we cannot take your booking at ${CAFE.name} on ${r.date} at ${r.time.slice(0, 5)}.`
        : `Hi ${r.name}, your table for ${r.pax} at ${CAFE.name} on ${r.date} at ${r.time.slice(0, 5)} is confirmed. See you!`;
    return `https://wa.me/${waNumber(r.phone)}?text=${encodeURIComponent(msg)}`;
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (list.length === 0) return <p className="text-stone-500">No upcoming bookings.</p>;

  // Group by date
  const byDate = list.reduce<Record<string, Reservation[]>>((acc, r) => {
    (acc[r.date] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(byDate).map(([date, rows]) => (
        <section key={date}>
          <h2 className="mb-3 font-semibold">
            {new Date(date + "T00:00:00").toLocaleDateString("en-MY", {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
            {date === todayMY() && <span className="ml-2 text-sm text-amber-700">Today</span>}
          </h2>
          <div className="space-y-3">
            {rows.map((r) => (
              <article
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold">
                    {r.time.slice(0, 5)} · {r.name} · {r.pax} pax
                  </p>
                  <p className="text-sm text-stone-500">{r.phone}</p>
                  {r.note && <p className="mt-1 text-sm italic">“{r.note}”</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE[r.status]}`}>{r.status}</span>
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => setStatus(r.id, "confirmed")}
                        className="rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Confirm
                      </button>
                      <button onClick={() => setStatus(r.id, "cancelled")} className="text-xs text-red-600">
                        Decline
                      </button>
                    </>
                  )}
                  {r.status !== "pending" && (
                    <a
                      href={whatsappLink(r)}
                      target="_blank"
                      className="rounded-full border border-green-700 px-3 py-1 text-xs font-semibold text-green-700"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
