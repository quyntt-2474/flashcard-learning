'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { decksApi } from '@/services/api';
import Link from 'next/link';
import StudyButton from '@/components/StudyButton/StudyButton';
import CardList from '@/components/CardList/CardList';
import Skeleton from '@/components/Skeleton/Skeleton';

export default function DeckPage() {
  const { id } = useParams<{ id: string }>();
  const deckId = Number(id);

  const { data: deck, isLoading: deckLoading } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => decksApi.get(deckId),
  });

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['deckCards', deckId],
    queryFn: () => decksApi.cards(deckId),
  });

  const isLoading = deckLoading || cardsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!deck) {
    return <p className="text-foreground/50">Deck not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-sm text-foreground/50 hover:text-foreground">
          ← Home
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{deck.title}</h1>
          {deck.description && (
            <p className="text-sm text-foreground/60 mt-1">{deck.description}</p>
          )}
          <div className="flex gap-4 text-sm text-foreground/50 mt-2">
            <span>{deck.cardCount} cards</span>
            <span>{deck.dueCount} due</span>
            <span>{deck.masteredCount} mastered</span>
          </div>
        </div>
        <StudyButton deckId={deckId} dueCount={deck.dueCount} />
      </div>

      <CardList cards={cards} deckId={deckId} isPreloaded={deck.isPreloaded} />
    </div>
  );
}

