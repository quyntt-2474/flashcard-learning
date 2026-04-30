"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  sessionsApi,
  type Grade,
  type SessionSummaryData,
} from "@/services/api";

export function useSession(sessionId: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [summary, setSummary] = useState<SessionSummaryData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => sessionsApi.get(sessionId),
    enabled: !!sessionId,
  });
  const reviewMutation = useMutation({
    mutationFn: ({ cardId, grade }: { cardId: number; grade: Grade }) =>
      sessionsApi.review(sessionId, { cardId, grade }),
  });

  const completeMutation = useMutation({
    mutationFn: () => sessionsApi.complete(sessionId),
  });



  const currentCard = session?.cards?.[currentIndex] ?? null;
  const totalCards = session?.cards?.length ?? 0;
  const isLastCard = currentIndex === totalCards - 1;
  const isDone = summary !== null;

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleGrade = useCallback(
    async (grade: Grade) => {
      if (!currentCard || submitting) return;
      setSubmitting(true);
      try {
        await reviewMutation.mutateAsync({ cardId: currentCard.id, grade });

        if (isLastCard) {
          const result = await completeMutation.mutateAsync();
          setSummary(result);
        } else {
          setCurrentIndex((i) => i + 1);
          setRevealed(false);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [currentCard, submitting, isLastCard, reviewMutation, completeMutation],
  );

  return {
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
  };
}
