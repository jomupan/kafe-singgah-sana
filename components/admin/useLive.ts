"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Calls `onChange` whenever a row in `table` is added, updated or deleted.
export function useLive(table: string, onChange: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`live-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => onChange())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onChange]);
}
