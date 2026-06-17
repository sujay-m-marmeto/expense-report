import { useState } from "react";
import type { Traveller } from "../types";
import { Card } from "./Card";

interface TravellersListProps {
  travellers: Traveller[];
}

function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text.replace(/\s+/g, ""));
    return true;
  } catch {
    return false;
  }
}

export function TravellersList({ travellers }: TravellersListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (traveller: Traveller) => {
    const success = await copyToClipboard(traveller.phone);
    if (success) {
      setCopiedId(traveller.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (travellers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lavender-600/80">No travellers found.</p>
        <p className="mt-1 text-sm text-lavender-500/70">
          Add names in your Google Sheet.
        </p>
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Travellers list">
      {travellers.map((traveller, index) => {
        const isCopied = copiedId === traveller.id;

        return (
          <li
            key={traveller.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lavender-100 text-lg font-bold text-lavender-700"
                  aria-hidden="true"
                >
                  {traveller.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lavender-900">{traveller.name}</h3>
                  {traveller.phone ? (
                    <p className="mt-0.5 text-sm text-lavender-600">{traveller.phone}</p>
                  ) : (
                    <p className="mt-0.5 text-sm text-lavender-500/70">No phone</p>
                  )}
                </div>
                {traveller.phone && (
                  <button
                    type="button"
                    onClick={() => handleCopy(traveller)}
                    className={`
                      flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                      shadow-md transition-all active:scale-95
                      ${isCopied
                        ? "bg-emerald-500 text-white shadow-emerald-400/30"
                        : "bg-lavender-600 text-white shadow-lavender-400/30 hover:bg-lavender-700"}
                    `}
                    aria-label={isCopied ? `Copied ${traveller.name}'s number` : `Copy ${traveller.name}'s number`}
                  >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                  </button>
                )}
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
