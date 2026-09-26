import Link from "next/link";
import MenuPreview from "@/components/MenuPreview";
import { CAFE } from "@/lib/config";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-amber-900 px-6 py-16 text-amber-50">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-amber-300">Selamat datang ke</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{CAFE.name}</h1>
          <p className="mt-3 text-lg text-amber-100">{CAFE.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-amber-950 hover:bg-amber-300"
            >
              Book a table
            </Link>
            <a
              href={`https://wa.me/${CAFE.whatsapp}`}
              className="rounded-full border border-amber-300 px-6 py-3 font-semibold hover:bg-amber-800"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto grid max-w-3xl gap-4 px-6 py-10 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="font-semibold">Coming later?</p>
          <p className="mt-1 text-sm text-stone-600">Book a table in advance and we will keep it ready for you.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="font-semibold">Already here?</p>
          <p className="mt-1 text-sm text-stone-600">
            Scan the QR code on your table to order straight from your phone.
          </p>
        </div>
      </section>

      {/* Menu */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-6 text-2xl font-bold text-amber-900">Menu</h2>
        <MenuPreview />
      </section>

      <footer className="border-t border-amber-200 px-6 py-6 text-center text-sm text-stone-500">
        {CAFE.name} · {CAFE.address}
      </footer>
    </main>
  );
}
