import { useCallback, useEffect, useState } from "react";
import type { Expense } from "../types";
import { fetchExpenses, addExpense as addExpenseToSheet, updateExpense as updateExpenseOnSheet } from "../services/sheets";
import { isSheetsConfigured } from "../config";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses();
      setExpenses(data);
      setIsDemo(!isSheetsConfigured());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addExpense = useCallback(
    async (name: string, amount: number, paidBy: string) => {
      if (isDemo) {
        const newExpense: Expense = {
          id: `local-${Date.now()}`,
          rowIndex: expenses.length,
          name,
          amount,
          paidBy,
          date: new Date().toISOString().split("T")[0],
        };
        setExpenses((prev) => [...prev, newExpense]);
        return;
      }

      await addExpenseToSheet(name, amount, paidBy);
      await load();
    },
    [isDemo, load, expenses.length]
  );

  const updateExpense = useCallback(
    async (rowIndex: number, name: string, amount: number) => {
      if (isDemo) {
        setExpenses((prev) =>
          prev.map((e) =>
            e.rowIndex === rowIndex ? { ...e, name, amount } : e
          )
        );
        return;
      }

      await updateExpenseOnSheet(rowIndex, name, amount);
      await load();
    },
    [isDemo, load]
  );

  return { expenses, loading, error, isDemo, reload: load, addExpense, updateExpense };
}
