'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api';

export default function DueBanner() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  if (!categories) return null;

  // Collect all decks with due cards by fetching each category's decks
  // This is a simple aggregation — for now surface due count from categories
  // Actual due counts come from DeckTiles on the category pages
  return null; // Will render per-deck due badges on deck pages
}
