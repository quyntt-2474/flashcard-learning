import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SessionSummary from './SessionSummary';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockSummary = {
  sessionId: 1,
  totalCards: 10,
  accuracyPercent: 70,
  again: 5,
  hard: 2,
  good: 1,
  easy: 2,
  completedAt: '2026-06-04T10:00:00.000Z',
};

describe('SessionSummary', () => {
  it('renders the Again count', () => {
    render(<SessionSummary summary={mockSummary} deckId={1} />);
    expect(screen.getByText('5')).toBeInTheDocument(); // again count (unique value)
    expect(screen.getByText('Again')).toBeInTheDocument();
  });

  it('renders all four grade labels: Again, Hard, Good, Easy', () => {
    render(<SessionSummary summary={mockSummary} deckId={1} />);
    expect(screen.getByText('Again')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('renders the accuracy percentage', () => {
    render(<SessionSummary summary={mockSummary} deckId={1} />);
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('renders the total cards count', () => {
    render(<SessionSummary summary={mockSummary} deckId={1} />);
    expect(screen.getByText(/10 cards reviewed/i)).toBeInTheDocument();
  });

  it('Again count uses rose colour class', () => {
    render(<SessionSummary summary={mockSummary} deckId={1} />);
    const againValue = screen.getByText('5'); // unique value in mock
    expect(againValue.className).toContain('rose');
  });
});
