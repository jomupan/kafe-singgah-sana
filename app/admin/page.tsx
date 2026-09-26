"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { CAFE } from "@/lib/config";
import Orders from "@/components/admin/Orders";
import Reservations from "@/components/admin/Reservations";
import MenuManager from "@/components/admin/MenuManager";
import QrCodes from "@/components/admin/QrCodes";

const TABS = ["Orders", "Reservations", "Menu", "QR codes"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [staffCheck, setStaffCheck] = useState<{ userId: string; ok: boolean } | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("Orders");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Being logged in is not enough: the account must also be in the staff table.
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    supabase.rpc("is_staff").then(({ data }) => setStaffCheck({ userId, ok: Boolean(data) }));
  }, [userId]);
  const isStaff = staffCheck && staffCheck.userId === userId ? staffCheck.ok : null;

  if (checking) return <main className="p-8">Loading...</main>;
  if (!session) return <Login />;
  if (isStaff === null) return <main className="p-8">Checking access...</main>;

  if (!isStaff) {
    return (
      <main className="mx-auto max-w-sm p-8 text-center">
        <p>This account ({session.user.email}) is not registered as staff.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 underline">
          Log out
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <header className="bg-amber-900 px-6 py-4 text-amber-50 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-300">Staff</p>
            <h1 className="text-lg font-bold">{CAFE.name}</h1>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-amber-200 hover:text-white">
            Log out
          </button>
        </div>
        <nav className="mx-auto mt-4 flex max-w-5xl gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                tab === t ? "bg-amber-50 text-amber-900" : "text-amber-100 hover:bg-amber-800"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {tab === "Orders" && <Orders />}
        {tab === "Reservations" && <Reservations />}
        {tab === "Menu" && <MenuManager />}
        {tab === "QR codes" && <QrCodes />}
      </div>
    </main>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError("Wrong email or password.");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-amber-900">Staff login</h1>
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Password"
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-full bg-amber-900 py-3 font-semibold text-amber-50 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}
