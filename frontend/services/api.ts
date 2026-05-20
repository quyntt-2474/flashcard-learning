import axios from "axios";
import { getOrCreateClientId } from "@/lib/clientId";
console.log(process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

api.interceptors.request.use((config) => {
  const clientId = getOrCreateClientId();

  if (clientId) {
    config.headers["X-Client-ID"] = clientId;
  }
  return config;
});

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  isPreloaded: boolean;
  deckCount: number;
}

export interface Deck {
  id: number;
  title: string;
  description: string | null;
  categoryId: number;
  clientId: string;
  isPreloaded: boolean;
  cardCount: number;
  dueCount: number;
  masteredCount: number;
}

export interface Card {
  id: number;
  front: string;
  back: string;
  deckId: number;
  isPreloaded: boolean;
  dueDate: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  isMastered: boolean;
}

export type Grade = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface StudySessionCard {
  id: number;
  front: string;
  back: string;
}

export interface StudySession {
  id: number;
  deckId: number;
  clientId: string;
  cards: StudySessionCard[];
  completedAt: string | null;
}

export interface ReviewResult {
  cardId: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  isMastered: boolean;
  dueDate: string;
}

export interface SessionSummaryData {
  sessionId: number;
  totalCards: number;
  accuracyPercent: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  completedAt: string;
}

export interface ProgressData {
  cefrLevel: string | null;
  accuracyPercent: number | null;
  totalReviews: number;
  masteredCards: number;
  studyStreakDays: number;
  nextDueDate: string | null;
  byCategory: Array<{
    categoryId: number;
    categoryName: string;
    totalReviews: number;
    accuracyPercent: number;
  }>;
  message?: string;
}

// ── API functions ─────────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () =>
    api.get<Category[]>("/categories").then((r) => {
      console.log(r);


      return r.data;
    }),
  decks: (categoryId: number) =>
    api.get<Deck[]>(`/categories/${categoryId}/decks`).then((r) => r.data),
};

export const decksApi = {
  get: (id: number) => api.get<Deck>(`/decks/${id}`).then((r) => r.data),
  create: (data: { title: string; description?: string; categoryId: number }) =>
    api.post<Deck>("/decks", data).then((r) => r.data),
  update: (id: number, data: { title?: string; description?: string }) =>
    api.patch<Deck>(`/decks/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/decks/${id}`),
  cards: (deckId: number) =>
    api.get<Card[]>(`/decks/${deckId}/cards`).then((r) => r.data),
};

export const cardsApi = {
  create: (
    deckId: number,
    data: { front: string; back: string; hint?: string },
  ) => api.post<Card>(`/decks/${deckId}/cards`, data).then((r) => r.data),
  update: (
    id: number,
    data: { front?: string; back?: string; hint?: string },
  ) => api.patch<Card>(`/cards/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/cards/${id}`),
};

export const sessionsApi = {
  create: (deckId: number) =>
    api.post<StudySession>("/sessions", { deckId }).then((r) => r.data),
  get: (id: number) =>
    api.get<StudySession>(`/sessions/${id}`).then((r) => r.data),
  review: (sessionId: number, data: { cardId: number; grade: Grade }) =>
    api
      .post<ReviewResult>(`/sessions/${sessionId}/reviews`, data)
      .then((r) => r.data),
  complete: (sessionId: number) =>
    api
      .patch<SessionSummaryData>(`/sessions/${sessionId}/complete`)
      .then((r) => r.data),
};

export const progressApi = {
  get: () => api.get<ProgressData>("/progress").then((r) => r.data),
};
