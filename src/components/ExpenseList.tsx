import type { Expense } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Card } from "./Card";

interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
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
      {expenses.map((expense, index) => (
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
                  <p className="mt-0.5 text-xs text-lavender-500/70">{expense.date}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-lavender-800">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
