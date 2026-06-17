import type { TabId } from "../types";

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "expenses", label: "Expenses", icon: "💰" },
  { id: "split", label: "Split", icon: "⚖️" },
  { id: "payments", label: "Payments", icon: "📝" },
  { id: "travellers", label: "People", icon: "👥" },
];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/40 bg-white/85 backdrop-blur-lg safe-area-bottom"
      aria-label="Main navigation"
    >
      <div className="flex mx-auto max-w-lg">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-1 flex-col items-center gap-0.5 py-2 px-1
                transition-colors duration-200
                ${isActive ? "text-lavender-700" : "text-lavender-500/70"}
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-lg leading-none" aria-hidden="true">{tab.icon}</span>
              <span className={`text-[10px] font-semibold leading-tight ${isActive ? "text-lavender-700" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="mt-0.5 h-0.5 w-8 rounded-full bg-lavender-600"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
