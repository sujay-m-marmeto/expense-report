import { useMemo, useState } from "react";
import type { Expense, Traveller, PersonBalance, ExpenseSplit } from "../types";
import { calculatePersonDues, formatCurrency } from "../utils/calculations";
import { Card } from "./Card";
import { CopyPhoneButton } from "./CopyPhoneButton";
import { DuesNameModal } from "./DuesNameModal";
import { Button } from "./Button";

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
  const [showNameModal, setShowNameModal] = useState(true);
  const [selectedName, setSelectedName] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const names = travellers.map((t) => t.name);
    if (stored && names.includes(stored)) return stored;
    return "";
  });

  const handleConfirmName = (name: string) => {
    setSelectedName(name);
    localStorage.setItem(STORAGE_KEY, name);
    setShowNameModal(false);
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

  if (showNameModal) {
    return (
      <DuesNameModal
        travellers={travellers}
        initialName={selectedName || undefined}
        onConfirm={handleConfirmName}
      />
    );
  }

  return (
    <section aria-label="My dues" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
            My Dues
          </h2>
          <p className="mt-1 text-sm text-lavender-600/70">
            Hi <span className="font-semibold text-lavender-800">{selectedName}</span>
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowNameModal(true)}>
          Change
        </Button>
      </div>

      {dues && (
        <>
          <Card className="p-5 text-center">
            {dues.totalOwes > 0 && dues.totalGetsBack > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-lavender-500/80">
                    You owe
                  </p>
                  <p className="mt-1 text-xl font-bold text-rose-600">
                    {formatCurrency(dues.totalOwes)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-lavender-500/80">
                    You get back
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-600">
                    {formatCurrency(dues.totalGetsBack)}
                  </p>
                </div>
              </div>
            ) : dues.totalOwes > 0 ? (
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

          {dues.owedBy.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
                People who owe you
              </h3>
              <ul className="flex flex-col gap-3" aria-label="People who owe you">
                {dues.owedBy.map((debtor) => (
                  <li key={debtor.name}>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-base font-bold text-emerald-700"
                          aria-hidden="true"
                        >
                          {debtor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-lavender-900">{debtor.name}</h4>
                          <p className="text-lg font-bold text-emerald-600">
                            {formatCurrency(debtor.amount)}
                          </p>
                          {debtor.phone && (
                            <p className="text-xs text-lavender-600/80">{debtor.phone}</p>
                          )}
                        </div>
                        {debtor.phone && (
                          <CopyPhoneButton phone={debtor.phone} label={debtor.name} size="sm" />
                        )}
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dues.expenseCollections.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
                Your expenses — pending
              </h3>
              <ul className="flex flex-col gap-2" aria-label="Pending collections">
                {dues.expenseCollections.map((item) => (
                  <li key={`${item.expenseName}-${item.debtorName}`}>
                    <Card className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-lavender-900">
                            {item.expenseName}
                          </p>
                          <p className="text-xs text-lavender-500/80">
                            {item.debtorName} owes you
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-emerald-600">
                          {formatCurrency(item.amount)}
                        </span>
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
                    <Card className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-lavender-900">
                            {item.expenseName}
                          </p>
                          <p className="text-xs text-lavender-500/80">
                            Pay {item.paidTo}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-rose-600">
                          {formatCurrency(item.owes)}
                        </span>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dues.totalOwes === 0 &&
            dues.totalGetsBack === 0 &&
            dues.expenseOwes.length === 0 &&
            dues.owedBy.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-lavender-600/80">Nothing pending on your end.</p>
            </Card>
          )}
        </>
      )}
    </section>
  );
}
