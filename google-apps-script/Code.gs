/**
 * Google Apps Script for Goa Expenses
 *
 * Setup:
 * 1. Create a Google Sheet with two tabs:
 *    - "Expenses" with headers: Name | Amount | Paid By | Date
 *    - "Travellers" with headers: Name | Phone
 * 2. Extensions > Apps Script > paste this code
 * 3. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL to VITE_GOOGLE_SCRIPT_URL in .env
 */

const EXPENSES_SHEET = "Expenses";
const TRAVELLERS_SHEET = "Travellers";

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

  return jsonResponse({ error: "Invalid action" });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === "addExpense") {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
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

  return jsonResponse({ error: "Invalid action" });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
