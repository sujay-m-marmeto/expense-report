import { useCallback, useEffect, useState } from "react";
import type { Expense } from "../types";
import { fetchExpenses, addExpense as addExpenseToSheet, updateExpense as updateExpenseOnSheet, deleteExpense as deleteExpenseOnSheet } from "../services/sheets";
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
    async (
      expense: Expense,
      name: string,
      amount: number,
      participants: string[] = []
    ) => {
      const oldName = expense.name;
      const participantList = participants.length > 0 ? participants : undefined;

      if (!isSheetsConfigured()) {
        setExpenses((prev) =>
          prev.map((e) =>
            e.id === expense.id ? { ...e, name, amount, participants: participantList } : e
          )
        );
        return;
      }

      try {
        await updateExpenseOnSheet(
          expense.sheetRow,
          name,
          amount,
          oldName,
          participants
        );
        setExpenses((prev) =>
          prev.map((e) =>
            e.id === expense.id ? { ...e, name, amount, participants: participantList } : e
          )
        );
        await load({ silent: true });
      } catch (err) {
        await load({ silent: true });
        throw err;
      }
    },
    [load]
  );

  const deleteExpense = useCallback(
    async (expense: Expense) => {
      if (!isSheetsConfigured()) {
        setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
        return;
      }

      try {
        await deleteExpenseOnSheet(expense.sheetRow);
        setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
        await load({ silent: true });
      } catch (err) {
        await load({ silent: true });
        throw err;
      }
    },
    [load]
  );

  return { expenses, loading, error, isDemo, reload: load, addExpense, updateExpense, deleteExpense };
}
