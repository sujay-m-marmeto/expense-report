export const SHEETS_CONFIG = {
  scriptUrl: import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined,
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY as string | undefined,
  sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID as string | undefined,
};

export function isSheetsConfigured(): boolean {
  return Boolean(SHEETS_CONFIG.scriptUrl) || Boolean(
    SHEETS_CONFIG.apiKey && SHEETS_CONFIG.sheetId
  );
}
