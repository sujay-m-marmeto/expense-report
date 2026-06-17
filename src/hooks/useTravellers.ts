import { useCallback, useEffect, useState } from "react";
import type { Traveller } from "../types";
import { fetchTravellers } from "../services/sheets";
import { isSheetsConfigured } from "../config";

export function useTravellers() {
  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTravellers();
      setTravellers(data);
      setIsDemo(!isSheetsConfigured());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load travellers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { travellers, loading, error, isDemo, reload: load };
}
