import { useCallback, useEffect, useState } from "react";
import type { Expense } from "../types";
import { fetchExpenses, addExpense as addExpenseToSheet, updateExpense as updateExpenseOnSheet } from "../services/sheets";
import { isSheetsConfigured } from "../config";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchExpenses();
      setExpenses(data);
      setIsDemo(!isSheetsConfigured());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addExpense = useCallback(
    async (name: string, amount: number, paidBy: string, participants: string[] = []) => {
      if (!isSheetsConfigured()) {
        const newExpense: Expense = {
          id: `local-${Date.now()}`,
          rowIndex: expenses.length,
          sheetRow: expenses.length + 2,
          name,
          amount,
          paidBy,
          date: new Date().toISOString().split("T")[0],
          participants: participants.length > 0 ? participants : undefined,
        };
        setExpenses((prev) => [...prev, newExpense]);
        return;
      }

      await addExpenseToSheet(name, amount, paidBy, participants);
      await load();
    },
    [load, expenses.length]
  );

  const updateExpense = useCallback(
    async (expense: Expense, name: string, amount: number) => {
      const oldName = expense.name;

      if (!isSheetsConfigured()) {
        setExpenses((prev) =>
          prev.map((e) => (e.id === expense.id ? { ...e, name, amount } : e))
        );
        return;
      }

      try {
        await updateExpenseOnSheet(expense.sheetRow, name, amount, oldName);
        setExpenses((prev) =>
          prev.map((e) => (e.id === expense.id ? { ...e, name, amount } : e))
        );
        await load({ silent: true });
      } catch (err) {
        await load({ silent: true });
        throw err;
      }
    },
    [load]
  );

  return { expenses, loading, error, isDemo, reload: load, addExpense, updateExpense };
}
