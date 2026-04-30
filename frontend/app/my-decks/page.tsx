'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { decksApi, categoriesApi } from '@/services/api';
import Link from 'next/link';
import DeckForm from '@/components/DeckForm/DeckForm';

export default function MyDecksPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  // Aggregate all decks across categories that belong to the current client
  // We fetch decks per category and collect non-preloaded ones
  const {
    data: allDecks = [],
    isLoading,
  } = useQuery({
    queryKey: ['my-decks', categories.map((c) => c.id)],
    queryFn: async () => {
      const results = await Promise.all(
        categories.map((cat) => categoriesApi.decks(cat.id).catch(() => [])),
      );
      return results.flat().filter((d) => !d.isPreloaded);
    },
    enabled: categories.length > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: decksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-decks'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Decks</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ New Deck'}
        </button>
      </div>

      {showForm && (
        <DeckForm onDone={() => setShowForm(false)} />
      )}

      {isLoading ? (
        <p className="text-foreground/50 text-sm">Loading…</p>
      ) : allDecks.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-foreground/50">You haven{"'"}t created any decks yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm underline text-foreground/70"
          >
            Create your first deck
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {allDecks.map((deck) => (
            <li
              key={deck.id}
              className="flex items-center gap-4 rounded-xl border border-black/10 p-4 bg-white"
            >
              <div className="flex-1 min-w-0">
                <Link href={`/decks/${deck.id}`} className="font-semibold hover:underline">
                  {deck.title}
                </Link>
                {deck.description && (
                  <p className="text-xs text-foreground/50 truncate">{deck.description}</p>
                )}
                <p className="text-xs text-foreground/40 mt-0.5">
                  {deck.cardCount} cards · {deck.dueCount} due
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/decks/${deck.id}`}
                  className="text-xs px-3 py-1.5 rounded-md border border-black/20 hover:bg-black/5"
                >
                  View
                </Link>
                <button
                  onClick={() => deleteMutation.mutate(deck.id)}
                  className="text-xs px-3 py-1.5 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
