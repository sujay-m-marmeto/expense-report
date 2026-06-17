import type { Expense, Traveller, PersonBalance, ExpenseSplit } from "../types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function getExpenseEqualShare(expense: Expense, travellerCount: number): number {
  if (travellerCount <= 0) return expense.amount;
  return expense.amount / travellerCount;
}

export function findSplitAmount(
  splits: ExpenseSplit[],
  expenseName: string,
  personName: string
): number | undefined {
  const expenseKey = normalizeKey(expenseName);
  const personKey = normalizeKey(personName);
  const split = splits.find(
    (s) => normalizeKey(s.expenseName) === expenseKey && normalizeKey(s.personName) === personKey
  );
  return split?.amount;
}

export function getSplitsForExpense(splits: ExpenseSplit[], expenseName: string): ExpenseSplit[] {
  const expenseKey = normalizeKey(expenseName);
  return splits.filter((s) => normalizeKey(s.expenseName) === expenseKey);
}

export function calculateBalances(
  expenses: Expense[],
  travellers: Traveller[],
  splits: ExpenseSplit[] = []
): PersonBalance[] {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = travellers.length || 1;
  const sharePerPerson = total / count;

  const paidMap = new Map<string, number>();

  for (const expense of expenses) {
    const expenseSplits = getSplitsForExpense(splits, expense.name);

    if (expenseSplits.length > 0) {
      for (const split of expenseSplits) {
        const personKey = normalizeKey(split.personName);
        paidMap.set(personKey, (paidMap.get(personKey) ?? 0) + split.amount);
      }
    } else {
      const key = normalizeKey(expense.paidBy);
      paidMap.set(key, (paidMap.get(key) ?? 0) + expense.amount);
    }
  }

  return travellers.map((traveller) => {
    const paid = paidMap.get(normalizeKey(traveller.name)) ?? 0;
    const balance = paid - sharePerPerson;
    return {
      name: traveller.name,
      phone: traveller.phone,
      paid,
      share: sharePerPerson,
      balance,
    };
  });
}

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getExpenseSplitTotal(splits: ExpenseSplit[], expenseName: string): number {
  return getSplitsForExpense(splits, expenseName).reduce((sum, s) => sum + s.amount, 0);
}

export interface ExpensePersonOwes {
  name: string;
  share: number;
  paid: number;
  owes: number;
}

export function getExpenseOwesBreakdown(
  expense: Expense,
  travellers: Traveller[],
  splits: ExpenseSplit[]
): ExpensePersonOwes[] {
  const count = travellers.length || 1;
  const share = getExpenseEqualShare(expense, count);
  const roundedShare = Math.round(share);
  const expenseSplits = getSplitsForExpense(splits, expense.name);
  const hasSplits = expenseSplits.length > 0;

  return travellers.map((traveller) => {
    let paid = 0;

    if (hasSplits) {
      paid = findSplitAmount(splits, expense.name, traveller.name) ?? 0;
    } else if (normalizeKey(traveller.name) === normalizeKey(expense.paidBy)) {
      paid = expense.amount;
    }

    const owes = Math.max(0, Math.round(share - paid));

    return {
      name: traveller.name,
      share: roundedShare,
      paid,
      owes,
    };
  });
}
