import { useEffect, useMemo, useState } from "react";
import type { Expense, Traveller, PersonBalance, ExpenseSplit } from "../types";
import { calculatePersonDues, formatCurrency } from "../utils/calculations";
import { Card } from "./Card";
import { Select } from "./Select";
import { CopyPhoneButton } from "./CopyPhoneButton";

const STORAGE_KEY = "goa-selected-person";

interface MyDuesViewProps {
  travellers: Traveller[];
  expenses: Expense[];
  splits: ExpenseSplit[];
  balances: PersonBalance[];
}

export function MyDuesView({
  travellers,
  expenses,
  splits,
  balances,
}: MyDuesViewProps) {
  const names = travellers.map((t) => t.name);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && names.includes(stored)) {
      setSelectedName(stored);
    } else if (names.length > 0) {
      setSelectedName(names[0]);
    }
  }, [names]);

  const handleNameChange = (name: string) => {
    setSelectedName(name);
    localStorage.setItem(STORAGE_KEY, name);
  };

  const dues = useMemo(() => {
    if (!selectedName) return null;
    return calculatePersonDues(selectedName, expenses, travellers, splits, balances);
  }, [selectedName, expenses, travellers, splits, balances]);

  if (travellers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lavender-600/80">No travellers found.</p>
      </Card>
    );
  }

  return (
    <section aria-label="My dues" className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
          My Dues
        </h2>
        <p className="mt-1 text-sm text-lavender-600/70">
          See who you need to pay and how much
        </p>
      </div>

      <Select
        label="Your name"
        options={names}
        value={selectedName}
        onChange={(e) => handleNameChange(e.target.value)}
      />

      {dues && (
        <>
          <Card className="p-5 text-center">
            {dues.totalOwes > 0 ? (
              <>
                <p className="text-xs font-medium uppercase tracking-wide text-lavender-500/80">
                  You owe
                </p>
                <p className="mt-1 text-3xl font-bold text-rose-600">
                  {formatCurrency(dues.totalOwes)}
                </p>
                <p className="mt-1 text-sm text-lavender-600/70">to the group</p>
              </>
            ) : dues.totalGetsBack > 0 ? (
              <>
                <p className="text-xs font-medium uppercase tracking-wide text-lavender-500/80">
                  You get back
                </p>
                <p className="mt-1 text-3xl font-bold text-emerald-600">
                  {formatCurrency(dues.totalGetsBack)}
                </p>
                <p className="mt-1 text-sm text-lavender-600/70">from the group</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-emerald-600">All settled!</p>
                <p className="mt-1 text-sm text-lavender-600/70">You don&apos;t owe anyone</p>
              </>
            )}
          </Card>

          {dues.payees.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
                Pay these people
              </h3>
              <ul className="flex flex-col gap-3" aria-label="People to pay">
                {dues.payees.map((payee) => (
                  <li key={payee.name}>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lavender-100 text-base font-bold text-lavender-700"
                          aria-hidden="true"
                        >
                          {payee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-lavender-900">{payee.name}</h4>
                          <p className="text-lg font-bold text-rose-600">
                            {formatCurrency(payee.amount)}
                          </p>
                          {payee.phone && (
                            <p className="text-xs text-lavender-600/80">{payee.phone}</p>
                          )}
                        </div>
                        {payee.phone && (
                          <CopyPhoneButton phone={payee.phone} label={payee.name} size="sm" />
                        )}
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dues.expenseOwes.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
                Per expense
              </h3>
              <ul className="flex flex-col gap-2" aria-label="Expense breakdown">
                {dues.expenseOwes.map((item) => (
                  <li key={item.expenseName}>
                    <Card className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="min-w-0 truncate text-sm font-medium text-lavender-900">
                        {item.expenseName}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-rose-600">
                        {formatCurrency(item.owes)}
                      </span>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dues.totalOwes === 0 && dues.totalGetsBack === 0 && dues.expenseOwes.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-lavender-600/80">Nothing pending on your end.</p>
            </Card>
          )}
        </>
      )}
    </section>
  );
}
