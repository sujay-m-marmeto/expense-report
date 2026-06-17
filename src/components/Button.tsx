import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variants = {
  primary:
    "bg-lavender-600 text-white shadow-md shadow-lavender-400/40 hover:bg-lavender-700 active:scale-[0.98]",
  secondary:
    "bg-white/90 text-lavender-700 border border-lavender-200 hover:bg-white active:scale-[0.98]",
  ghost:
    "bg-transparent text-lavender-700 hover:bg-lavender-100/60 active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
