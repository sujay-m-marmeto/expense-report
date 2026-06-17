import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg shadow-lavender-300/20 ${className}`}
    >
      {children}
    </div>
  );
}
