import { useEffect, useMemo, useState } from "react";
import type { TabId, Expense } from "./types";
import { useExpenses } from "./hooks/useExpenses";
import { useTravellers } from "./hooks/useTravellers";
import { useSplits } from "./hooks/useSplits";
import { calculateBalances, calculatePersonDues, getTotalExpenses } from "./utils/calculations";
import { USER_STORAGE_KEY } from "./config";
import { Header } from "./components/Header";
import { TabNav } from "./components/TabNav";
import { ExpenseList } from "./components/ExpenseList";
import { SplitView } from "./components/SplitView";
import { PaymentsView } from "./components/PaymentsView";
import { MyDuesView } from "./components/MyDuesView";
import { TravellersList } from "./components/TravellersList";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { EditExpenseModal } from "./components/EditExpenseModal";
import { DuesNameModal } from "./components/DuesNameModal";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { DemoBanner } from "./components/DemoBanner";
import { UserSummaryCard } from "./components/UserSummaryCard";
import { formatCurrency } from "./utils/calculations";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dues");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  const { expenses, loading: expensesLoading, error: expensesError, isDemo: expensesDemo, addExpense, updateExpense } = useExpenses();
  const { travellers, loading: travellersLoading, error: travellersError, isDemo: travellersDemo } = useTravellers();
  const { splits, loading: splitsLoading, error: splitsError, saveSplit } = useSplits();

  const isDemo = expensesDemo || travellersDemo;
  const loading = expensesLoading || travellersLoading || splitsLoading;
  const travellerNames = travellers.map((t) => t.name);

  const total = getTotalExpenses(expenses);
  const balances = useMemo(
    () => calculateBalances(expenses, travellers, splits),
    [expenses, travellers, splits]
  );
  const perPerson = travellers.length > 0 ? total / travellers.length : 0;

  const userDues = useMemo(() => {
    if (!currentUser) return null;
    return calculatePersonDues(currentUser, expenses, travellers, splits, balances);
  }, [currentUser, expenses, travellers, splits, balances]);

  useEffect(() => {
    if (!loading && travellers.length > 0) {
      setDataReady(true);
      setShowUserModal(true);
    }
  }, [loading, travellers.length]);

  const handleUserConfirm = (name: string) => {
    setCurrentUser(name);
    localStorage.setItem(USER_STORAGE_KEY, name);
    setShowUserModal(false);
    setActiveTab("dues");
  };

  const handleSwitchUser = () => {
    setShowUserModal(true);
  };

  const storedUserName = useMemo(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored && travellerNames.includes(stored)) return stored;
    return undefined;
  }, [travellerNames]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg min-h-dvh pb-24">
        <Header />
        <main className="px-4">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (dataReady && showUserModal) {
    return (
      <DuesNameModal
        travellers={travellers}
        initialName={currentUser ?? storedUserName}
        onConfirm={handleUserConfirm}
      />
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-lg min-h-dvh pb-24">
        <Header />
        <main className="px-4">
          <LoadingSpinner message="Loading..." />
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg min-h-dvh pb-24">
      <Header currentUser={currentUser} onSwitchUser={handleSwitchUser} />

      <main className="px-4">
        {isDemo && !bannerDismissed && (
          <DemoBanner onDismiss={() => setBannerDismissed(true)} />
        )}

        {(expensesError || travellersError || splitsError) && (
          <div className="mb-4 rounded-xl bg-rose-100/80 p-3 text-sm text-rose-700" role="alert">
            {expensesError || travellersError || splitsError}
          </div>
        )}

        {userDues && (
          <div className="mb-4">
            <UserSummaryCard
              dues={userDues}
              onViewDetails={() => setActiveTab("dues")}
            />
          </div>
        )}

        {activeTab === "expenses" && (
          <section aria-label="Expenses">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
                  All Expenses
                </h2>
                <p className="text-2xl font-bold text-lavender-900">
                  {formatCurrency(total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender-600 text-2xl text-white shadow-lg shadow-lavender-400/40 transition-all hover:bg-lavender-700 active:scale-95"
                aria-label="Add expense"
              >
                +
              </button>
            </div>
            <ExpenseList
              expenses={expenses}
              travellers={travellers}
              splits={splits}
              onEdit={setEditingExpense}
            />
          </section>
        )}

        {activeTab === "split" && (
          <section aria-label="Split calculator">
            <SplitView
              balances={balances}
              total={total}
              perPerson={perPerson}
              travellerCount={travellers.length}
              highlightUser={currentUser}
            />
          </section>
        )}

        {activeTab === "payments" && (
          <PaymentsView
            expenses={expenses}
            travellers={travellers}
            splits={splits}
            onSaveSplit={saveSplit}
          />
        )}

        {activeTab === "dues" && (
          <MyDuesView
            currentUser={currentUser}
            travellers={travellers}
            expenses={expenses}
            splits={splits}
            balances={balances}
          />
        )}

        {activeTab === "travellers" && (
          <section aria-label="Travellers">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
                The Boys
              </h2>
              <p className="text-sm text-lavender-600/70">
                {travellers.length} travellers on this trip
              </p>
            </div>
            <TravellersList travellers={travellers} />
          </section>
        )}
      </main>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showAddModal && (
        <AddExpenseModal
          travellers={travellerNames}
          onClose={() => setShowAddModal(false)}
          onSubmit={addExpense}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={updateExpense}
        />
      )}
    </div>
  );
}

export default App;
