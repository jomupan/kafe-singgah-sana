"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rm, todayMY } from "@/lib/config";
import type { Order, OrderStatus } from "@/lib/types";
import { useLive } from "./useLive";

const COLUMNS: { status: OrderStatus; title: string; next?: OrderStatus; action?: string }[] = [
  { status: "new", title: "New", next: "preparing", action: "Start preparing" },
  { status: "preparing", title: "Preparing", next: "served", action: "Mark served" },
  { status: "served", title: "Served today" },
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    // Orders created since midnight Malaysia time
    const since = new Date(`${todayMY()}T00:00:00+08:00`).toISOString();
    supabase
      .from("orders")
      .select("*, order_items(qty, price, menu_items(name))")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setOrders((data ?? []) as Order[]);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useLive("orders", load);

  async function setStatus(id: string, status: OrderStatus) {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  }

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const list = orders.filter((o) => o.status === col.status);
        return (
          <section key={col.status}>
            <h2 className="mb-3 font-semibold">
              {col.title} <span className="text-stone-400">({list.length})</span>
            </h2>
            <div className="space-y-3">
              {list.length === 0 && <p className="text-sm text-stone-400">Nothing here.</p>}
              {list.map((o) => (
                <article key={o.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-amber-900 px-3 py-1 text-sm font-bold text-amber-50">
                      Table {o.table_number}
                    </span>
                    <span className="text-xs text-stone-500">
                      {new Date(o.created_at).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {o.order_items.map((it, i) => (
                      <li key={i}>
                        {it.qty} × {it.menu_items?.name ?? "Item removed"}
                      </li>
                    ))}
                  </ul>
                  {o.note && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm italic">“{o.note}”</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold">{rm(o.total)}</span>
                    <div className="flex gap-2">
                      {col.status !== "served" && (
                        <button onClick={() => setStatus(o.id, "cancelled")} className="text-xs text-red-600">
                          Cancel
                        </button>
                      )}
                      {col.next && (
                        <button
                          onClick={() => setStatus(o.id, col.next!)}
                          className="rounded-full bg-amber-900 px-3 py-1 text-xs font-semibold text-amber-50"
                        >
                          {col.action}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
