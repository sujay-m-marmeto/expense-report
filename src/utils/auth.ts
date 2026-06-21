import type { Traveller } from "../types";

export const AUTH_SESSION_KEY = "goa-auth-session";

const ADMIN_USERS = ["sujay", "dhruva"];

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function isAdminUser(name: string): boolean {
  return ADMIN_USERS.includes(normalizeName(name));
}

export function travellerRequiresPassword(name: string, travellers: Traveller[]): boolean {
  if (!isAdminUser(name)) return false;
  const traveller = travellers.find((t) => t.name === name);
  return traveller?.requiresPassword ?? false;
}

export function setAuthSession(name: string) {
  sessionStorage.setItem(AUTH_SESSION_KEY, name.trim());
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function isAuthenticatedAdmin(name: string): boolean {
  if (!isAdminUser(name)) return false;
  const auth = sessionStorage.getItem(AUTH_SESSION_KEY);
  return Boolean(auth && normalizeName(auth) === normalizeName(name));
}

export function canDeleteExpenses(name: string): boolean {
  return isAuthenticatedAdmin(name);
}

export function canAutoLogin(name: string, travellers: Traveller[]): boolean {
  if (!travellers.some((t) => t.name === name)) return false;
  if (!travellerRequiresPassword(name, travellers)) return true;
  return isAuthenticatedAdmin(name);
}
