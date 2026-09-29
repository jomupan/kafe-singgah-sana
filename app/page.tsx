import Link from "next/link";
import Image from "next/image";
import MenuPreview from "@/components/MenuPreview";
import Gonjong from "@/components/Gonjong";
import { CAFE } from "@/lib/config";

export default function Home() {
  const whatsappLink = "https://wa.me/" + CAFE.whatsapp;

  return (
    <main className="flex-1 text-kayu">
      {/* Header */}
      <section className="px-6 py-10 sm:py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <p className="text-sm uppercase tracking-[0.3em] text-daun">Selamat datang ke</p>
            <h1 className="mt-2 font-serif text-5xl font-bold leading-tight sm:text-6xl">{CAFE.name}</h1>
            <p className="mt-4 font-serif text-xl italic text-kayu/80">{CAFE.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="rounded-full bg-kayu px-7 py-3 font-semibold text-kertas hover:bg-bata">
                Tempah Meja
              </Link>
              <Link
                href={whatsappLink}
                className="rounded-full border-2 border-kayu px-7 py-3 font-semibold hover:bg-kayu hover:text-kertas"
              >
                WhatsApp Kami
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <Image
              src="/hero.jpeg"
              alt="Singgah Sana Rembau"
              width={1179}
              height={1179}
              priority
              className="mx-auto h-auto w-full max-w-md rounded-2xl shadow-2xl ring-8 ring-kertas"
            />
          </div>
        </div>
      </section>

      <Gonjong />

      {/* Info */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-kayu/20 bg-kertas/95 p-6 shadow-lg sm:p-8">
          <h2 className="font-serif text-2xl font-bold">Maklumat Kedai</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-widest text-daun">Lokasi</dt>
              <dd className="mt-1 font-medium">Waze: {CAFE.wazeName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-daun">Waktu</dt>
              <dd className="mt-1 font-medium">{CAFE.hoursText}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-daun">Hari Buka</dt>
              <dd className="mt-1 font-medium">{CAFE.openDaysText}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-daun">Tempahan</dt>
              <dd className="mt-1 font-medium">{CAFE.bookingText}</dd>
            </div>
          </dl>
          <Link
            href={CAFE.wazeLink}
            className="mt-6 inline-block rounded-full bg-daun px-6 py-2 text-sm font-semibold text-kertas hover:bg-kayu"
          >
            Buka di Waze
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-kertas/95 p-5 shadow-sm">
            <p className="font-serif text-lg font-bold">Nak datang nanti?</p>
            <p className="mt-1 text-sm text-kayu/70">Tempah meja dulu, kami siapkan tempat untuk anda.</p>
          </div>
          <div className="rounded-2xl bg-kertas/95 p-5 shadow-sm">
            <p className="font-serif text-lg font-bold">Dah sampai?</p>
            <p className="mt-1 text-sm text-kayu/70">Imbas kod QR di meja untuk order terus dari telefon.</p>
          </div>
        </div>
      </section>

      <Gonjong />

      {/* Menu */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="mb-6 text-center font-serif text-4xl font-bold">Menu Kami</h2>
        <MenuPreview />
      </section>

      <footer className="mt-6 bg-kayu px-6 py-8 text-center text-sm text-kertas/80">
        <p className="font-serif text-lg text-kertas">{CAFE.name}</p>
        <p className="mt-1">{CAFE.address}</p>
      </footer>
    </main>
  );
}