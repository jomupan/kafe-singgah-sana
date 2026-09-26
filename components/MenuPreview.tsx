"use client";

import { useMenu } from "./useMenu";
import { rm } from "@/lib/config";

export default function MenuPreview() {
  const { grouped, loading, error } = useMenu();

  if (loading) return <p className="text-stone-500">Loading menu...</p>;
  if (error) return <p className="text-red-600">Could not load menu: {error}</p>;
  if (Object.keys(grouped).length === 0) return <p className="text-stone-500">Menu coming soon.</p>;

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-700">{category}</h3>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.description && <p className="text-sm text-stone-500">{item.description}</p>}
                </div>
                <span className="shrink-0 font-mono text-sm">{rm(item.price)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
