import { useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { AddToHomeModal } from "./AddToHomeModal";

export function AddToHomeButton() {
  const { canInstall, isIOS, hasNativePrompt, promptInstall } = useInstallPrompt();
  const [showModal, setShowModal] = useState(false);

  if (!canInstall) return null;

  const handleClick = async () => {
    if (hasNativePrompt && !isIOS) {
      const installed = await promptInstall();
      if (!installed) setShowModal(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-lavender-700 shadow-sm shadow-lavender-300/20 border border-white/60 transition-all hover:bg-white active:scale-95"
        aria-label="Add to home screen"
      >
        <span aria-hidden="true">📲</span>
        <span>Add to Home</span>
      </button>

      {showModal && (
        <AddToHomeModal
          isIOS={isIOS}
          hasNativePrompt={hasNativePrompt}
          onClose={() => setShowModal(false)}
          onInstall={async () => {
            await promptInstall();
          }}
        />
      )}
    </>
  );
}
