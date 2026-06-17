export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-lavender-300 border-t-lavender-600"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-lavender-700/80">{message}</p>
    </div>
  );
}
