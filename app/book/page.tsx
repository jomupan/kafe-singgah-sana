"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Gonjong from "@/components/Gonjong";
import { useMenu } from "@/components/useMenu";
import { CAFE, isBookingDay, rm, timeSlots, todayMY } from "@/lib/config";

// Today's date only exists in the browser (the page itself is pre-built),
// so read it with useSyncExternalStore to avoid a hydration mismatch.
const noop = () => () => {};
function useToday() {
  return useSyncExternalStore(noop, todayMY, () => "");
}

// Current time in Malaysia as "HH:MM"
function nowMY() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

// "2026-10-01" -> "Khamis, 1 Oktober"
function tarikhMelayu(date: string) {
  if (!date) return "";
  return new Date(date + "T00:00:00").toLocaleDateString("ms-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const input =
  "w-full rounded-xl border border-kayu/30 bg-white/80 px-4 py-3 text-kayu outline-none focus:border-kayu focus:ring-2 focus:ring-kayu/20";

export default function BookPage() {
  const today = useToday();
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", pax: 2, note: "" });
  const date = form.date || today;
  const isToday = date !== "" && date === today;
  const dayOk = date === "" || isBookingDay(date);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  // Food: order at the cafe, or pre-order now
  const [mode, setMode] = useState<"kedai" | "pra">("kedai");
  const [cart, setCart] = useState<Record<string, number>>({});
  const { items, grouped, loading: menuLoading } = useMenu();
  const lines = items.filter((i) => cart[i.id]).map((i) => ({ item: i, qty: cart[i.id] }));
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((sum, l) => sum + l.qty * Number(l.item.price), 0);

  function change(id: string, delta: number) {
    setCart((c) => {
      const qty = Math.min((c[id] ?? 0) + delta, 20);
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  const update = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 12) {
      setError("Sila masukkan nombor telefon yang betul, contoh 012-345 6789.");
      return;
    }
    if (!isBookingDay(date)) {
      setError("Tempahan hanya untuk Isnin, Selasa, Khamis dan Jumaat. Rabu tutup.");
      return;
    }
    if (!form.time) {
      setError("Sila pilih masa.");
      return;
    }
    if (isToday && form.time <= nowMY()) {
      setError("Masa itu sudah lepas. Sila pilih masa lain.");
      return;
    }
    if (mode === "pra" && count === 0) {
      setError("Sila pilih sekurang-kurangnya satu makanan, atau pilih Order di kedai.");
      return;
    }

    setStatus("sending");
    // book_table() checks every rule in the database and reads prices from the menu itself.
    const { error } = await supabase.rpc("book_table", {
      p_name: form.name.trim(),
      p_phone: form.phone.trim(),
      p_date: date,
      p_time: form.time,
      p_pax: form.pax,
      p_note: form.note.trim() || null,
      p_items: mode === "pra" ? lines.map((l) => ({ id: l.item.id, qty: l.qty })) : [],
    });

    if (error) {
      setStatus("error");
      setError("Maaf, tempahan tidak dapat dihantar: " + error.message);
      console.error(error);
    } else {
      setStatus("done");
    }
  }

  if (status === "done") {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-kayu">
        <div className="w-full max-w-md rounded-2xl bg-kertas/95 p-8 text-center shadow-xl">
          <Gonjong />
          <h1 className="mt-4 font-serif text-3xl font-bold">Tempahan diterima!</h1>
          <p className="mt-3 text-kayu/80">
            Terima kasih {form.name.split(" ")[0]}. Kami akan WhatsApp anda di {form.phone} untuk sahkan meja untuk{" "}
            {form.pax} orang pada {tarikhMelayu(date)}, jam {form.time}.
          </p>
          {mode === "pra" && count > 0 && (
            <div className="mt-6 rounded-xl bg-white/70 p-4 text-left text-sm">
              <p className="mb-2 font-semibold">Order makanan</p>
              <ul className="space-y-1">
                {lines.map((l) => (
                  <li key={l.item.id} className="flex justify-between gap-3">
                    <span>
                      {l.qty} x {l.item.name}
                    </span>
                    <span className="font-mono">{rm(l.qty * Number(l.item.price))}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex justify-between border-t border-kayu/20 pt-2 font-semibold">
                <span>Jumlah</span>
                <span className="font-mono">{rm(total)}</span>
              </p>
              <p className="mt-2 text-xs text-kayu/60">Bayaran di kaunter.</p>
            </div>
          )}
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-kayu px-7 py-3 font-semibold text-kertas hover:bg-bata"
          >
            Kembali ke laman utama
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-10 text-kayu">
      <div className="mx-auto w-full max-w-lg">
        <Link href="/" className="text-sm font-medium text-kayu/70 hover:text-kayu">
          ← {CAFE.name}
        </Link>

        <div className="mt-4 rounded-2xl bg-kertas/95 p-6 shadow-xl sm:p-8">
          <h1 className="font-serif text-4xl font-bold">Tempah Meja</h1>
          <p className="mt-2 text-kayu/70">
            Tempahan untuk hari bekerja sahaja (Rabu tutup). Kami akan sahkan melalui WhatsApp.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Nama</span>
              <input
                required
                maxLength={80}
                className={input}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">No. Telefon (WhatsApp)</span>
              <input
                required
                type="tel"
                inputMode="tel"
                placeholder="012-345 6789"
                className={input}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Tarikh</span>
                <input
                  required
                  type="date"
                  min={today}
                  className={input}
                  value={date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Bilangan</span>
                <select className={input} value={form.pax} onChange={(e) => update("pax", Number(e.target.value))}>
                  {Array.from({ length: CAFE.maxPax }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} orang
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {date && (
              <p className={"text-sm " + (dayOk ? "text-daun" : "font-semibold text-bata")}>
                {tarikhMelayu(date)}
                {dayOk ? " · boleh tempah" : " · tidak boleh tempah pada hari ini"}
              </p>
            )}

            <div>
              <span className="mb-2 block text-sm font-semibold">Masa</span>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots().map((t) => {
                  const past = isToday && t <= nowMY();
                  return (
                    <button
                      type="button"
                      key={t}
                      disabled={past || !dayOk}
                      onClick={() => update("time", t)}
                      className={
                        "rounded-lg border py-2 text-sm disabled:cursor-not-allowed disabled:opacity-30 " +
                        (form.time === t
                          ? "border-kayu bg-kayu text-kertas"
                          : "border-kayu/30 bg-white/80 hover:border-kayu")
                      }
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-semibold">Makanan</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "kedai" as const, title: "Order di kedai", desc: "Pilih makanan bila sampai" },
                  { key: "pra" as const, title: "Order makanan sekarang", desc: "Makanan siap bila anda sampai" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => setMode(opt.key)}
                    className={
                      "rounded-xl border p-3 text-left " +
                      (mode === opt.key
                        ? "border-kayu bg-kayu text-kertas"
                        : "border-kayu/30 bg-white/80 hover:border-kayu")
                    }
                  >
                    <span className="block text-sm font-semibold">{opt.title}</span>
                    <span className={"block text-xs " + (mode === opt.key ? "text-kertas/70" : "text-kayu/60")}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>

              {mode === "pra" && (
                <div className="mt-4 space-y-2">
                  <p className="rounded-lg bg-daun/10 px-4 py-3 text-xs text-daun">
                    Makanan akan disediakan selepas tempahan disahkan melalui WhatsApp. Bayaran di kaunter.
                  </p>
                  {menuLoading && <p className="text-sm text-kayu/60">Sedang memuatkan menu...</p>}
                  {Object.entries(grouped).map(([category, list]) => {
                    const inCat = list.reduce((n, i) => n + (cart[i.id] ?? 0), 0);
                    return (
                      <details key={category} className="rounded-xl border border-kayu/20 bg-white/70">
                        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-semibold">
                          <span>{category}</span>
                          {inCat > 0 && (
                            <span className="rounded-full bg-kayu px-2 py-0.5 text-xs text-kertas">{inCat}</span>
                          )}
                        </summary>
                        <ul className="divide-y divide-kayu/10 border-t border-kayu/10">
                          {list.map((item) => {
                            const qty = cart[item.id] ?? 0;
                            return (
                              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2">
                                <div>
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="font-mono text-xs text-kayu/60">{rm(item.price)}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  {qty > 0 && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => change(item.id, -1)}
                                        className="h-8 w-8 rounded-full bg-kayu/10 font-bold"
                                      >
                                        −
                                      </button>
                                      <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => change(item.id, 1)}
                                    className="h-8 w-8 rounded-full bg-kayu font-bold text-kertas"
                                  >
                                    +
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    );
                  })}

                  {count > 0 && (
                    <div className="rounded-xl bg-kayu p-4 text-sm text-kertas">
                      <ul className="space-y-1">
                        {lines.map((l) => (
                          <li key={l.item.id} className="flex justify-between gap-3">
                            <span>
                              {l.qty} x {l.item.name}
                            </span>
                            <span className="font-mono">{rm(l.qty * Number(l.item.price))}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 flex justify-between border-t border-kertas/20 pt-2 font-semibold">
                        <span>Jumlah order</span>
                        <span className="font-mono">{rm(total)}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Nota (jika ada)</span>
              <textarea
                maxLength={300}
                rows={2}
                placeholder="Hari jadi, kerusi bayi, dll."
                className={input}
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
              />
            </label>

            {error && <p className="rounded-lg bg-bata/10 px-4 py-3 text-sm font-medium text-bata">{error}</p>}

            <button
              disabled={status === "sending"}
              className="w-full rounded-full bg-kayu py-4 font-semibold text-kertas hover:bg-bata disabled:opacity-50"
            >
              {status === "sending"
                ? "Sedang dihantar..."
                : mode === "pra" && count > 0
                  ? "Sahkan Tempahan · " + rm(total)
                  : "Sahkan Tempahan"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}