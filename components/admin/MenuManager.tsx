"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rm } from "@/lib/config";
import type { MenuItem } from "@/lib/types";

const empty = { id: "", name: "", category: "", price: "", description: "" };
const input = "w-full rounded-xl border border-stone-300 px-3 py-2 text-sm";

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    supabase
      .from("menu_items")
      .select("*")
      .order("category")
      .order("name")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setItems((data ?? []) as MenuItem[]);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const row = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      description: form.description.trim() || null,
    };
    const { error } = form.id
      ? await supabase.from("menu_items").update(row).eq("id", form.id)
      : await supabase.from("menu_items").insert(row);
    if (error) setError(error.message);
    else {
      setForm(empty);
      load();
    }
  }

  async function toggle(item: MenuItem) {
    await supabase.from("menu_items").update({ available: !item.available }).eq("id", item.id);
    load();
  }

  async function remove(item: MenuItem) {
    if (!window.confirm(`Delete ${item.name}? Tip: use "Hide" instead if it is only sold out.`)) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
    if (error) setError("Cannot delete an item that already has orders. Hide it instead.");
    load();
  }

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm ${item.available ? "" : "opacity-50"}`}
          >
            <div>
              <p className="font-medium">
                {item.name} <span className="text-xs text-stone-400">· {item.category}</span>
              </p>
              <p className="font-mono text-sm">{rm(item.price)}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => toggle(item)} className="text-amber-800">
                {item.available ? "Hide" : "Show"}
              </button>
              <button
                onClick={() =>
                  setForm({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    price: String(item.price),
                    description: item.description ?? "",
                  })
                }
                className="text-amber-800"
              >
                Edit
              </button>
              <button onClick={() => remove(item)} className="text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={save} className="h-fit space-y-3 rounded-2xl bg-white p-5 shadow-sm md:sticky md:top-6">
        <h2 className="font-semibold">{form.id ? "Edit item" : "Add item"}</h2>
        <input
          required
          placeholder="Name"
          className={input}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          list="categories"
          placeholder="Category (e.g. Minuman)"
          className={input}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <datalist id="categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <input
          required
          type="number"
          step="0.10"
          min="0"
          placeholder="Price (RM)"
          className={input}
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <textarea
          rows={2}
          placeholder="Short description (optional)"
          className={input}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button className="flex-1 rounded-full bg-amber-900 py-2 text-sm font-semibold text-amber-50">
            {form.id ? "Save changes" : "Add to menu"}
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(empty)} className="rounded-full border px-4 text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
