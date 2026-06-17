/**
 * Google Apps Script for Goa Expenses
 *
 * Setup:
 * 1. Create a Google Sheet with three tabs:
 *    - "Expenses" with headers: Name | Amount | Paid By | Date
 *    - "Travellers" with headers: Name | Phone
 *    - "Splits" with headers: Expense | Person | Amount
 * 2. Extensions > Apps Script > paste this code
 * 3. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL to VITE_GOOGLE_SCRIPT_URL in .env
 */

const EXPENSES_SHEET = "Expenses";
const TRAVELLERS_SHEET = "Travellers";
const SPLITS_SHEET = "Splits";

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

  return jsonResponse({ error: "Invalid action" });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (data.action === "addExpense") {
    let sheet = ss.getSheetByName(EXPENSES_SHEET);

    if (!sheet) {
      sheet = ss.insertSheet(EXPENSES_SHEET);
      sheet.appendRow(["Name", "Amount", "Paid By", "Date"]);
    }

    sheet.appendRow([
      data.name,
      data.amount,
      data.paidBy,
      data.date || new Date().toISOString().split("T")[0],
    ]);

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

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
