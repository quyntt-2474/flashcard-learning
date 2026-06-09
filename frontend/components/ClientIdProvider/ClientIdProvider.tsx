'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { startTransition, useEffect, useState } from 'react';
import { getOrCreateClientId } from '@/lib/clientId';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

export default function ClientIdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Ensure clientId is initialised in localStorage before first render
    getOrCreateClientId();
    startTransition(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
