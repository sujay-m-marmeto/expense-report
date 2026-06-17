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

export type TabId = "expenses" | "split" | "payments" | "travellers";
