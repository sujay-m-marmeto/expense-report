export interface Expense {
  id: string;
  rowIndex: number;
  name: string;
  amount: number;
  paidBy: string;
  date?: string;
}

export interface Traveller {
  id: string;
  name: string;
  phone: string;
}

export interface PersonBalance {
  name: string;
  phone: string;
  paid: number;
  share: number;
  balance: number;
}

export interface ExpenseSplit {
  id: string;
  expenseName: string;
  personName: string;
  amount: number;
}

export interface PayeeSettlement {
  name: string;
  phone: string;
  amount: number;
}

export interface ExpenseOwed {
  expenseName: string;
  owes: number;
  paidTo: string;
}

export interface PersonDues {
  name: string;
  totalOwes: number;
  totalGetsBack: number;
  balance: number;
  payees: PayeeSettlement[];
  expenseOwes: ExpenseOwed[];
}

export type TabId = "expenses" | "split" | "payments" | "dues" | "travellers";
