import { SHEETS_CONFIG } from "../config";
import type { Expense, Traveller } from "../types";

const DEMO_TRAVELLERS: Traveller[] = [
  { id: "1", name: "Sujay", phone: "+91 98765 43210" },
  { id: "2", name: "Rahul", phone: "+91 98765 43211" },
  { id: "3", name: "Amit", phone: "+91 98765 43212" },
  { id: "4", name: "Vikram", phone: "+91 98765 43213" },
  { id: "5", name: "Arjun", phone: "+91 98765 43214" },
  { id: "6", name: "Karan", phone: "+91 98765 43215" },
];

const DEMO_EXPENSES: Expense[] = [
  { id: "1", name: "Hotel Stay", amount: 12000, paidBy: "Sujay", date: "2026-06-15" },
  { id: "2", name: "Dinner at Fisherman's Wharf", amount: 4500, paidBy: "Rahul", date: "2026-06-15" },
  { id: "3", name: "Scooter Rental", amount: 2400, paidBy: "Amit", date: "2026-06-16" },
  { id: "4", name: "Beach Shack Lunch", amount: 3200, paidBy: "Vikram", date: "2026-06-16" },
  { id: "5", name: "Water Sports", amount: 6000, paidBy: "Arjun", date: "2026-06-17" },
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

  return {
    id: `exp-${index}`,
    name,
    amount,
    paidBy,
    date,
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

async function fetchViaScript(action: "expenses" | "travellers"): Promise<SheetRow[]> {
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

export async function addExpense(
  name: string,
  amount: number,
  paidBy: string
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
    }),
  });

  // no-cors returns opaque response; assume success if no network error
  void response;
}
