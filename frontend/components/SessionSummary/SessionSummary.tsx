import Link from 'next/link';
import type { SessionSummaryData } from '@/services/api';

interface Props {
  summary: SessionSummaryData;
  deckId: number;
}

export default function SessionSummary({ summary, deckId }: Props) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 py-8 text-center">
      <div>
        <h2 className="text-2xl font-bold">Session Complete! 🎉</h2>
        <p className="text-foreground/60 text-sm mt-1">
          {summary.totalCards} cards reviewed
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 space-y-4">
        <div className="text-4xl font-bold">{summary.accuracyPercent}%</div>
        <p className="text-sm text-foreground/60">Accuracy</p>

        <div className="grid grid-cols-3 gap-2 pt-2">
          {[
            { label: 'Hard', value: summary.hard, color: 'text-orange-500' },
            { label: 'Good', value: summary.good, color: 'text-blue-600' },
            { label: 'Easy', value: summary.easy, color: 'text-emerald-600' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-foreground/50">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href={`/decks/${deckId}`}
          className="w-full py-3 rounded-xl bg-black text-white font-medium text-sm text-center"
        >
          Back to Deck
        </Link>
        <Link
          href="/"
          className="w-full py-3 rounded-xl border border-black/10 text-sm text-center hover:bg-black/5"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
