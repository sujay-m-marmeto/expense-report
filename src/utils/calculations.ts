import type { Expense, Traveller, PersonBalance, ExpenseSplit, PersonDues, PayeeSettlement, ExpenseOwed, ExpenseCollection, SubExpense } from "../types";

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

export function parseParticipantsList(value: unknown): string[] {
  if (value == null || value === "") return [];
  const str = typeof value === "string" ? value : String(value);
  return str
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatParticipantsList(names: string[]): string {
  return names.join(", ");
}

export function getExpenseParticipants(expense: Expense, travellers: Traveller[]): Traveller[] {
  const list = expense.participants;
  if (!list || list.length === 0) return travellers;

  const keys = new Set(list.map(normalizeKey));
  const matched = travellers.filter((t) => keys.has(normalizeKey(t.name)));
  return matched.length > 0 ? matched : travellers;
}

export function getSubExpenseParticipants(sub: SubExpense, travellers: Traveller[]): Traveller[] {
  const list = sub.participants;
  if (!list || list.length === 0) return travellers;

  const keys = new Set(list.map(normalizeKey));
  const matched = travellers.filter((t) => keys.has(normalizeKey(t.name)));
  return matched.length > 0 ? matched : travellers;
}

function paidToFromKey(payeeKey: string, expenses: Expense[]): string {
  const expense = expenses.find((e) => normalizeKey(e.paidBy) === payeeKey);
  return expense?.paidBy ?? payeeKey;
}

function nameFromKey(
  key: string,
  travellers: Traveller[],
  balances: PersonBalance[]
): string {
  const traveller = travellers.find((t) => normalizeKey(t.name) === key);
  if (traveller) return traveller.name;
  const balanceEntry = balances.find((b) => normalizeKey(b.name) === key);
  return balanceEntry?.name ?? key;
}

function phoneFromKey(
  key: string,
  travellers: Traveller[],
  balances: PersonBalance[]
): string {
  const traveller = travellers.find((t) => normalizeKey(t.name) === key);
  if (traveller?.phone) return traveller.phone;
  const balanceEntry = balances.find((b) => normalizeKey(b.name) === key);
  return balanceEntry?.phone ?? "";
}

function settlementsFromMap(
  amountMap: Map<string, number>,
  travellers: Traveller[],
  balances: PersonBalance[],
  expenses: Expense[]
): PayeeSettlement[] {
  return Array.from(amountMap.entries())
    .map(([key, amount]) => ({
      name: nameFromKey(key, travellers, balances) || paidToFromKey(key, expenses),
      phone: phoneFromKey(key, travellers, balances),
      amount,
    }))
    .filter((p) => p.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

function netSettlements(
  payees: PayeeSettlement[],
  owedBy: PayeeSettlement[]
): { payees: PayeeSettlement[]; owedBy: PayeeSettlement[] } {
  const payeeMap = new Map<string, PayeeSettlement>();
  for (const payee of payees) {
    payeeMap.set(normalizeKey(payee.name), payee);
  }

  const owedMap = new Map<string, PayeeSettlement>();
  for (const debtor of owedBy) {
    owedMap.set(normalizeKey(debtor.name), debtor);
  }

  const allKeys = new Set([...payeeMap.keys(), ...owedMap.keys()]);
  const netPayees: PayeeSettlement[] = [];
  const netOwedBy: PayeeSettlement[] = [];

  for (const key of allKeys) {
    const payee = payeeMap.get(key);
    const debtor = owedMap.get(key);
    const payAmount = payee?.amount ?? 0;
    const owedAmount = debtor?.amount ?? 0;
    const net = payAmount - owedAmount;

    if (net > 0) {
      netPayees.push({
        name: payee?.name ?? debtor?.name ?? key,
        phone: payee?.phone ?? debtor?.phone ?? "",
        amount: net,
      });
    } else if (net < 0) {
      netOwedBy.push({
        name: debtor?.name ?? payee?.name ?? key,
        phone: debtor?.phone ?? payee?.phone ?? "",
        amount: -net,
      });
    }
  }

  netPayees.sort((a, b) => b.amount - a.amount);
  netOwedBy.sort((a, b) => b.amount - a.amount);

  return { payees: netPayees, owedBy: netOwedBy };
}

export function getExpensePaymentParticipants(expense: Expense, travellers: Traveller[]): Traveller[] {
  if (expense.subExpenses && expense.subExpenses.length > 0) {
    const breakdown = getExpenseOwesBreakdown(expense, travellers, []);
    const keys = new Set(breakdown.map((b) => normalizeKey(b.name)));
    return travellers.filter((t) => keys.has(normalizeKey(t.name)));
  }
  return getExpenseParticipants(expense, travellers);
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
  const shareMap = new Map<string, number>();
  const paidMap = new Map<string, number>();

  for (const expense of expenses) {
    if (expense.subExpenses && expense.subExpenses.length > 0) {
      for (const sub of expense.subExpenses) {
        const participants = getSubExpenseParticipants(sub, travellers);
        const share = sub.amount / (participants.length || 1);
        for (const participant of participants) {
          const key = normalizeKey(participant.name);
          shareMap.set(key, (shareMap.get(key) ?? 0) + share);
        }
      }
    } else {
      const participants = getExpenseParticipants(expense, travellers);
      const share = expense.amount / (participants.length || 1);
      for (const participant of participants) {
        const key = normalizeKey(participant.name);
        shareMap.set(key, (shareMap.get(key) ?? 0) + share);
      }
    }

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
    const key = normalizeKey(traveller.name);
    const paid = paidMap.get(key) ?? 0;
    const share = shareMap.get(key) ?? 0;
    const balance = paid - share;
    return {
      name: traveller.name,
      phone: traveller.phone,
      paid,
      share,
      balance,
    };
  });
}

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getExpensesPaidBy(personName: string, expenses: Expense[]): Expense[] {
  const key = personName.trim().toLowerCase();
  return expenses.filter((e) => e.paidBy.trim().toLowerCase() === key);
}

export function getTotalPaidBy(personName: string, expenses: Expense[]): number {
  return getExpensesPaidBy(personName, expenses).reduce((sum, e) => sum + e.amount, 0);
}

export function mergeSubExpensesIntoExpenses(
  expenses: Expense[],
  subExpenses: SubExpense[]
): Expense[] {
  const grouped = new Map<string, SubExpense[]>();

  for (const sub of subExpenses) {
    const key = sub.parentExpenseName.trim().toLowerCase();
    const list = grouped.get(key) ?? [];
    list.push(sub);
    grouped.set(key, list);
  }

  return expenses.map((expense) => {
    const key = expense.name.trim().toLowerCase();
    const subs = grouped.get(key);
    if (!subs || subs.length === 0) return expense;

    const amount = subs.reduce((sum, sub) => sum + sub.amount, 0);
    return {
      ...expense,
      amount,
      subExpenses: subs,
      hasSubExpenses: true,
    };
  });
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
  const expenseSplits = getSplitsForExpense(splits, expense.name);
  const hasSplits = expenseSplits.length > 0;
  const hasSubs = expense.subExpenses && expense.subExpenses.length > 0;

  if (hasSubs) {
    const shareMap = new Map<string, number>();
    const participantKeys = new Set<string>();

    for (const sub of expense.subExpenses!) {
      const participants = getSubExpenseParticipants(sub, travellers);
      const count = participants.length || 1;
      const subShare = sub.amount / count;
      for (const participant of participants) {
        const key = normalizeKey(participant.name);
        participantKeys.add(key);
        shareMap.set(key, (shareMap.get(key) ?? 0) + subShare);
      }
    }

    const participantsList = travellers.filter((t) => participantKeys.has(normalizeKey(t.name)));

    return participantsList.map((traveller) => {
      const key = normalizeKey(traveller.name);
      const roundedShare = Math.round(shareMap.get(key) ?? 0);
      let paid = 0;

      if (hasSplits) {
        paid = findSplitAmount(splits, expense.name, traveller.name) ?? 0;
      } else if (key === normalizeKey(expense.paidBy)) {
        paid = expense.amount;
      }

      const owes = Math.max(0, Math.round(roundedShare - paid));

      return {
        name: traveller.name,
        share: roundedShare,
        paid,
        owes,
      };
    });
  }

  const participants = getExpenseParticipants(expense, travellers);
  const count = participants.length || 1;
  const share = expense.amount / count;
  const roundedShare = Math.round(share);

  return participants.map((traveller) => {
    let paid = 0;

    if (hasSplits) {
      paid = findSplitAmount(splits, expense.name, traveller.name) ?? 0;
    } else if (normalizeKey(traveller.name) === normalizeKey(expense.paidBy)) {
      paid = expense.amount;
    }

    const owes = Math.max(0, Math.round(roundedShare - paid));

    return {
      name: traveller.name,
      share: roundedShare,
      paid,
      owes,
    };
  });
}

export function getExpenseEqualShare(expense: Expense, travellers: Traveller[]): number {
  const breakdown = getExpenseOwesBreakdown(expense, travellers, []);
  if (breakdown.length === 0) return expense.amount;
  return breakdown[0].share;
}

export function calculatePersonDues(
  personName: string,
  expenses: Expense[],
  travellers: Traveller[],
  splits: ExpenseSplit[],
  balances: PersonBalance[]
): PersonDues | null {
  const personKey = normalizeKey(personName);
  const personBalance = balances.find((b) => normalizeKey(b.name) === personKey);
  if (!personBalance) return null;

  const expenseOwes: ExpenseOwed[] = [];
  const payeeAmounts = new Map<string, number>();

  for (const expense of expenses) {
    const breakdown = getExpenseOwesBreakdown(expense, travellers, splits);
    const person = breakdown.find((p) => normalizeKey(p.name) === personKey);
    if (!person || person.owes <= 0) continue;

    const paidTo = expense.paidBy.trim();
    expenseOwes.push({ expenseName: expense.name, owes: person.owes, paidTo });

    if (normalizeKey(paidTo) !== personKey) {
      const payeeKey = normalizeKey(paidTo);
      payeeAmounts.set(payeeKey, (payeeAmounts.get(payeeKey) ?? 0) + person.owes);
    }
  }

  const payees: PayeeSettlement[] = settlementsFromMap(
    payeeAmounts,
    travellers,
    balances,
    expenses
  );

  const debtorAmounts = new Map<string, number>();
  const expenseCollections: ExpenseCollection[] = [];

  for (const expense of expenses) {
    if (normalizeKey(expense.paidBy) !== personKey) continue;

    const breakdown = getExpenseOwesBreakdown(expense, travellers, splits);
    for (const entry of breakdown) {
      if (normalizeKey(entry.name) === personKey || entry.owes <= 0) continue;

      const debtorKey = normalizeKey(entry.name);
      debtorAmounts.set(debtorKey, (debtorAmounts.get(debtorKey) ?? 0) + entry.owes);
      expenseCollections.push({
        expenseName: expense.name,
        debtorName: entry.name,
        amount: entry.owes,
      });
    }
  }

  const owedBy: PayeeSettlement[] = settlementsFromMap(
    debtorAmounts,
    travellers,
    balances,
    expenses
  );

  if (payees.length === 0 && personBalance.balance < 0) {
    let remaining = Math.round(-personBalance.balance);
    const creditors = balances
      .filter((b) => b.balance > 0 && normalizeKey(b.name) !== personKey)
      .sort((a, b) => b.balance - a.balance);

    for (const creditor of creditors) {
      if (remaining <= 0) break;
      const payAmount = Math.min(Math.round(creditor.balance), remaining);
      const traveller = travellers.find((t) => normalizeKey(t.name) === normalizeKey(creditor.name));
      payees.push({
        name: creditor.name,
        phone: traveller?.phone ?? creditor.phone,
        amount: payAmount,
      });
      remaining -= payAmount;
    }
  }

  if (owedBy.length === 0 && personBalance.balance > 0) {
    let remaining = Math.round(personBalance.balance);
    const debtors = balances
      .filter((b) => b.balance < 0 && normalizeKey(b.name) !== personKey)
      .sort((a, b) => a.balance - b.balance);

    for (const debtor of debtors) {
      if (remaining <= 0) break;
      const collectAmount = Math.min(Math.round(-debtor.balance), remaining);
      owedBy.push({
        name: debtor.name,
        phone: phoneFromKey(normalizeKey(debtor.name), travellers, balances),
        amount: collectAmount,
      });
      remaining -= collectAmount;
    }
  }

  const netted = netSettlements(payees, owedBy);

  return {
    name: personName,
    totalOwes: personBalance.balance < 0 ? Math.round(-personBalance.balance) : 0,
    totalGetsBack: personBalance.balance > 0 ? Math.round(personBalance.balance) : 0,
    balance: personBalance.balance,
    payees: netted.payees,
    owedBy: netted.owedBy,
    expenseOwes,
    expenseCollections,
  };
}
