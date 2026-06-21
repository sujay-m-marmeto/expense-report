import type { Expense, Traveller, ExpenseSplit, SubExpense } from "../types";
import { formatCurrency, getExpenseOwesBreakdown } from "../utils/calculations";
import { Card } from "./Card";
import { SubExpenseSection } from "./SubExpenseSection";

function formatExpenseDate(date?: string): string | undefined {
  if (!date) return undefined;
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return date;
}

interface ExpenseListProps {
  expenses: Expense[];
  travellers: Traveller[];
  splits: ExpenseSplit[];
  onEdit: (expense: Expense) => void;
  onAddSubExpense: (
    parentName: string,
    name: string,
    amount: number,
    participants: string[]
  ) => Promise<void>;
  onDeleteSubExpense: (sub: SubExpense) => Promise<void>;
}

export function ExpenseList({
  expenses,
  travellers,
  splits,
  onEdit,
  onAddSubExpense,
  onDeleteSubExpense,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lavender-600/80">No expenses yet.</p>
        <p className="mt-1 text-sm text-lavender-500/70">
          Tap + to add the first one!
        </p>
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Expense list">
      {expenses.map((expense, index) => {
        const owesBreakdown = getExpenseOwesBreakdown(expense, travellers, splits);
        const shares = owesBreakdown.map((p) => p.share);
        const allSameShare =
          shares.length > 0 && shares.every((s) => s === shares[0]);

        return (
          <li
            key={expense.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lavender-900 truncate">
                    {expense.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-lavender-600/80">
                    Paid by <span className="font-medium text-lavender-700">{expense.paidBy}</span>
                  </p>
                  {expense.date && (
                    <p className="mt-0.5 text-xs text-lavender-500/70">
                      {formatExpenseDate(expense.date)}
                    </p>
                  )}
                  {expense.participants &&
                    expense.participants.length > 0 &&
                    expense.participants.length < travellers.length && (
                      <p className="mt-0.5 text-xs text-lavender-500/70">
                        Split: {expense.participants.join(", ")}
                      </p>
                    )}
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  <p className="text-lg font-bold text-lavender-800 pt-0.5">
                    {formatCurrency(expense.amount)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onEdit(expense)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender-100 text-lavender-700 transition-all hover:bg-lavender-200 active:scale-95"
                    aria-label={`Edit ${expense.name}`}
                  >
                    ✏️
                  </button>
                </div>
              </div>

              <SubExpenseSection
                expense={expense}
                travellers={travellers}
                onAdd={onAddSubExpense}
                onDelete={onDeleteSubExpense}
              />

              {travellers.length > 0 && owesBreakdown.length > 0 && (
                <div className="mt-3 border-t border-lavender-100/80 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-lavender-500/80">
                    {allSameShare
                      ? `Each owes ${formatCurrency(shares[0])}`
                      : `Split among ${owesBreakdown.length} people`}
                  </p>
                  <ul className="flex flex-wrap gap-1.5" aria-label={`Who owes for ${expense.name}`}>
                    {owesBreakdown.map((person) => (
                      <li
                        key={person.name}
                        className={`
                          inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium
                          ${person.owes > 0
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"}
                        `}
                      >
                        <span>{person.name}</span>
                        <span className="font-bold">
                          {person.owes > 0 ? formatCurrency(person.owes) : "✓"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
