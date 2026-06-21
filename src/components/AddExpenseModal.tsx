import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";
import { ParticipantPicker } from "./ParticipantPicker";

interface AddExpenseModalProps {
  travellers: string[];
  onClose: () => void;
  onSubmit: (
    name: string,
    amount: number,
    paidBy: string,
    participants: string[]
  ) => Promise<void>;
}

export function AddExpenseModal({
  travellers,
  onClose,
  onSubmit,
}: AddExpenseModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(travellers[0] ?? "");
  const [participants, setParticipants] = useState<string[]>([...travellers]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!name.trim()) {
      setError("Please enter an expense name");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!paidBy) {
      setError("Please select who paid");
      return;
    }
    if (participants.length === 0) {
      setError("Please select at least one person to split among");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(name.trim(), parsedAmount, paidBy, participants);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-expense-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-lavender-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:m-4 safe-area-bottom">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="add-expense-title" className="text-lg font-bold text-lavender-900">
            Add Expense
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
          />
          <Select
            label="Paid By"
            options={travellers}
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          />

          <ParticipantPicker
            travellers={travellers}
            selected={participants}
            onChange={setParticipants}
            label="Split among"
          />

          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={onClose} type="button">
              Cancel
            </Button>
            <Button fullWidth type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
