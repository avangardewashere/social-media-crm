import type { ConnectedPage } from "@/types/db";

const placeholderPages: ConnectedPage[] = [];

export default function AccountsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Accounts</h1>
      <p className="mt-2 text-sm text-gray-600">
        Placeholder page for managing connected social media pages.
      </p>
      <p className="mt-2 text-xs text-gray-500">{placeholderPages.length} pages connected</p>
    </main>
  );
}
