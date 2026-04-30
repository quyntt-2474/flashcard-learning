import Link from 'next/link';
import type { Category } from '@/services/api';

export default function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="flex items-center gap-4 rounded-xl border border-black/10 p-4 hover:shadow-md transition-shadow bg-white"
    >
      <span
        className="w-12 h-12 flex items-center justify-center rounded-full text-2xl flex-shrink-0"
        style={{ backgroundColor: `${category.color}22` }}
      >
        {category.icon}
      </span>
      <div className="min-w-0">
        <p className="font-semibold truncate">{category.name}</p>
        <p className="text-sm text-foreground/60">
          {category.deckCount} {category.deckCount === 1 ? 'deck' : 'decks'}
        </p>
      </div>
    </Link>
  );
}
