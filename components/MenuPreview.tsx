"use client";

import { useMenu } from "./useMenu";
import { rm } from "@/lib/config";

// Menu styled like an old kedai kopi wooden board.
export default function MenuPreview() {
  const { grouped, loading, error } = useMenu();

  return (
    <div className="papan rounded-2xl border-4 border-[#2a1a0e] p-6 text-kertas shadow-2xl sm:p-10">
      {loading && <p className="text-kertas/70">Sedang memuatkan menu...</p>}
      {error && <p className="text-red-300">Menu tidak dapat dimuatkan: {error}</p>}
      {!loading && !error && Object.keys(grouped).length === 0 && <p className="text-kertas/70">Menu akan datang.</p>}

      <div className="grid gap-10 sm:grid-cols-2">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h3 className="mb-4 border-b border-kertas/30 pb-2 font-serif text-xl italic text-[#e9c98f]">{category}</h3>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="mb-1 flex-1 border-b-2 border-dotted border-kertas/40" />
                    <span className="font-mono text-sm">{rm(item.price)}</span>
                  </div>
                  {item.description && <p className="text-sm text-kertas/60">{item.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}