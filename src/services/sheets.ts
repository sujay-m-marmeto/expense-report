import { SHEETS_CONFIG } from "../config";
import type { Expense, Traveller, ExpenseSplit, SubExpense } from "../types";
import { parseParticipantsList, formatParticipantsList } from "../utils/calculations";

const DEMO_TRAVELLERS: Traveller[] = [
  { id: "1", name: "Sujay", phone: "+91 98765 43210" },
  { id: "2", name: "Rahul", phone: "+91 98765 43211" },
  { id: "3", name: "Amit", phone: "+91 98765 43212" },
  { id: "4", name: "Vikram", phone: "+91 98765 43213" },
  { id: "5", name: "Arjun", phone: "+91 98765 43214" },
  { id: "6", name: "Karan", phone: "+91 98765 43215" },
];

const DEMO_EXPENSES: Expense[] = [
  { id: "exp-0", rowIndex: 0, sheetRow: 2, name: "Hotel Stay", amount: 12000, paidBy: "Sujay", date: "2026-06-15" },
  { id: "exp-1", rowIndex: 1, sheetRow: 3, name: "Dinner at Fisherman's Wharf", amount: 4500, paidBy: "Rahul", date: "2026-06-15" },
  { id: "exp-2", rowIndex: 2, sheetRow: 4, name: "Scooter Rental", amount: 2400, paidBy: "Amit", date: "2026-06-16" },
  { id: "exp-3", rowIndex: 3, sheetRow: 5, name: "Beach Shack Lunch", amount: 3200, paidBy: "Vikram", date: "2026-06-16" },
  { id: "exp-4", rowIndex: 4, sheetRow: 6, name: "Water Sports", amount: 6000, paidBy: "Arjun", date: "2026-06-17" },
];

type SheetRow = unknown[];

function cellString(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value).trim();
}

function parseAmount(value: unknown): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  const parsed = parseFloat(cellString(value).replace(/[^\d.]/g, ""));
  return parsed;
}

function parseExpenseRow(row: SheetRow, index: number): Expense | null {
  const name = cellString(row[0]);
  if (!name) return null;

  const amount = parseAmount(row[1]);
  if (isNaN(amount) || amount <= 0) return null;

  const paidBy = cellString(row[2]) || "Unknown";
  const date = cellString(row[3]) || undefined;
  const participants = parseParticipantsList(row[4]);

  return {
    id: `exp-${index}`,
    rowIndex: index,
    sheetRow: index + 2,
    name,
    amount,
    paidBy,
    date,
    participants: participants.length > 0 ? participants : undefined,
  };
}

function parseTravellerRow(row: SheetRow, index: number): Traveller | null {
  const name = cellString(row[0]);
  if (!name) return null;

  return {
    id: `trav-${index}`,
    name,
    phone: cellString(row[1]),
  };
}

function parseSplitRow(row: SheetRow, index: number): ExpenseSplit | null {
  const expenseName = cellString(row[0]);
  const personName = cellString(row[1]);
  if (!expenseName || !personName) return null;

  const amount = parseAmount(row[2]);
  if (isNaN(amount) || amount < 0) return null;

  return {
    id: `split-${index}`,
    expenseName,
    personName,
    amount,
  };
}

function parseSubExpenseRow(row: SheetRow, index: number): SubExpense | null {
  const parentExpenseName = cellString(row[0]);
  const name = cellString(row[1]);
  if (!parentExpenseName || !name) return null;

  const amount = parseAmount(row[2]);
  if (isNaN(amount) || amount <= 0) return null;

  const participants = parseParticipantsList(row[3]);

  return {
    id: `sub-${index}`,
    sheetRow: index + 2,
    parentExpenseName,
    name,
    amount,
    participants: participants.length > 0 ? participants : undefined,
  };
}

type SheetAction = "expenses" | "travellers" | "splits" | "subExpenses";

async function fetchViaScript(action: SheetAction): Promise<SheetRow[]> {
  const url = `${SHEETS_CONFIG.scriptUrl}?action=${action}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${action}`);
  const data = await response.json();
  return data.rows ?? [];
}

async function fetchViaApi(range: string): Promise<SheetRow[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.sheetId}/values/${range}?key=${SHEETS_CONFIG.apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Sheets API error: ${response.statusText}`);
  const data = await response.json();
  return data.values ?? [];
}

async function getViaScript(params: Record<string, string>): Promise<Record<string, unknown>> {
  const search = new URLSearchParams(params);
  const url = `${SHEETS_CONFIG.scriptUrl}?${search}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

export async function fetchExpenses(): Promise<Expense[]> {
  if (SHEETS_CONFIG.scriptUrl) {
    const rows = await fetchViaScript("expenses");
    return rows
      .slice(1)
      .map((row, i) => parseExpenseRow(row, i))
      .filter((e): e is Expense => e !== null);
  }

  if (SHEETS_CONFIG.apiKey && SHEETS_CONFIG.sheetId) {
    const rows = await fetchViaApi("Expenses!A:D");
    return rows
      .slice(1)
      .map((row, i) => parseExpenseRow(row, i))
      .filter((e): e is Expense => e !== null);
  }

  return DEMO_EXPENSES;
}

export async function fetchTravellers(): Promise<Traveller[]> {
  if (SHEETS_CONFIG.scriptUrl) {
    const rows = await fetchViaScript("travellers");
    return rows
      .slice(1)
      .map((row, i) => parseTravellerRow(row, i))
      .filter((t): t is Traveller => t !== null);
  }

  if (SHEETS_CONFIG.apiKey && SHEETS_CONFIG.sheetId) {
    const rows = await fetchViaApi("Travellers!A:B");
    return rows
      .slice(1)
      .map((row, i) => parseTravellerRow(row, i))
      .filter((t): t is Traveller => t !== null);
  }

  return DEMO_TRAVELLERS;
}

export async function fetchSplits(): Promise<ExpenseSplit[]> {
  if (SHEETS_CONFIG.scriptUrl) {
    const rows = await fetchViaScript("splits");
    return rows
      .slice(1)
      .map((row, i) => parseSplitRow(row, i))
      .filter((s): s is ExpenseSplit => s !== null);
  }

  if (SHEETS_CONFIG.apiKey && SHEETS_CONFIG.sheetId) {
    const rows = await fetchViaApi("Splits!A:C");
    return rows
      .slice(1)
      .map((row, i) => parseSplitRow(row, i))
      .filter((s): s is ExpenseSplit => s !== null);
  }

  return [];
}

export async function fetchSubExpenses(): Promise<SubExpense[]> {
  if (SHEETS_CONFIG.scriptUrl) {
    const rows = await fetchViaScript("subExpenses");
    return rows
      .slice(1)
      .map((row, i) => parseSubExpenseRow(row, i))
      .filter((s): s is SubExpense => s !== null);
  }

  return [];
}

export async function saveSplit(
  expenseName: string,
  personName: string,
  amount: number
): Promise<void> {
  if (!SHEETS_CONFIG.scriptUrl) {
    throw new Error("Google Script URL not configured.");
  }

  const response = await fetch(SHEETS_CONFIG.scriptUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "saveSplit",
      expenseName,
      personName,
      amount,
    }),
  });

  void response;
}

export async function addExpense(
  name: string,
  amount: number,
  paidBy: string,
  participants: string[] = []
): Promise<void> {
  if (!SHEETS_CONFIG.scriptUrl) {
    throw new Error("Google Script URL not configured. Add expense locally only in demo mode.");
  }

  const response = await fetch(SHEETS_CONFIG.scriptUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "addExpense",
      name,
      amount,
      paidBy,
      date: new Date().toISOString().split("T")[0],
      participants: formatParticipantsList(participants),
    }),
  });

  void response;
}

export async function updateExpense(
  sheetRow: number,
  name: string,
  amount: number,
  oldName?: string,
  participants: string[] = []
): Promise<void> {
  if (!SHEETS_CONFIG.scriptUrl) {
    throw new Error("Google Script URL not configured.");
  }

  const params = new URLSearchParams({
    action: "updateExpense",
    sheetRow: String(sheetRow),
    name,
    amount: String(amount),
    participants: formatParticipantsList(participants),
  });
  if (oldName) {
    params.set("oldName", oldName);
  }

  const url = `${SHEETS_CONFIG.scriptUrl}?${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to update expense (${response.status})`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
}

export async function deleteExpense(sheetRow: number): Promise<void> {
  if (!SHEETS_CONFIG.scriptUrl) {
    throw new Error("Google Script URL not configured.");
  }

  await getViaScript({
    action: "deleteExpense",
    sheetRow: String(sheetRow),
  });
}

export async function addSubExpense(
  parentExpenseName: string,
  name: string,
  amount: number,
  participants: string[] = []
): Promise<void> {
  if (!SHEETS_CONFIG.scriptUrl) {
    throw new Error("Google Script URL not configured.");
  }

  await getViaScript({
    action: "addSubExpense",
    parentExpenseName,
    name,
    amount: String(amount),
    participants: formatParticipantsList(participants),
  });
}

export async function deleteSubExpense(sheetRow: number): Promise<void> {
  if (!SHEETS_CONFIG.scriptUrl) {
    throw new Error("Google Script URL not configured.");
  }

  await getViaScript({
    action: "deleteSubExpense",
    sheetRow: String(sheetRow),
  });
}
