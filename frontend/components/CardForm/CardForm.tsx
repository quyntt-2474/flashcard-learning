'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { cardsApi } from '@/services/api';

interface Props {
  deckId: number;
  onDone?: () => void;
}

export default function CardForm({ deckId, onDone }: Props) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const createMutation = useMutation({
    mutationFn: () => cardsApi.create(deckId, { front, back }),
    onSuccess: () => {
      setFront('');
      setBack('');
      onDone?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    createMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-black/10 p-4 bg-white space-y-3">
      <h3 className="font-semibold text-sm">Add Card</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-foreground/70">Front (English) *</label>
          <input
            type="text"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            required
            placeholder="e.g. serendipity"
            className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-foreground/70">Back (Translation) *</label>
          <input
            type="text"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            required
            placeholder="e.g. sự tình cờ may mắn"
            className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending || !front.trim() || !back.trim()}
          className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-40"
        >
          {createMutation.isPending ? 'Adding…' : 'Add Card'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="px-4 py-2 rounded-lg border border-black/20 text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      {createMutation.isError && (
        <p className="text-xs text-rose-600">Failed to add card.</p>
      )}
    </form>
  );
}
