'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { decksApi, categoriesApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

interface Props {
  onDone?: () => void;
}

export default function DeckForm({ onDone }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      decksApi.create({ title, description: description || undefined, categoryId: categoryId as number }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-decks'] });
      onDone?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;
    createMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-black/10 p-4 bg-white space-y-3">
      <h3 className="font-semibold">New Deck</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Name *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Travel Vocabulary"
          className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Category *</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          required
          className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30 bg-white"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Optional description"
          className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30 resize-none"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={createMutation.isPending || !title.trim() || !categoryId}
          className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-40"
        >
          {createMutation.isPending ? 'Creating…' : 'Create Deck'}
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
        <p className="text-xs text-rose-600">Failed to create deck. Please try again.</p>
      )}
    </form>
  );
}
