import { useCallback, useEffect, useState } from "react";
import type { ExpenseSplit } from "../types";
import { fetchSplits, saveSplit as saveSplitToSheet } from "../services/sheets";
import { isSheetsConfigured } from "../config";

const DEMO_STORAGE_KEY = "goa-expense-splits";

function loadDemoSplits(): ExpenseSplit[] {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExpenseSplit[];
  } catch {
    return [];
  }
}

function persistDemoSplits(splits: ExpenseSplit[]) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(splits));
}

export function useSplits() {
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      if (!isSheetsConfigured()) {
        setSplits(loadDemoSplits());
        setIsDemo(true);
      } else {
        const data = await fetchSplits();
        setSplits(data);
        setIsDemo(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load splits");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveSplit = useCallback(
    async (expenseName: string, personName: string, amount: number) => {
      if (!isSheetsConfigured()) {
        const expenseKey = expenseName.trim().toLowerCase();
        const personKey = personName.trim().toLowerCase();

        setSplits((prev) => {
          const next = prev.filter(
            (s) =>
              s.expenseName.trim().toLowerCase() !== expenseKey ||
              s.personName.trim().toLowerCase() !== personKey
          );

          if (amount > 0) {
            next.push({
              id: `local-${Date.now()}`,
              expenseName,
              personName,
              amount,
            });
          }

          persistDemoSplits(next);
          return next;
        });
        return;
      }

      await saveSplitToSheet(expenseName, personName, amount);
      await load();
    },
    [load]
  );

  const removeSplitsForExpense = useCallback((expenseName: string) => {
    const expenseKey = expenseName.trim().toLowerCase();
    setSplits((prev) => {
      const next = prev.filter(
        (s) => s.expenseName.trim().toLowerCase() !== expenseKey
      );
      if (!isSheetsConfigured()) {
        persistDemoSplits(next);
      }
      return next;
    });
  }, []);

  return { splits, loading, error, isDemo, reload: load, saveSplit, removeSplitsForExpense };
}
