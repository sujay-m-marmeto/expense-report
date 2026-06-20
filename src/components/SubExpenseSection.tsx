import { useState } from "react";
import type { Expense, SubExpense } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Button } from "./Button";
import { Input } from "./Input";

interface SubExpenseSectionProps {
  expense: Expense;
  onAdd: (parentName: string, name: string, amount: number) => Promise<void>;
  onDelete: (sub: SubExpense) => Promise<void>;
}

export function SubExpenseSection({ expense, onAdd, onDelete }: SubExpenseSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const subs = expense.subExpenses ?? [];
  const hasSubs = subs.length > 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!name.trim()) {
      setError("Enter a name for this item");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      await onAdd(expense.name, name.trim(), parsedAmount);
      setName("");
      setAmount("");
      setShowForm(false);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sub: SubExpense) => {
    setDeletingId(sub.id);
    try {
      await onDelete(sub);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-3 border-t border-lavender-100/80 pt-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={expanded}
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-lavender-500/80">
          {hasSubs ? `Breakdown (${subs.length} items)` : "Add breakdown"}
        </span>
        <span className="text-sm text-lavender-600">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {subs.length > 0 && (
            <ul className="space-y-1.5" aria-label={`Sub-expenses for ${expense.name}`}>
              {subs.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-lavender-50/80 px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm text-lavender-800">{sub.name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-lavender-900">
                      {formatCurrency(sub.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(sub)}
                      disabled={deletingId === sub.id}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-50"
                      aria-label={`Remove ${sub.name}`}
                    >
                      {deletingId === sub.id ? "…" : "✕"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {hasSubs && (
            <p className="text-xs font-medium text-lavender-600/80">
              Sub-total: {formatCurrency(expense.amount)}
            </p>
          )}

          {showForm ? (
            <form onSubmit={handleAdd} className="space-y-2 rounded-xl border border-lavender-200 bg-white p-3">
              <Input
                label="Item name"
                placeholder="e.g. Flight ticket, Baggage..."
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
              />
              {error && (
                <p className="text-xs font-medium text-red-600" role="alert">{error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add item"}
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="text-sm font-medium text-lavender-600 hover:text-lavender-800"
            >
              + Add item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
