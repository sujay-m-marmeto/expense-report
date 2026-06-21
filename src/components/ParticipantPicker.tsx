import type { Traveller } from "../types";

interface ParticipantPickerProps {
  travellers: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

export function ParticipantPicker({
  travellers,
  selected,
  onChange,
  label = "Split among",
}: ParticipantPickerProps) {
  const allSelected = travellers.length > 0 && selected.length === travellers.length;

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((n) => n !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const handleSelectAll = () => {
    onChange([...travellers]);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-lavender-800">{label}</span>
        <button
          type="button"
          onClick={allSelected ? handleDeselectAll : handleSelectAll}
          className="text-xs font-semibold text-lavender-600 hover:text-lavender-800"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <ul className="flex flex-wrap gap-1.5" aria-label={label}>
        {travellers.map((name) => {
          const isSelected = selected.includes(name);
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => toggle(name)}
                className={`
                  rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all
                  ${isSelected
                    ? "bg-lavender-600 text-white shadow-sm"
                    : "bg-lavender-50 text-lavender-700 border border-lavender-200 hover:border-lavender-300"}
                `}
                aria-pressed={isSelected}
              >
                {name}
              </button>
            </li>
          );
        })}
      </ul>
      {selected.length === 0 && (
        <p className="mt-1.5 text-xs text-rose-600">Select at least one person</p>
      )}
    </div>
  );
}

export function travellerNamesFromList(travellers: Traveller[] | string[]): string[] {
  if (travellers.length === 0) return [];
  return typeof travellers[0] === "string"
    ? (travellers as string[])
    : (travellers as Traveller[]).map((t) => t.name);
}
