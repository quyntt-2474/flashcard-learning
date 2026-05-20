"use client";

import { use, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import FlashCard from "@/components/FlashCard/FlashCard";
import GradeBar from "@/components/GradeBar/GradeBar";
import SessionSummary from "@/components/SessionSummary/SessionSummary";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default function StudyPage({ params }: Props) {
  const { sessionId } = use(params);
  const id = Number(sessionId);

  const {
    session,
    isLoading,
    error,
    currentCard,
    currentIndex,
    totalCards,
    revealed,
    isDone,
    summary,
    submitting,
    handleReveal,
    handleGrade,
  } = useSession(id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      console.log(e.key);

      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (!revealed && e.key === ' ') {
        e.preventDefault();
        handleReveal();
      } else if (revealed && (e.key === 'Enter' || e.key === 'ArrowRight')) {
        e.preventDefault();
        handleGrade('GOOD');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [revealed, handleReveal, handleGrade]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-foreground/50">Loading session…</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-rose-500">Failed to load session.</p>
      </div>
    );
  }

  if (isDone && summary) {
    return <SessionSummary summary={summary} deckId={session.deckId} />;
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-foreground/50">No cards in this session.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all"
            style={{ width: `${(currentIndex / totalCards) * 100}%` }}
          />
        </div>
        <span className="text-xs text-foreground/50 flex-shrink-0">
          {currentIndex + 1} / {totalCards}
        </span>
      </div>

      <FlashCard
        front={currentCard.front}
        back={currentCard.back}
        revealed={revealed}
        onReveal={handleReveal}
      />

      {revealed && <GradeBar onGrade={handleGrade} disabled={submitting} />}
    </div>
  );
}
