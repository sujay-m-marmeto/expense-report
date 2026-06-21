/**
 * Google Apps Script for Goa Expenses
 *
 * Setup:
 * 1. Create a Google Sheet with tabs:
 *    - "Expenses" with headers: Name | Amount | Paid By | Date | Participants
 *    - "Travellers" with headers: Name | Phone
 *    - "Splits" with headers: Expense | Person | Amount
 *    - "SubExpenses" with headers: Parent Expense | Name | Amount | Participants
 * 2. Extensions > Apps Script > paste this code
 * 3. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL to VITE_GOOGLE_SCRIPT_URL in .env
 */

const EXPENSES_SHEET = "Expenses";
const TRAVELLERS_SHEET = "Travellers";
const SPLITS_SHEET = "Splits";
const SUB_EXPENSES_SHEET = "SubExpenses";

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "expenses") {
    const sheet = ss.getSheetByName(EXPENSES_SHEET);
    const rows = sheet ? sheet.getDataRange().getValues() : [];
    return jsonResponse({ rows: rows });
  }

  if (action === "travellers") {
    const sheet = ss.getSheetByName(TRAVELLERS_SHEET);
    const rows = sheet ? sheet.getDataRange().getValues() : [];
    return jsonResponse({ rows: rows });
  }

  if (action === "splits") {
    const sheet = ss.getSheetByName(SPLITS_SHEET);
    const rows = sheet ? sheet.getDataRange().getValues() : [];
    return jsonResponse({ rows: rows });
  }

  if (action === "subExpenses") {
    const sheet = ss.getSheetByName(SUB_EXPENSES_SHEET);
    const rows = sheet ? sheet.getDataRange().getValues() : [];
    return jsonResponse({ rows: rows });
  }

  if (action === "updateExpense") {
    const sheet = ss.getSheetByName(EXPENSES_SHEET);
    if (!sheet) {
      return jsonResponse({ error: "Expenses sheet not found" });
    }

    const sheetRow = Number(e.parameter.sheetRow);
    if (!sheetRow || sheetRow < 2) {
      return jsonResponse({ error: "Invalid sheet row" });
    }

    const newName = String(e.parameter.name).trim();
    const oldName = String(e.parameter.oldName || "").trim();

    sheet.getRange(sheetRow, 1).setValue(newName);
    sheet.getRange(sheetRow, 2).setValue(Number(e.parameter.amount));
    sheet.getRange(sheetRow, 5).setValue(String(e.parameter.participants || "").trim());

    if (oldName && oldName.toLowerCase() !== newName.toLowerCase()) {
      renameExpenseInRelatedSheets(ss, oldName, newName);
    }

    return jsonResponse({ success: true });
  }

  if (action === "deleteExpense") {
    const sheet = ss.getSheetByName(EXPENSES_SHEET);
    if (!sheet) {
      return jsonResponse({ error: "Expenses sheet not found" });
    }

    const sheetRow = Number(e.parameter.sheetRow);
    if (!sheetRow || sheetRow < 2) {
      return jsonResponse({ error: "Invalid sheet row" });
    }

    const expenseName = String(sheet.getRange(sheetRow, 1).getValue()).trim();
    sheet.deleteRow(sheetRow);

    if (expenseName) {
      deleteRelatedExpenseData(ss, expenseName);
    }

    return jsonResponse({ success: true });
  }

  if (action === "addSubExpense") {
    const parentExpenseName = String(e.parameter.parentExpenseName || "").trim();
    const name = String(e.parameter.name || "").trim();
    const amount = Number(e.parameter.amount);

    if (!parentExpenseName || !name) {
      return jsonResponse({ error: "Parent expense and item name are required" });
    }
    if (!amount || amount <= 0) {
      return jsonResponse({ error: "Invalid amount" });
    }

    const participants = String(e.parameter.participants || "").trim();

    let sheet = ss.getSheetByName(SUB_EXPENSES_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(SUB_EXPENSES_SHEET);
      sheet.appendRow(["Parent Expense", "Name", "Amount", "Participants"]);
    }

    sheet.appendRow([parentExpenseName, name, amount, participants]);
    syncParentExpenseTotal(ss, parentExpenseName);

    return jsonResponse({ success: true });
  }

  if (action === "deleteSubExpense") {
    const sheet = ss.getSheetByName(SUB_EXPENSES_SHEET);
    if (!sheet) {
      return jsonResponse({ error: "SubExpenses sheet not found" });
    }

    const sheetRow = Number(e.parameter.sheetRow);
    if (!sheetRow || sheetRow < 2) {
      return jsonResponse({ error: "Invalid sheet row" });
    }

    const parentExpenseName = String(sheet.getRange(sheetRow, 1).getValue()).trim();
    sheet.deleteRow(sheetRow);

    if (parentExpenseName) {
      syncParentExpenseTotal(ss, parentExpenseName);
    }

    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: "Invalid action" });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (data.action === "addExpense") {
    let sheet = ss.getSheetByName(EXPENSES_SHEET);

    if (!sheet) {
      sheet = ss.insertSheet(EXPENSES_SHEET);
      sheet.appendRow(["Name", "Amount", "Paid By", "Date", "Participants"]);
    }

    sheet.appendRow([
      data.name,
      data.amount,
      data.paidBy,
      data.date || new Date().toISOString().split("T")[0],
      String(data.participants || "").trim(),
    ]);

    return jsonResponse({ success: true });
  }

  if (data.action === "updateExpense") {
    const sheet = ss.getSheetByName(EXPENSES_SHEET);
    if (!sheet) {
      return jsonResponse({ error: "Expenses sheet not found" });
    }

    const sheetRow = Number(data.sheetRow || data.rowIndex + 2);
    const newName = String(data.name).trim();
    const oldName = String(data.oldName || "").trim();

    sheet.getRange(sheetRow, 1).setValue(newName);
    sheet.getRange(sheetRow, 2).setValue(Number(data.amount));
    sheet.getRange(sheetRow, 5).setValue(String(data.participants || "").trim());

    if (oldName && oldName.toLowerCase() !== newName.toLowerCase()) {
      renameExpenseInRelatedSheets(ss, oldName, newName);
    }

    return jsonResponse({ success: true });
  }

  if (data.action === "saveSplit") {
    let sheet = ss.getSheetByName(SPLITS_SHEET);

    if (!sheet) {
      sheet = ss.insertSheet(SPLITS_SHEET);
      sheet.appendRow(["Expense", "Person", "Amount"]);
    }

    const rows = sheet.getDataRange().getValues();
    const expenseName = String(data.expenseName).trim();
    const personName = String(data.personName).trim();
    const amount = Number(data.amount);

    let found = false;
    for (let i = 1; i < rows.length; i++) {
      const rowExpense = String(rows[i][0]).trim().toLowerCase();
      const rowPerson = String(rows[i][1]).trim().toLowerCase();
      if (
        rowExpense === expenseName.toLowerCase() &&
        rowPerson === personName.toLowerCase()
      ) {
        if (amount <= 0) {
          sheet.deleteRow(i + 1);
        } else {
          sheet.getRange(i + 1, 3).setValue(amount);
        }
        found = true;
        break;
      }
    }

    if (!found && amount > 0) {
      sheet.appendRow([expenseName, personName, amount]);
    }

    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: "Invalid action" });
}

function deleteRelatedExpenseData(ss, expenseName) {
  const expenseKey = String(expenseName).trim().toLowerCase();

  const splitsSheet = ss.getSheetByName(SPLITS_SHEET);
  if (splitsSheet) {
    const splitRows = splitsSheet.getDataRange().getValues();
    for (let i = splitRows.length - 1; i >= 1; i--) {
      if (String(splitRows[i][0]).trim().toLowerCase() === expenseKey) {
        splitsSheet.deleteRow(i + 1);
      }
    }
  }

  const subSheet = ss.getSheetByName(SUB_EXPENSES_SHEET);
  if (subSheet) {
    const subRows = subSheet.getDataRange().getValues();
    for (let i = subRows.length - 1; i >= 1; i--) {
      if (String(subRows[i][0]).trim().toLowerCase() === expenseKey) {
        subSheet.deleteRow(i + 1);
      }
    }
  }
}

function renameExpenseInRelatedSheets(ss, oldName, newName) {
  const splitsSheet = ss.getSheetByName(SPLITS_SHEET);
  if (splitsSheet) {
    const splitRows = splitsSheet.getDataRange().getValues();
    for (let i = 1; i < splitRows.length; i++) {
      if (String(splitRows[i][0]).trim().toLowerCase() === oldName.toLowerCase()) {
        splitsSheet.getRange(i + 1, 1).setValue(newName);
      }
    }
  }

  const subSheet = ss.getSheetByName(SUB_EXPENSES_SHEET);
  if (subSheet) {
    const subRows = subSheet.getDataRange().getValues();
    for (let i = 1; i < subRows.length; i++) {
      if (String(subRows[i][0]).trim().toLowerCase() === oldName.toLowerCase()) {
        subSheet.getRange(i + 1, 1).setValue(newName);
      }
    }
  }
}

function syncParentExpenseTotal(ss, parentExpenseName) {
  const subSheet = ss.getSheetByName(SUB_EXPENSES_SHEET);
  const expenseSheet = ss.getSheetByName(EXPENSES_SHEET);
  if (!subSheet || !expenseSheet) return;

  const parentKey = String(parentExpenseName).trim().toLowerCase();
  const subRows = subSheet.getDataRange().getValues();
  let total = 0;

  for (let i = 1; i < subRows.length; i++) {
    if (String(subRows[i][0]).trim().toLowerCase() === parentKey) {
      total += Number(subRows[i][2]) || 0;
    }
  }

  const expenseRows = expenseSheet.getDataRange().getValues();
  for (let i = 1; i < expenseRows.length; i++) {
    if (String(expenseRows[i][0]).trim().toLowerCase() === parentKey) {
      expenseSheet.getRange(i + 1, 2).setValue(total);
      break;
    }
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
