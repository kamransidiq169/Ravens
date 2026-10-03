export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-svh items-center justify-center">
      <span className="sr-only">Loading</span>
      <span aria-hidden="true" className="h-px w-24 animate-pulse bg-ink" />
    </div>
  );
}
