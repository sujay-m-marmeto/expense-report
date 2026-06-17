import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export function Select({ label, options, className = "", id, ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-lavender-800/80"
      >
        {label}
      </label>
      <select
        id={selectId}
        className={`
          w-full rounded-xl border border-lavender-200/80 bg-white/90 px-4 py-3
          text-lavender-900 outline-none transition-all appearance-none
          focus:border-lavender-400 focus:ring-2 focus:ring-lavender-300/50
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
