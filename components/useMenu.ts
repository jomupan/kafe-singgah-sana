"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { MenuItem } from "@/lib/types";

// Loads the menu once and groups it by category, in the same order as the printed menu.
export function useMenu(onlyAvailable = true) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let query = supabase.from("menu_items").select("*").order("sort").order("name");
    if (onlyAvailable) query = query.eq("available", true);
    query.then(({ data, error }) => {
      if (error) setError(error.message);
      else setItems((data ?? []) as MenuItem[]);
      setLoading(false);
    });
  }, [onlyAvailable]);

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return { items, grouped, loading, error };
}