import { useState, useEffect } from "react";
import type { Traveller } from "../types";
import { Button } from "./Button";

interface DuesNameModalProps {
  travellers: Traveller[];
  initialName?: string;
  onConfirm: (name: string) => void;
  onCancel?: () => void;
}

export function DuesNameModal({
  travellers,
  initialName,
  onConfirm,
  onCancel,
}: DuesNameModalProps) {
  const [selected, setSelected] = useState(initialName ?? travellers[0]?.name ?? "");

  useEffect(() => {
    if (initialName) setSelected(initialName);
  }, [initialName]);

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
              Who are you?
            </h2>
            <p className="mt-1 text-sm text-lavender-600/70">
              Select your name to see your expenses & dues
            </p>
          </div>
          {onCancel && (
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

        <ul className="flex flex-col gap-2 mb-6" aria-label="Select your name">
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
                  {isSelected && (
                    <span className="ml-auto text-lavender-600" aria-hidden="true">✓</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <Button fullWidth onClick={() => onConfirm(selected)} disabled={!selected}>
          Continue
        </Button>
        {onCancel && (
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
