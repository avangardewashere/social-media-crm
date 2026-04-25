"use client";

type LoginErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LoginError({ error, reset }: LoginErrorProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <section
        role="alert"
        className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        <h2 className="text-base font-semibold">Sign-in failed</h2>
        <p className="mt-1">{error.message || "Something went wrong during sign-in."}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex h-9 items-center rounded-md border border-red-300 bg-white px-3 text-sm font-medium text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
