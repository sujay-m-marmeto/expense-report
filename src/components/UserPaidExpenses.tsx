import type { Expense } from "../types";
import { formatCurrency, getTotalPaidBy } from "../utils/calculations";
import { Card } from "./Card";

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

interface UserPaidExpensesProps {
  personName: string;
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  compact?: boolean;
}

export function UserPaidExpenses({
  personName,
  expenses,
  onEdit,
  compact = false,
}: UserPaidExpensesProps) {
  const paidExpenses = expenses.filter(
    (e) => e.paidBy.trim().toLowerCase() === personName.trim().toLowerCase()
  );
  const totalPaid = getTotalPaidBy(personName, expenses);

  if (paidExpenses.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-lavender-600/80">
          No expenses paid by {personName} yet.
        </p>
      </Card>
    );
  }

  const displayList = compact ? paidExpenses.slice(0, 3) : paidExpenses;

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
            Expenses you paid
          </h3>
          <p className="mt-0.5 text-lg font-bold text-lavender-900">
            {formatCurrency(totalPaid)}
            <span className="ml-1 text-sm font-normal text-lavender-600/70">
              · {paidExpenses.length} items
            </span>
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2" aria-label={`Expenses paid by ${personName}`}>
        {displayList.map((expense) => (
          <li key={expense.id}>
            <Card className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-lavender-900">
                    {expense.name}
                  </p>
                  {expense.date && (
                    <p className="text-xs text-lavender-500/80">
                      {formatExpenseDate(expense.date)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-bold text-lavender-800">
                    {formatCurrency(expense.amount)}
                  </span>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(expense)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender-100 text-lavender-700 transition-all hover:bg-lavender-200 active:scale-95"
                      aria-label={`Edit ${expense.name}`}
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {compact && paidExpenses.length > 3 && (
        <p className="mt-2 text-center text-xs text-lavender-500/80">
          +{paidExpenses.length - 3} more on My Dues tab
        </p>
      )}
    </div>
  );
}
