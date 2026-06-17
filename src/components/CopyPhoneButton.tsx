import { useState } from "react";

function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text.replace(/\s+/g, ""));
    return true;
  } catch {
    return false;
  }
}

interface CopyPhoneButtonProps {
  phone: string;
  label: string;
  size?: "sm" | "md";
}

export function CopyPhoneButton({ phone, label, size = "md" }: CopyPhoneButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(phone);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`
        flex shrink-0 items-center justify-center rounded-xl shadow-md transition-all active:scale-95
        ${sizeClasses}
        ${copied
          ? "bg-emerald-500 text-white shadow-emerald-400/30"
          : "bg-lavender-600 text-white shadow-lavender-400/30 hover:bg-lavender-700"}
      `}
      aria-label={copied ? `Copied ${label}'s number` : `Copy ${label}'s number`}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}
