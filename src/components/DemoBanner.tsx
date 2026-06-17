import { Card } from "./Card";

interface DemoBannerProps {
  onDismiss?: () => void;
}

export function DemoBanner({ onDismiss }: DemoBannerProps) {
  return (
    <Card className="mb-4 p-3 border-lavender-300/50">
      <div className="flex items-start gap-2">
        <span className="text-sm" aria-hidden="true">📋</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-lavender-800">
            Demo mode — using sample data
          </p>
          <p className="mt-0.5 text-xs text-lavender-600/80 leading-relaxed">
            Connect Google Sheets via <code className="text-lavender-700">.env</code> to sync live data.
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-lavender-500 hover:text-lavender-700 text-sm"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </Card>
  );
}
