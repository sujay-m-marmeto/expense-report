import { AddToHomeButton } from "./AddToHomeButton";
import { Button } from "./Button";

interface HeaderProps {
  currentUser?: string;
  onSwitchUser?: () => void;
}

export function Header({ currentUser, onSwitchUser }: HeaderProps) {
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
            {currentUser ? (
              <p className="text-sm text-lavender-700/70">
                Hi, <span className="font-semibold text-lavender-800">{currentUser}</span>
              </p>
            ) : (
              <p className="text-sm text-lavender-700/70">
                Split & track the boys&apos; trip
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {currentUser && onSwitchUser && (
            <Button variant="ghost" size="sm" onClick={onSwitchUser} className="!px-2 !py-1.5 text-xs">
              Switch
            </Button>
          )}
          <AddToHomeButton />
        </div>
      </div>
    </header>
  );
}
