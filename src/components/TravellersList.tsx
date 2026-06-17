import type { Traveller } from "../types";
import { Card } from "./Card";

interface TravellersListProps {
  travellers: Traveller[];
}

function formatPhoneLink(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function TravellersList({ travellers }: TravellersListProps) {
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
      {travellers.map((traveller, index) => (
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
                  <a
                    href={formatPhoneLink(traveller.phone)}
                    className="mt-0.5 text-sm text-lavender-600 hover:text-lavender-800 transition-colors"
                  >
                    {traveller.phone}
                  </a>
                ) : (
                  <p className="mt-0.5 text-sm text-lavender-500/70">No phone</p>
                )}
              </div>
              {traveller.phone && (
                <a
                  href={formatPhoneLink(traveller.phone)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender-600 text-white shadow-md shadow-lavender-400/30 transition-all hover:bg-lavender-700 active:scale-95"
                  aria-label={`Call ${traveller.name}`}
                >
                  📞
                </a>
              )}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
