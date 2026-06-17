import { Button } from "./Button";
import { Card } from "./Card";

interface AddToHomeModalProps {
  isIOS: boolean;
  hasNativePrompt: boolean;
  onClose: () => void;
  onInstall: () => Promise<void>;
}

export function AddToHomeModal({
  isIOS,
  hasNativePrompt,
  onClose,
  onInstall,
}: AddToHomeModalProps) {
  const handleInstall = async () => {
    if (hasNativePrompt) {
      await onInstall();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-home-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-lavender-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:m-4 safe-area-bottom">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="add-to-home-title" className="text-lg font-bold text-lavender-900">
            Add to Home Screen
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lavender-500 hover:bg-lavender-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <Card className="mb-5 p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lavender-100 text-2xl"
              aria-hidden="true"
            >
              🏖️
            </div>
            <div>
              <p className="font-semibold text-lavender-900">Goa Expenses</p>
              <p className="text-sm text-lavender-600/80">
                Open instantly from your home screen
              </p>
            </div>
          </div>
        </Card>

        {isIOS ? (
          <ol className="flex flex-col gap-3 text-sm text-lavender-800">
            <li className="flex gap-3 items-start">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lavender-600 text-xs font-bold text-white"
                aria-hidden="true"
              >
                1
              </span>
              <span>
                Tap the <strong>Share</strong> button in Safari
                <span className="ml-1 inline-block rounded bg-lavender-100 px-1.5 py-0.5 text-xs font-semibold">
                  ⬆️ Share
                </span>
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lavender-600 text-xs font-bold text-white"
                aria-hidden="true"
              >
                2
              </span>
              <span>
                Scroll down and tap <strong>Add to Home Screen</strong>
                <span className="ml-1 inline-block rounded bg-lavender-100 px-1.5 py-0.5 text-xs font-semibold">
                  ➕ Add to Home Screen
                </span>
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lavender-600 text-xs font-bold text-white"
                aria-hidden="true"
              >
                3
              </span>
              <span>Tap <strong>Add</strong> in the top right corner</span>
            </li>
          </ol>
        ) : (
          <p className="text-sm text-lavender-700/80 leading-relaxed">
            Install this app on your home screen for quick access — just like a native app,
            without opening the browser every time.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            {isIOS || !hasNativePrompt ? "Got it" : "Cancel"}
          </Button>
          {hasNativePrompt && !isIOS && (
            <Button fullWidth onClick={handleInstall}>
              Install App
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
