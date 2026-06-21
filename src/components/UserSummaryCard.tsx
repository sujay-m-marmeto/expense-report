import type { PersonDues } from "../types";
import { formatCurrency } from "../utils/calculations";
import { Card } from "./Card";

interface UserSummaryCardProps {
  dues: PersonDues;
  onViewDetails?: () => void;
}

export function UserSummaryCard({ dues, onViewDetails }: UserSummaryCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-lavender-500/80">
            Your balance
          </p>
          {dues.totalOwes > 0 && dues.totalGetsBack > 0 ? (
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-sm font-bold text-rose-600">
                Owe {formatCurrency(dues.totalOwes)}
              </span>
              <span className="text-sm font-bold text-emerald-600">
                Get {formatCurrency(dues.totalGetsBack)}
              </span>
            </div>
          ) : dues.totalOwes > 0 ? (
            <p className="mt-1 text-lg font-bold text-rose-600">
              You owe {formatCurrency(dues.totalOwes)}
            </p>
          ) : dues.totalGetsBack > 0 ? (
            <p className="mt-1 text-lg font-bold text-emerald-600">
              You get back {formatCurrency(dues.totalGetsBack)}
            </p>
          ) : (
            <p className="mt-1 text-lg font-bold text-emerald-600">All settled!</p>
          )}
        </div>
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="shrink-0 min-h-11 rounded-xl bg-lavender-100 px-3 py-2.5 text-xs font-semibold text-lavender-700 transition-colors hover:bg-lavender-200 touch-manipulation"
          >
            Details
          </button>
        )}
      </div>
    </Card>
  );
}
