interface ParticipantSelectorProps {
  travellers: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

export function ParticipantSelector({
  travellers,
  selected,
  onChange,
  label = "Split between",
}: ParticipantSelectorProps) {
  const allSelected = travellers.length > 0 && selected.length === travellers.length;

  const toggleAll = () => {
    onChange(allSelected ? [] : [...travellers]);
  };

  const togglePerson = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((n) => n !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-lavender-800">{label}</span>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-semibold text-lavender-600 hover:text-lavender-800"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label={label}>
        {travellers.map((name) => {
          const isSelected = selected.includes(name);
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => togglePerson(name)}
                className={`
                  rounded-xl px-3 py-1.5 text-sm font-medium transition-all
                  ${isSelected
                    ? "bg-lavender-600 text-white shadow-sm shadow-lavender-400/30"
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
        <p className="mt-2 text-xs text-rose-600">Select at least one person</p>
      )}
    </div>
  );
}
