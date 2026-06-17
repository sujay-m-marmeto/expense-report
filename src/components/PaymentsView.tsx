import type { Expense, Traveller, ExpenseSplit } from "../types";
import { ExpenseSplitsSection } from "./ExpenseSplitsSection";

interface PaymentsViewProps {
  expenses: Expense[];
  travellers: Traveller[];
  splits: ExpenseSplit[];
  onSaveSplit: (expenseName: string, personName: string, amount: number) => Promise<void>;
}

export function PaymentsView({
  expenses,
  travellers,
  splits,
  onSaveSplit,
}: PaymentsViewProps) {
  return (
    <section aria-label="Record payments" className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
          Record Payments
        </h2>
        <p className="mt-1 text-sm text-lavender-600/70">
          Mark what each person paid per expense
        </p>
      </div>

      <ExpenseSplitsSection
        expenses={expenses}
        travellers={travellers}
        splits={splits}
        onSaveSplit={onSaveSplit}
        hideHeading
      />
    </section>
  );
}
