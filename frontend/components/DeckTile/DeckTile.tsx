import Link from 'next/link';
import type { Deck } from '@/services/api';

export default function DeckTile({ deck }: { deck: Deck }) {
  const hasDue = deck.dueCount > 0;

  return (
    <Link
      href={`/decks/${deck.id}`}
      className="flex flex-col gap-2 rounded-xl border border-black/10 p-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold">{deck.title}</p>
        {hasDue && (
          <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
            {deck.dueCount} due
          </span>
        )}
      </div>
      {deck.description && (
        <p className="text-sm text-foreground/60 line-clamp-2">{deck.description}</p>
      )}
      <div className="flex gap-3 text-xs text-foreground/50 mt-auto pt-1">
        <span>{deck.cardCount} cards</span>
        <span>{deck.masteredCount} mastered</span>
      </div>
    </Link>
  );
}
