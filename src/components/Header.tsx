import { AddToHomeButton } from "./AddToHomeButton";

export function Header() {
  return (
    <header className="px-4 pt-6 pb-4 safe-area-top">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-md shadow-lavender-300/30"
            aria-hidden="true"
          >
            <span className="text-xl">🏖️</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-lavender-900 truncate">
              Goa Expenses
            </h1>
            <p className="text-sm text-lavender-700/70">
              Split & track the boys&apos; trip
            </p>
          </div>
        </div>
        <AddToHomeButton />
      </div>
    </header>
  );
}
