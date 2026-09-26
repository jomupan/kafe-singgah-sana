"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useMenu } from "@/components/useMenu";
import { CAFE, rm } from "@/lib/config";
import type { MenuItem, OrderStatus } from "@/lib/types";

type Cart = Record<string, { item: MenuItem; qty: number }>;

const STATUS_TEXT: Record<OrderStatus, string> = {
  new: "Order received. The kitchen will start soon.",
  preparing: "Your food is being prepared.",
  served: "Served. Selamat menjamu selera!",
  cancelled: "This order was cancelled. Please ask our staff.",
};

export default function TableOrderPage() {
  const params = useParams<{ table: string }>();
  const table = Number(params.table);
  const validTable = Number.isInteger(table) && table >= 1 && table <= 100;

  const { grouped, loading, error } = useMenu();
  const [cart, setCart] = useState<Cart>({});
  const [note, setNote] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("new");

  // Check the order status every 10 seconds after ordering
  useEffect(() => {
    if (!orderId) return;
    const check = async () => {
      const { data } = await supabase.rpc("get_order_status", { p_order_id: orderId });
      if (data) setOrderStatus(data as OrderStatus);
    };
    check();
    const timer = setInterval(check, 10_000);
    return () => clearInterval(timer);
  }, [orderId]);

  const lines = Object.values(cart);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((sum, l) => sum + l.qty * Number(l.item.price), 0);

  function change(item: MenuItem, delta: number) {
    setCart((c) => {
      const qty = (c[item.id]?.qty ?? 0) + delta;
      const next = { ...c };
      if (qty <= 0) delete next[item.id];
      else next[item.id] = { item, qty: Math.min(qty, 20) };
      return next;
    });
  }

  async function placeOrder() {
    setSending(true);
    setSendError("");
    // The database function works out the prices itself,
    // so nobody can change prices from the browser.
    const { data, error } = await supabase.rpc("place_order", {
      p_table: table,
      p_note: note.trim() || null,
      p_items: lines.map((l) => ({ id: l.item.id, qty: l.qty })),
    });
    setSending(false);
    if (error) {
      setSendError(error.message || "Could not place order. Please ask our staff.");
      return;
    }
    setOrderId(data as string);
    setOrderStatus("new");
    setCart({});
    setNote("");
    setShowCart(false);
  }

  if (!validTable) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 text-center">
        <p>This QR code is not valid. Please ask our staff for help.</p>
      </main>
    );
  }

  // After ordering: status screen
  if (orderId) {
    const steps: OrderStatus[] = ["new", "preparing", "served"];
    const current = steps.indexOf(orderStatus);
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-12">
        <p className="text-sm text-amber-700">Table {table}</p>
        <h1 className="mt-1 text-2xl font-bold text-amber-900">Thank you!</h1>
        <p className="mt-2 text-stone-600">{STATUS_TEXT[orderStatus]}</p>

        {orderStatus !== "cancelled" && (
          <ol className="mt-8 space-y-4">
            {["Received", "Preparing", "Served"].map((label, i) => (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    i <= current ? "bg-amber-900 text-amber-50" : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={i <= current ? "font-semibold" : "text-stone-500"}>{label}</span>
              </li>
            ))}
          </ol>
        )}

        <p className="mt-8 text-sm text-stone-500">Please pay at the counter when you are done.</p>
        <button
          onClick={() => setOrderId(null)}
          className="mt-6 rounded-full border border-amber-900 py-3 font-semibold text-amber-900"
        >
          Order more
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 pb-32">
      <header className="sticky top-0 z-10 bg-amber-900 px-6 py-4 text-amber-50">
        <p className="text-xs uppercase tracking-widest text-amber-300">{CAFE.name}</p>
        <h1 className="text-xl font-bold">Table {table}</h1>
      </header>

      <div className="px-6 py-6">
        {loading && <p className="text-stone-500">Loading menu...</p>}
        {error && <p className="text-red-600">Could not load menu: {error}</p>}

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-700">{category}</h2>
            <ul className="divide-y divide-amber-100 rounded-2xl bg-white shadow-sm">
              {items.map((item) => {
                const qty = cart[item.id]?.qty ?? 0;
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-sm text-stone-500">{item.description}</p>}
                      <p className="mt-1 font-mono text-sm">{rm(item.price)}</p>
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => change(item, 1)}
                        className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-amber-50"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => change(item, -1)}
                          className="h-8 w-8 rounded-full bg-stone-200 font-bold"
                        >
                          −
                        </button>
                        <span className="w-4 text-center font-semibold">{qty}</span>
                        <button
                          onClick={() => change(item, 1)}
                          className="h-8 w-8 rounded-full bg-amber-900 font-bold text-amber-50"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* Bottom cart bar */}
      {count > 0 && !showCart && (
        <div className="fixed inset-x-0 bottom-0 p-4">
          <button
            onClick={() => setShowCart(true)}
            className="mx-auto flex w-full max-w-md items-center justify-between rounded-full bg-amber-900 px-6 py-4 font-semibold text-amber-50 shadow-lg"
          >
            <span>View cart ({count})</span>
            <span>{rm(total)}</span>
          </button>
        </div>
      )}

      {/* Cart sheet */}
      {showCart && (
        <div className="fixed inset-0 z-20 flex items-end bg-black/40" onClick={() => setShowCart(false)}>
          <div className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Your order · Table {table}</h2>
              <button onClick={() => setShowCart(false)} className="text-stone-500">
                Close
              </button>
            </div>
            <ul className="mt-4 space-y-2">
              {lines.map(({ item, qty }) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>
                    {qty} × {item.name}
                  </span>
                  <span className="font-mono">{rm(qty * Number(item.price))}</span>
                </li>
              ))}
            </ul>
            <textarea
              maxLength={300}
              rows={2}
              placeholder="Note for kitchen (e.g. kurang manis, no chili)"
              className="mt-4 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>{rm(total)}</span>
            </div>
            {sendError && <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{sendError}</p>}
            <button
              onClick={placeOrder}
              disabled={sending || count === 0}
              className="mt-4 w-full rounded-full bg-amber-900 py-4 font-semibold text-amber-50 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Place order"}
            </button>
            <p className="mt-2 text-center text-xs text-stone-500">Pay at the counter</p>
          </div>
        </div>
      )}
    </main>
  );
}
