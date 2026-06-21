import { useState, useEffect } from "react";
import type { Traveller } from "../types";
import { Button } from "./Button";
import { Input } from "./Input";

interface DuesNameModalProps {
  travellers: Traveller[];
  initialName?: string;
  onConfirm: (name: string) => void;
  onCancel?: () => void;
  requiresPassword?: (name: string) => boolean;
  verifyPassword?: (name: string, password: string) => Promise<void>;
}

export function DuesNameModal({
  travellers,
  initialName,
  onConfirm,
  onCancel,
  requiresPassword,
  verifyPassword,
}: DuesNameModalProps) {
  const [selected, setSelected] = useState(initialName ?? travellers[0]?.name ?? "");
  const [step, setStep] = useState<"select" | "password">("select");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialName) setSelected(initialName);
  }, [initialName]);

  const needsPassword = requiresPassword?.(selected) ?? false;

  const handleContinue = async () => {
    setError(null);

    if (step === "select") {
      if (!selected) return;
      if (needsPassword && verifyPassword) {
        setStep("password");
        setPassword("");
        return;
      }
      onConfirm(selected);
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setVerifying(true);
    try {
      if (verifyPassword) {
        await verifyPassword(selected, password);
      }
      onConfirm(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password");
    } finally {
      setVerifying(false);
    }
  };

  const handleBack = () => {
    setStep("select");
    setPassword("");
    setError(null);
  };

  const busy = verifying;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dues-name-title"
    >
      <div className="absolute inset-0 bg-lavender-900/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:m-4 safe-area-bottom">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="dues-name-title" className="text-lg font-bold text-lavender-900">
              {step === "password" ? "Enter password" : "Who are you?"}
            </h2>
            <p className="mt-1 text-sm text-lavender-600/70">
              {step === "password"
                ? `Sign in as ${selected}`
                : "Select your name to see your expenses & dues"}
            </p>
          </div>
          {onCancel && step === "select" && (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lavender-500 hover:bg-lavender-100 touch-manipulation"
              aria-label="Cancel"
            >
              ✕
            </button>
          )}
        </div>

        {step === "select" ? (
          <ul className="mb-6 flex flex-col gap-2" aria-label="Select your name">
            {travellers.map((traveller) => {
              const isSelected = selected === traveller.name;
              return (
                <li key={traveller.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(traveller.name)}
                    className={`
                      flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all
                      ${isSelected
                        ? "border-lavender-500 bg-lavender-50"
                        : "border-lavender-100 bg-white hover:border-lavender-200"}
                    `}
                  >
                    <span
                      className={`
                        flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold
                        ${isSelected ? "bg-lavender-600 text-white" : "bg-lavender-100 text-lavender-700"}
                      `}
                      aria-hidden="true"
                    >
                      {traveller.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-semibold text-lavender-900">{traveller.name}</span>
                    {traveller.requiresPassword && (
                      <span className="ml-auto text-xs font-medium text-lavender-500">🔒</span>
                    )}
                    {isSelected && !traveller.requiresPassword && (
                      <span className="ml-auto text-lavender-600" aria-hidden="true">✓</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mb-6">
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {error && (
          <p className="mb-4 text-sm font-medium text-red-600" role="alert">{error}</p>
        )}

        <Button fullWidth onClick={handleContinue} disabled={!selected || busy}>
          {busy ? "Checking..." : step === "password" ? "Sign in" : "Continue"}
        </Button>

        {step === "password" && (
          <button
            type="button"
            onClick={handleBack}
            disabled={busy}
            className="mt-3 w-full py-2.5 text-sm font-semibold text-lavender-600 hover:text-lavender-800 touch-manipulation disabled:opacity-50"
          >
            Back
          </button>
        )}

        {onCancel && step === "select" && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 w-full py-2.5 text-sm font-semibold text-lavender-600 hover:text-lavender-800 touch-manipulation"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
