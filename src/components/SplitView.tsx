import type { PersonBalance } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Card } from "./Card";

interface SplitViewProps {
  balances: PersonBalance[];
  total: number;
  perPerson: number;
  travellerCount: number;
}

export function SplitView({
  balances,
  total,
  perPerson,
  travellerCount,
}: SplitViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-lavender-500/80">
              Total
            </p>
            <p className="mt-1 text-lg font-bold text-lavender-900">
              {formatCurrency(total)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-lavender-500/80">
              People
            </p>
            <p className="mt-1 text-lg font-bold text-lavender-900">{travellerCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-lavender-500/80">
              Per Person
            </p>
            <p className="mt-1 text-lg font-bold text-lavender-600">
              {formatCurrency(perPerson)}
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
          Balance Breakdown
        </h2>
        <ul className="flex flex-col gap-3" aria-label="Balance breakdown">
          {balances.map((person, index) => (
            <li
              key={person.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lavender-900">{person.name}</h3>
                    <p className="mt-0.5 text-xs text-lavender-600/70">
                      Paid {formatCurrency(person.paid)} · Share {formatCurrency(person.share)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {person.balance >= 0 ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                        +{formatCurrency(person.balance)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-700">
                        {formatCurrency(person.balance)}
                      </span>
                    )}
                    <p className="mt-0.5 text-xs text-lavender-500/70">
                      {person.balance >= 0 ? "gets back" : "owes"}
                    </p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      <Card className="p-4">
        <p className="text-sm text-lavender-700/80 leading-relaxed">
          <span className="font-semibold text-emerald-700">Green</span> means they paid more than their share and should get money back.
          <span className="font-semibold text-rose-700"> Red</span> means they owe the group.
          Use the <span className="font-semibold text-lavender-700">Payments</span> tab to record what each person paid per expense.
        </p>
      </Card>
    </div>
  );
}
