import { signIn } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Could not start the sign-in flow. Please try again.",
  OAuthCallback: "Facebook returned an error during the redirect. Please try again.",
  OAuthCreateAccount: "Could not link this Facebook account.",
  AccessDenied: "Access denied. You may not have permission to sign in.",
  Configuration: "Authentication is not configured correctly. Contact an administrator.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl = "/dashboard", error } = await searchParams;

  async function loginWithFacebook() {
    "use server";
    await signIn("facebook", { redirectTo: callbackUrl });
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <section
        aria-labelledby="login-heading"
        className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h1 id="login-heading" className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Connect your Facebook account to manage your pages.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {ERROR_MESSAGES[error] ?? "Something went wrong. Please try again."}
          </p>
        ) : null}

        <form action={loginWithFacebook} className="mt-6">
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center rounded-md bg-[#1877F2] px-4 text-sm font-medium text-white transition-colors hover:bg-[#166FE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1877F2] disabled:opacity-60"
          >
            Continue with Facebook
          </button>
        </form>
      </section>
    </main>
  );
}
