"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CAFE, timeSlots, todayMY } from "@/lib/config";

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

const input =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200";

export default function BookPage() {
  const today = useToday();
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", pax: 2, note: "" });
  const date = form.date || today;
  const isToday = date !== "" && date === today;
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const update = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 12) {
      setError("Please enter a valid phone number, e.g. 012-345 6789.");
      return;
    }
    if (!form.time) {
      setError("Please choose a time.");
      return;
    }

    if (isToday && form.time <= nowMY()) {
      setError("That time has already passed. Please choose a later time.");
      return;
    }

    setStatus("sending");
    // No .select() after insert: customers are allowed to create a booking but not read bookings back.
    const { error } = await supabase.from("reservations").insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      date,
      time: form.time,
      pax: form.pax,
      note: form.note.trim() || null,
    });

    if (error) {
      setStatus("error");
      setError("Sorry, we could not save your booking. Please try again or WhatsApp us.");
      console.error(error);
    } else {
      setStatus("done");
    }
  }

  if (status === "done") {
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="text-5xl">✓</div>
        <h1 className="mt-4 text-2xl font-bold text-amber-900">Booking received!</h1>
        <p className="mt-2 text-stone-600">
          Thanks {form.name.split(" ")[0]}. We will WhatsApp you at {form.phone} to confirm your table for {form.pax} on{" "}
          {date} at {form.time}.
        </p>
        <Link href="/" className="mt-8 rounded-full bg-amber-900 px-6 py-3 font-semibold text-amber-50">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
      <Link href="/" className="text-sm text-amber-800">
        ← {CAFE.name}
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-amber-900">Book a table</h1>
      <p className="mt-1 text-stone-600">We will confirm your booking through WhatsApp.</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Name</span>
          <input
            required
            maxLength={80}
            className={input}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Phone (WhatsApp)</span>
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
            <span className="mb-1 block text-sm font-medium">Date</span>
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
            <span className="mb-1 block text-sm font-medium">People</span>
            <select className={input} value={form.pax} onChange={(e) => update("pax", Number(e.target.value))}>
              {Array.from({ length: CAFE.maxPax }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "person" : "people"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium">Time</span>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots().map((t) => {
              const past = isToday && t <= nowMY();
              return (
                <button
                  type="button"
                  key={t}
                  disabled={past}
                  onClick={() => update("time", t)}
                  className={`rounded-lg border py-2 text-sm disabled:cursor-not-allowed disabled:opacity-30 ${
                    form.time === t
                      ? "border-amber-900 bg-amber-900 text-amber-50"
                      : "border-stone-300 bg-white hover:border-amber-600"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Note (optional)</span>
          <textarea
            maxLength={300}
            rows={2}
            placeholder="Birthday, baby chair, etc."
            className={input}
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
          />
        </label>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          disabled={status === "sending"}
          className="w-full rounded-full bg-amber-900 py-4 font-semibold text-amber-50 hover:bg-amber-800 disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Confirm booking"}
        </button>
      </form>
    </main>
  );
}
