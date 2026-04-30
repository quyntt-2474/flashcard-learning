'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api';
import DeckTile from '@/components/DeckTile/DeckTile';
import Skeleton from '@/components/Skeleton/Skeleton';
import Link from 'next/link';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();

  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['categoryDecks', id],
    queryFn: () => categoriesApi.decks(Number(id)),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-sm text-foreground/50 hover:text-foreground">
          ← Home
        </Link>
      </div>

      <section>
        <h1 className="text-xl font-bold mb-4">Decks</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <p className="text-foreground/50 text-sm">No decks available in this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {decks.map((deck) => (
              <DeckTile key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
