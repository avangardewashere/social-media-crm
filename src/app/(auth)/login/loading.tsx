export default function LoginLoading() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="h-6 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-6 h-11 w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <span className="sr-only">Loading sign-in</span>
      </div>
    </main>
  );
}
