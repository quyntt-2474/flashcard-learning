import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { Suspense } from 'react';
import StudyPage from './page';

// ── mock next/link ────────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// ── mock useSession ───────────────────────────────────────────────────────────
const mockHandleReveal = vi.fn();
const mockHandleGrade = vi.fn();

const baseSession = {
  session: { id: 1, deckId: 1, clientId: 'test', cards: [{ id: 10, front: 'hello', back: 'xin chào' }], completedAt: null },
  isLoading: false,
  error: null,
  currentCard: { id: 10, front: 'hello', back: 'xin chào' },
  currentIndex: 0,
  totalCards: 1,
  isDone: false,
  summary: null,
  submitting: false,
  handleReveal: mockHandleReveal,
  handleGrade: mockHandleGrade,
};

vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}));

import { useSession } from '@/hooks/useSession';

async function renderPage(revealed: boolean) {
  vi.mocked(useSession).mockReturnValue({ ...baseSession, revealed });
  await act(async () => {
    render(
      <Suspense fallback={null}>
        <StudyPage params={Promise.resolve({ sessionId: '1' })} />
      </Suspense>
    );
  });
}

describe('StudyPage keyboard shortcuts', () => {
  beforeEach(() => {
    mockHandleReveal.mockReset();
    mockHandleGrade.mockReset();
  });

  it('Space reveals the card when front is showing', async () => {
    await renderPage(false);
    fireEvent.keyDown(window, { key: ' ' });
    expect(mockHandleReveal).toHaveBeenCalledTimes(1);
  });

  it('key 1 grades as AGAIN when card is revealed', async () => {
    await renderPage(true);
    fireEvent.keyDown(window, { key: '1' });
    expect(mockHandleGrade).toHaveBeenCalledWith('AGAIN');
  });

  it('key 2 grades as HARD when card is revealed', async () => {
    await renderPage(true);
    fireEvent.keyDown(window, { key: '2' });
    expect(mockHandleGrade).toHaveBeenCalledWith('HARD');
  });

  it('key 3 grades as GOOD when card is revealed', async () => {
    await renderPage(true);
    fireEvent.keyDown(window, { key: '3' });
    expect(mockHandleGrade).toHaveBeenCalledWith('GOOD');
  });

  it('key 4 grades as EASY when card is revealed', async () => {
    await renderPage(true);
    fireEvent.keyDown(window, { key: '4' });
    expect(mockHandleGrade).toHaveBeenCalledWith('EASY');
  });

  it('Enter grades as GOOD when card is revealed (existing shortcut preserved)', async () => {
    await renderPage(true);
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(mockHandleGrade).toHaveBeenCalledWith('GOOD');
  });

  it('ArrowRight grades as GOOD when card is revealed (existing shortcut preserved)', async () => {
    await renderPage(true);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockHandleGrade).toHaveBeenCalledWith('GOOD');
  });

  it('numeric keys 1-4 do nothing when card is NOT revealed', async () => {
    await renderPage(false);
    fireEvent.keyDown(window, { key: '1' });
    fireEvent.keyDown(window, { key: '2' });
    fireEvent.keyDown(window, { key: '3' });
    fireEvent.keyDown(window, { key: '4' });
    expect(mockHandleGrade).not.toHaveBeenCalled();
  });

  it('shortcuts are blocked when an input element is focused', async () => {
    await renderPage(true);
    const input = document.createElement('input');
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: '1' });
    expect(mockHandleGrade).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
