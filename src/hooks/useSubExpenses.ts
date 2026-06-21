import { useCallback, useEffect, useState } from "react";
import type { SubExpense } from "../types";
import {
  fetchSubExpenses,
  addSubExpense as addSubExpenseToSheet,
  deleteSubExpense as deleteSubExpenseOnSheet,
} from "../services/sheets";
import { isSheetsConfigured } from "../config";

const DEMO_STORAGE_KEY = "goa-sub-expenses";

function loadDemoSubExpenses(): SubExpense[] {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SubExpense[];
  } catch {
    return [];
  }
}

function persistDemoSubExpenses(subExpenses: SubExpense[]) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(subExpenses));
}

export function useSubExpenses() {
  const [subExpenses, setSubExpenses] = useState<SubExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSheetsConfigured()) {
        setSubExpenses(loadDemoSubExpenses());
        setIsDemo(true);
      } else {
        const data = await fetchSubExpenses();
        setSubExpenses(data);
        setIsDemo(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sub-expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addSubExpense = useCallback(
    async (
      parentExpenseName: string,
      name: string,
      amount: number,
      participants: string[] = []
    ) => {
      if (!isSheetsConfigured()) {
        const newSub: SubExpense = {
          id: `local-sub-${Date.now()}`,
          sheetRow: Date.now(),
          parentExpenseName,
          name,
          amount,
          participants: participants.length > 0 ? participants : undefined,
        };
        setSubExpenses((prev) => {
          const next = [...prev, newSub];
          persistDemoSubExpenses(next);
          return next;
        });
        return;
      }

      await addSubExpenseToSheet(parentExpenseName, name, amount, participants);
      await load();
    },
    [load]
  );

  const deleteSubExpense = useCallback(
    async (sub: SubExpense) => {
      if (!isSheetsConfigured()) {
        setSubExpenses((prev) => {
          const next = prev.filter((s) => s.id !== sub.id);
          persistDemoSubExpenses(next);
          return next;
        });
        return;
      }

      await deleteSubExpenseOnSheet(sub.sheetRow);
      await load();
    },
    [load]
  );

  const renameParent = useCallback(
    async (oldName: string, newName: string) => {
      const oldKey = oldName.trim().toLowerCase();
      if (!isSheetsConfigured()) {
        setSubExpenses((prev) => {
          const next = prev.map((s) =>
            s.parentExpenseName.trim().toLowerCase() === oldKey
              ? { ...s, parentExpenseName: newName }
              : s
          );
          persistDemoSubExpenses(next);
          return next;
        });
        return;
      }
      // Sheet rename is handled by updateExpense in Apps Script
    },
    []
  );

  return {
    subExpenses,
    loading,
    error,
    isDemo,
    reload: load,
    addSubExpense,
    deleteSubExpense,
    renameParent,
  };
}
