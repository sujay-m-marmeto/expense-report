import type { Expense, Traveller, PersonBalance } from "../types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateBalances(
  expenses: Expense[],
  travellers: Traveller[]
): PersonBalance[] {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = travellers.length || 1;
  const sharePerPerson = total / count;

  const paidMap = new Map<string, number>();
  for (const expense of expenses) {
    const key = expense.paidBy.trim().toLowerCase();
    paidMap.set(key, (paidMap.get(key) ?? 0) + expense.amount);
  }

  return travellers.map((traveller) => {
    const paid = paidMap.get(traveller.name.trim().toLowerCase()) ?? 0;
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
