import { useState } from "react";
import type { Expense } from "../types";
import { Button } from "./Button";
import { Input } from "./Input";

interface EditExpenseModalProps {
  expense: Expense;
  onClose: () => void;
  onSubmit: (expense: Expense, name: string, amount: number) => Promise<void>;
}

export function EditExpenseModal({
  expense,
  onClose,
  onSubmit,
}: EditExpenseModalProps) {
  const hasSubExpenses = expense.hasSubExpenses ?? false;
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(String(expense.amount));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = hasSubExpenses ? expense.amount : parseFloat(amount);
    if (!name.trim()) {
      setError("Please enter an expense name");
      return;
    }
    if (!hasSubExpenses && (!parsedAmount || parsedAmount <= 0)) {
      setError("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(expense, name.trim(), parsedAmount);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-expense-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-lavender-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:m-4 safe-area-bottom">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="edit-expense-title" className="text-lg font-bold text-lavender-900">
            Edit Expense
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lavender-500 hover:bg-lavender-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Expense Name"
            placeholder="e.g. Dinner, Hotel, Taxi..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Input
            label="Amount (₹)"
            type="number"
            inputMode="decimal"
            placeholder="0"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={hasSubExpenses}
          />

          {hasSubExpenses && (
            <p className="text-xs text-lavender-600/70">
              Amount is calculated from breakdown items. Edit or remove items on the expense card.
            </p>
          )}

          <p className="text-xs text-lavender-600/70">
            Paid by <span className="font-medium text-lavender-700">{expense.paidBy}</span>
          </p>

          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={onClose} type="button">
              Cancel
            </Button>
            <Button fullWidth type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
