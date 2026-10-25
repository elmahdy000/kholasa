"use client";

import { ErrorView } from "@/components/ui/ErrorView";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} onRetry={() => retry()} />;
}
