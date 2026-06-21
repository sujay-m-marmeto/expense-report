import { useState } from "react";
import type { Expense } from "../types";
import { Button } from "./Button";
import { Input } from "./Input";
import { ParticipantPicker, resolveParticipantSelection } from "./ParticipantPicker";

interface EditExpenseModalProps {
  expense: Expense;
  travellers: string[];
  onClose: () => void;
  onSubmit: (
    expense: Expense,
    name: string,
    amount: number,
    participants: string[]
  ) => Promise<void>;
  onDelete: (expense: Expense) => Promise<void>;
}

export function EditExpenseModal({
  expense,
  travellers,
  onClose,
  onSubmit,
  onDelete,
}: EditExpenseModalProps) {
  const hasSubExpenses = expense.hasSubExpenses ?? false;
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(String(expense.amount));
  const [participants, setParticipants] = useState<string[]>(
    resolveParticipantSelection(expense.participants, travellers)
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    if (!hasSubExpenses && participants.length === 0) {
      setError("Please select at least one person to split among");
      return;
    }

    setSubmitting(true);
    try {
      const savedParticipants = hasSubExpenses
        ? resolveParticipantSelection(expense.participants, travellers)
        : participants;
      await onSubmit(expense, name.trim(), parsedAmount, savedParticipants);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      await onDelete(expense);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const busy = submitting || deleting;

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
      <div className="relative w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:m-4 safe-area-bottom max-h-[90vh] overflow-y-auto">
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

          {!hasSubExpenses && (
            <ParticipantPicker
              travellers={travellers}
              selected={participants}
              onChange={setParticipants}
              label="Split among"
            />
          )}

          {hasSubExpenses && (
            <p className="text-xs text-lavender-600/70">
              Split is set per breakdown item. Edit participants on each item in the expense card.
            </p>
          )}

          <p className="text-xs text-lavender-600/70">
            Paid by <span className="font-medium text-lavender-700">{expense.paidBy}</span>
          </p>

          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
          )}

          {showDeleteConfirm ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-medium text-rose-800">
                Delete &ldquo;{expense.name}&rdquo;? This removes the expense, its breakdown, and payment records.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="!bg-rose-600 hover:!bg-rose-700"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={busy}
              className="text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50 touch-manipulation"
            >
              Delete expense
            </button>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={onClose} type="button" disabled={busy}>
              Cancel
            </Button>
            <Button fullWidth type="submit" disabled={busy}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
