import { useEffect, useMemo, useState } from "react";
import type { TabId, Expense, SubExpense } from "./types";
import { useExpenses } from "./hooks/useExpenses";
import { useTravellers } from "./hooks/useTravellers";
import { useSplits } from "./hooks/useSplits";
import { useSubExpenses } from "./hooks/useSubExpenses";
import { calculateBalances, calculatePersonDues, getTotalExpenses, getExpensesPaidBy, getTotalPaidBy, mergeSubExpensesIntoExpenses } from "./utils/calculations";
import { USER_STORAGE_KEY, isSheetsConfigured } from "./config";
import { verifyUserPassword } from "./services/sheets";
import {
  canAutoLogin,
  canDeleteExpenses,
  clearAuthSession,
  isAdminUser,
  setAuthSession,
  travellerRequiresPassword,
} from "./utils/auth";
import { Header } from "./components/Header";
import { TabNav } from "./components/TabNav";
import { ExpenseList } from "./components/ExpenseList";
import { SplitView } from "./components/SplitView";
import { PaymentsView } from "./components/PaymentsView";
import { MyDuesView, MY_DUES_DETAILS_ID } from "./components/MyDuesView";
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
  const [expenseFilter, setExpenseFilter] = useState<"all" | "mine">("all");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [initialUserResolved, setInitialUserResolved] = useState(false);

  const { expenses, loading: expensesLoading, error: expensesError, isDemo: expensesDemo, addExpense, updateExpense, deleteExpense, reload: reloadExpenses } = useExpenses();
  const { travellers, loading: travellersLoading, error: travellersError, isDemo: travellersDemo } = useTravellers();
  const { splits, loading: splitsLoading, error: splitsError, saveSplit, removeSplitsForExpense, reload: reloadSplits } = useSplits();
  const {
    subExpenses,
    loading: subExpensesLoading,
    error: subExpensesError,
    addSubExpense,
    deleteSubExpense,
    renameParent,
    deleteForParent,
    reload: reloadSubExpenses,
  } = useSubExpenses();

  const isDemo = expensesDemo || travellersDemo;
  const loading = expensesLoading || travellersLoading || splitsLoading || subExpensesLoading;
  const travellerNames = travellers.map((t) => t.name);

  const displayExpenses = useMemo(
    () => mergeSubExpensesIntoExpenses(expenses, subExpenses),
    [expenses, subExpenses]
  );

  const total = getTotalExpenses(displayExpenses);
  const balances = useMemo(
    () => calculateBalances(displayExpenses, travellers, splits),
    [displayExpenses, travellers, splits]
  );
  const perPerson = travellers.length > 0 ? total / travellers.length : 0;

  const userPaidTotal = useMemo(
    () => (currentUser ? getTotalPaidBy(currentUser, displayExpenses) : 0),
    [currentUser, displayExpenses]
  );

  const filteredExpenses = useMemo(() => {
    if (expenseFilter === "mine" && currentUser) {
      return getExpensesPaidBy(currentUser, displayExpenses);
    }
    return displayExpenses;
  }, [expenseFilter, currentUser, displayExpenses]);

  const userDues = useMemo(() => {
    if (!currentUser) return null;
    return calculatePersonDues(currentUser, displayExpenses, travellers, splits, balances);
  }, [currentUser, displayExpenses, travellers, splits, balances]);

  useEffect(() => {
    if (loading || travellers.length === 0 || initialUserResolved) return;

    setInitialUserResolved(true);
    setDataReady(true);

    const stored = localStorage.getItem(USER_STORAGE_KEY);
    const storedIsValid = stored && travellers.some((t) => t.name === stored);

    if (storedIsValid && canAutoLogin(stored, travellers)) {
      setCurrentUser(stored);
      setShowUserModal(false);
    } else {
      setCurrentUser(null);
      setShowUserModal(true);
    }
  }, [loading, travellers, initialUserResolved]);

  const handleUserConfirm = (name: string) => {
    if (isAdminUser(name) && travellerRequiresPassword(name, travellers)) {
      setAuthSession(name);
    } else {
      clearAuthSession();
    }
    setCurrentUser(name);
    localStorage.setItem(USER_STORAGE_KEY, name);
    setShowUserModal(false);
    setActiveTab("dues");
  };

  const handleVerifyPassword = async (name: string, password: string) => {
    await verifyUserPassword(name, password);
  };

  const userCanDelete = currentUser ? canDeleteExpenses(currentUser) : false;

  const handleUpdateExpense = async (
    expense: Expense,
    name: string,
    amount: number,
    participants: string[]
  ) => {
    const baseExpense = expenses.find((e) => e.id === expense.id) ?? expense;
    if (name !== baseExpense.name) {
      await renameParent(baseExpense.name, name);
    }
    await updateExpense(baseExpense, name, amount, participants);
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (!userCanDelete) {
      throw new Error("Only Sujay and Dhruva can delete expenses");
    }

    const baseExpense = expenses.find((e) => e.id === expense.id) ?? expense;

    await deleteExpense(baseExpense);

    if (isSheetsConfigured()) {
      await reloadSubExpenses({ silent: true });
      await reloadSplits({ silent: true });
    } else {
      deleteForParent(baseExpense.name);
      removeSplitsForExpense(baseExpense.name);
    }

    setEditingExpense(null);
  };

  const handleAddSubExpense = async (
    parentName: string,
    name: string,
    amount: number,
    participants: string[]
  ) => {
    await addSubExpense(parentName, name, amount, participants);
    if (isSheetsConfigured()) {
      await reloadExpenses({ silent: true });
    }
  };

  const handleDeleteSubExpense = async (sub: SubExpense) => {
    await deleteSubExpense(sub);
    if (isSheetsConfigured()) {
      await reloadExpenses({ silent: true });
    }
  };

  const handleSwitchUser = () => {
    clearAuthSession();
    setShowUserModal(true);
  };

  const handleViewDuesDetails = () => {
    const scrollToDetails = () => {
      document.getElementById(MY_DUES_DETAILS_ID)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    if (activeTab !== "dues") {
      setActiveTab("dues");
      window.setTimeout(scrollToDetails, 100);
    } else {
      scrollToDetails();
    }
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
        initialName={storedUserName ?? travellers[0]?.name}
        onConfirm={handleUserConfirm}
        onCancel={currentUser ? () => setShowUserModal(false) : undefined}
        requiresPassword={(name) => travellerRequiresPassword(name, travellers)}
        verifyPassword={handleVerifyPassword}
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

        {(expensesError || travellersError || splitsError || subExpensesError) && (
          <div className="mb-4 rounded-xl bg-rose-100/80 p-3 text-sm text-rose-700" role="alert">
            {expensesError || travellersError || splitsError || subExpensesError}
          </div>
        )}

        {userDues && (
          <div className="mb-4">
            <UserSummaryCard
              dues={userDues}
              onViewDetails={handleViewDuesDetails}
            />
          </div>
        )}

        {activeTab === "expenses" && (
          <section aria-label="Expenses">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-lavender-700/80">
                  {expenseFilter === "mine" ? "My Expenses" : "All Expenses"}
                </h2>
                <p className="text-2xl font-bold text-lavender-900">
                  {expenseFilter === "mine"
                    ? formatCurrency(userPaidTotal)
                    : formatCurrency(total)}
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

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setExpenseFilter("all")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  expenseFilter === "all"
                    ? "bg-lavender-600 text-white shadow-md shadow-lavender-400/30"
                    : "bg-white/80 text-lavender-700 border border-lavender-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setExpenseFilter("mine")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  expenseFilter === "mine"
                    ? "bg-lavender-600 text-white shadow-md shadow-lavender-400/30"
                    : "bg-white/80 text-lavender-700 border border-lavender-200"
                }`}
              >
                My expenses
              </button>
            </div>

            <ExpenseList
              expenses={filteredExpenses}
              travellers={travellers}
              splits={splits}
              onEdit={setEditingExpense}
              onAddSubExpense={handleAddSubExpense}
              onDeleteSubExpense={handleDeleteSubExpense}
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
            expenses={displayExpenses}
            travellers={travellers}
            splits={splits}
            onSaveSplit={saveSplit}
          />
        )}

        {activeTab === "dues" && (
          <MyDuesView
            currentUser={currentUser}
            travellers={travellers}
            expenses={displayExpenses}
            splits={splits}
            balances={balances}
            onEditExpense={setEditingExpense}
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
          key={editingExpense.id}
          expense={editingExpense}
          travellers={travellerNames}
          onClose={() => setEditingExpense(null)}
          onSubmit={handleUpdateExpense}
          onDelete={handleDeleteExpense}
          canDelete={userCanDelete}
        />
      )}
    </div>
  );
}

export default App;
