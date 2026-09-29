"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CAFE, rm, todayMY, waNumber } from "@/lib/config";
import type { Reservation } from "@/lib/types";
import { useLive } from "./useLive";

const BADGE: Record<Reservation["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-stone-200 text-stone-500",
};

const STATUS_MY: Record<Reservation["status"], string> = {
  pending: "Menunggu",
  confirmed: "Disahkan",
  cancelled: "Dibatalkan",
};

export default function Reservations() {
  const [list, setList] = useState<Reservation[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    supabase
      .from("reservations")
      .select("*, reservation_items(qty, price, menu_items(name))")
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
    const when = r.date + " jam " + r.time.slice(0, 5);
    let msg: string;
    if (r.status === "cancelled") {
      msg = "Salam " + r.name + ", maaf, tempahan anda di " + CAFE.name + " pada " + when + " tidak dapat diterima.";
    } else {
      msg =
        "Salam " +
        r.name +
        ", tempahan meja untuk " +
        r.pax +
        " orang di " +
        CAFE.name +
        " pada " +
        when +
        " telah disahkan.";
      if (r.reservation_items.length > 0) {
        const food = r.reservation_items.map((it) => it.qty + " x " + (it.menu_items?.name ?? "Item")).join(", ");
        msg += " Order makanan: " + food + " (Jumlah " + rm(r.preorder_total ?? 0) + ", bayar di kaunter).";
      }
      msg += " Jumpa nanti!";
    }
    return "https://wa.me/" + waNumber(r.phone) + "?text=" + encodeURIComponent(msg);
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (list.length === 0) return <p className="text-stone-500">Tiada tempahan akan datang.</p>;

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
            {new Date(date + "T00:00:00").toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long" })}
            {date === todayMY() && <span className="ml-2 text-sm text-amber-700">Hari ini</span>}
          </h2>
          <div className="space-y-3">
            {rows.map((r) => (
              <article key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {r.time.slice(0, 5)} · {r.name} · {r.pax} orang
                    </p>
                    <p className="text-sm text-stone-500">{r.phone}</p>
                    {r.note && <p className="mt-1 text-sm italic">“{r.note}”</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={"rounded-full px-3 py-1 text-xs font-semibold " + BADGE[r.status]}>
                      {STATUS_MY[r.status]}
                    </span>
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => setStatus(r.id, "confirmed")}
                          className="rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Sahkan
                        </button>
                        <button onClick={() => setStatus(r.id, "cancelled")} className="text-xs text-red-600">
                          Tolak
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
                </div>

                {r.reservation_items.length > 0 && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
                      Order makanan
                    </p>
                    <ul className="space-y-0.5">
                      {r.reservation_items.map((it, i) => (
                        <li key={i} className="flex justify-between gap-3">
                          <span>
                            {it.qty} x {it.menu_items?.name ?? "Item"}
                          </span>
                          <span className="font-mono">{rm(it.qty * Number(it.price))}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 flex justify-between border-t border-amber-200 pt-1 font-semibold">
                      <span>Jumlah</span>
                      <span className="font-mono">{rm(r.preorder_total ?? 0)}</span>
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}