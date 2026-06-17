import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-lavender-800/80"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full rounded-xl border border-lavender-200/80 bg-white/90 px-4 py-3
          text-lavender-900 placeholder:text-lavender-400/60
          outline-none transition-all
          focus:border-lavender-400 focus:ring-2 focus:ring-lavender-300/50
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
