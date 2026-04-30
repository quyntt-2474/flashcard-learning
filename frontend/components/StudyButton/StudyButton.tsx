'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { sessionsApi } from '@/services/api';

interface Props {
  deckId: number;
  dueCount: number;
}

export default function StudyButton({ deckId, dueCount }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStudy = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await sessionsApi.create(deckId);
      router.push(`/study/${session.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not start session.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleStudy}
        disabled={loading || dueCount === 0}
        className="px-5 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-40 hover:bg-black/80 transition-colors"
      >
        {loading ? 'Starting…' : dueCount > 0 ? `Study Now (${dueCount})` : 'No cards due'}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
