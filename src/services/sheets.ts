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

function parseExpenseRow(row: string[], index: number): Expense | null {
  if (!row[0]?.trim()) return null;
  const amount = parseFloat(String(row[1]).replace(/[^\d.]/g, ""));
  if (isNaN(amount)) return null;
  return {
    id: `exp-${index}`,
    name: row[0].trim(),
    amount,
    paidBy: row[2]?.trim() || "Unknown",
    date: row[3]?.trim() || undefined,
  };
}

function parseTravellerRow(row: string[], index: number): Traveller | null {
  if (!row[0]?.trim()) return null;
  return {
    id: `trav-${index}`,
    name: row[0].trim(),
    phone: row[1]?.trim() || "",
  };
}

async function fetchViaScript(action: "expenses" | "travellers"): Promise<string[][]> {
  const url = `${SHEETS_CONFIG.scriptUrl}?action=${action}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${action}`);
  const data = await response.json();
  return data.rows ?? [];
}

async function fetchViaApi(range: string): Promise<string[][]> {
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
