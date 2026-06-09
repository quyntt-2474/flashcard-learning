'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api';
import CategoryTile from '@/components/CategoryTile/CategoryTile';
import DueBanner from '@/components/DueBanner/DueBanner';
import Skeleton from '@/components/Skeleton/Skeleton';

export default function HomePage() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-1">Learn English Vocabulary</h1>
        <p className="text-foreground/60 text-sm">
          Study flashcards with spaced repetition to build lasting vocabulary.
        </p>
      </section>

      <DueBanner />

      <section>
        <h2 className="text-lg font-semibold mb-3">Browse Categories</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-foreground/50 text-sm">No categories available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <CategoryTile key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

