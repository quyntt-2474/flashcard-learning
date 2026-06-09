'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Card } from '@/services/api';
import { cardsApi } from '@/services/api';
import CardForm from '@/components/CardForm/CardForm';

interface Props {
  cards: Card[];
  deckId: number;
  isPreloaded: boolean;
}

export default function CardList({ cards, deckId, isPreloaded }: Props) {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: cardsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deckCards', deckId] });
      queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
    },
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Cards</h2>
        {!isPreloaded && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-sm px-3 py-1.5 rounded-md border border-black/20 hover:bg-black/5 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add card'}
          </button>
        )}
      </div>

      {showForm && (
        <CardForm
          deckId={deckId}
          onDone={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['deckCards', deckId] });
            queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
          }}
        />
      )}

      {cards.length === 0 ? (
        <p className="text-sm text-foreground/50">No cards yet.</p>
      ) : (
        <ul className="divide-y divide-black/5 rounded-xl border border-black/10 overflow-hidden">
          {cards.map((card) => (
            <li key={card.id} className="flex items-center gap-4 px-4 py-3 bg-white">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{card.front}</p>
                <p className="text-xs text-foreground/60 truncate">{card.back}</p>
              </div>
              {card.isMastered && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium flex-shrink-0">
                  ✓ Mastered
                </span>
              )}
              {!isPreloaded && (
                <button
                  onClick={() => deleteMutation.mutate(card.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 flex-shrink-0"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
