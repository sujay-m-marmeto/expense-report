import { useState } from "react";
import type { Expense, Traveller, ExpenseSplit } from "../types";
import {
  formatCurrency,
  findSplitAmount,
  getExpenseEqualShare,
  getExpenseSplitTotal,
  getSplitsForExpense,
} from "../utils/calculations";
import { Card } from "./Card";
import { Button } from "./Button";

interface ExpenseSplitsSectionProps {
  expenses: Expense[];
  travellers: Traveller[];
  splits: ExpenseSplit[];
  onSaveSplit: (expenseName: string, personName: string, amount: number) => Promise<void>;
  hideHeading?: boolean;
}

interface PersonRowState {
  amount: string;
  saving: boolean;
  saved: boolean;
}

export function ExpenseSplitsSection({
  expenses,
  travellers,
  splits,
  onSaveSplit,
  hideHeading = false,
}: ExpenseSplitsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    expenses[0]?.id ?? null
  );
  const [rowState, setRowState] = useState<Record<string, PersonRowState>>({});

  const getRowKey = (expenseName: string, personName: string) =>
    `${expenseName}::${personName}`;

  const getRowState = (key: string): PersonRowState =>
    rowState[key] ?? { amount: "", saving: false, saved: false };

  const setRowField = (key: string, patch: Partial<PersonRowState>) => {
    setRowState((prev) => ({
      ...prev,
      [key]: { ...getRowState(key), ...patch },
    }));
  };

  const handleSave = async (expense: Expense, personName: string, amountStr: string) => {
    const key = getRowKey(expense.name, personName);
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed < 0) return;

    setRowField(key, { saving: true, saved: false });
    try {
      await onSaveSplit(expense.name, personName, parsed);
      setRowField(key, { saving: false, saved: true });
      setTimeout(() => setRowField(key, { saved: false }), 2000);
    } catch {
      setRowField(key, { saving: false });
    }
  };

  const handleMarkPaid = async (expense: Expense, personName: string) => {
    const equalShare = Math.round(getExpenseEqualShare(expense, travellers.length));
    const key = getRowKey(expense.name, personName);
    setRowField(key, { amount: String(equalShare) });
    await handleSave(expense, personName, String(equalShare));
  };

  if (expenses.length === 0) return null;

  return (
    <div>
      {!hideHeading && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
            Record Payments
          </h2>
          <p className="mb-3 text-xs text-lavender-600/70 leading-relaxed">
            Mark what each person paid per expense. Balances update when splits are saved.
          </p>
        </>
      )}

      <ul className="flex flex-col gap-3" aria-label="Expense payment splits">
        {expenses.map((expense) => {
          const isExpanded = expandedId === expense.id;
          const expenseSplits = getSplitsForExpense(splits, expense.name);
          const recordedTotal = getExpenseSplitTotal(splits, expense.name);
          const equalShare = Math.round(getExpenseEqualShare(expense, travellers.length));
          const hasSplits = expenseSplits.length > 0;

          return (
            <li key={expense.id}>
              <Card className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : expense.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-lavender-50/50"
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lavender-900 truncate">
                      {expense.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-lavender-600/70">
                      {formatCurrency(expense.amount)} total · {formatCurrency(equalShare)} each
                      {hasSplits && (
                        <span className="ml-1 text-emerald-600">
                          · {formatCurrency(recordedTotal)} recorded
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-lavender-500 transition-transform duration-200"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-lavender-100/80 px-4 pb-4 pt-3">
                    <ul className="flex flex-col gap-2">
                      {travellers.map((traveller) => {
                        const key = getRowKey(expense.name, traveller.name);
                        const existing = findSplitAmount(splits, expense.name, traveller.name);
                        const state = getRowState(key);
                        const displayAmount =
                          state.amount !== ""
                            ? state.amount
                            : existing !== undefined
                              ? String(existing)
                              : "";

                        return (
                          <li
                            key={traveller.id}
                            className="flex items-center gap-2 rounded-xl bg-lavender-50/60 p-2.5"
                          >
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-lavender-900">
                              {traveller.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs text-lavender-500">₹</span>
                              <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="1"
                                placeholder="0"
                                value={displayAmount}
                                onChange={(e) =>
                                  setRowField(key, { amount: e.target.value, saved: false })
                                }
                                className="w-20 rounded-lg border border-lavender-200 bg-white px-2 py-1.5 text-sm text-lavender-900 outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-300"
                                aria-label={`Amount paid by ${traveller.name} for ${expense.name}`}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkPaid(expense, traveller.name)}
                                disabled={state.saving}
                                className="!px-2 !py-1.5 text-xs whitespace-nowrap"
                              >
                                Mark paid
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSave(expense, traveller.name, displayAmount)
                                }
                                disabled={state.saving || !displayAmount}
                                className="!px-2.5 !py-1.5 text-xs"
                              >
                                {state.saving ? "…" : state.saved ? "✓" : "Save"}
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
