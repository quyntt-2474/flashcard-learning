'use client';

import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/services/api';
import CefrBadge from '@/components/CefrBadge/CefrBadge';
import CategoryStats from '@/components/CategoryStats/CategoryStats';

export default function ProgressPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.get,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-black/5" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-rose-500 text-sm">Failed to load progress data.</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-bold mb-1">My Progress</h1>
        {data.message && (
          <p className="text-foreground/60 text-sm">{data.message}</p>
        )}
      </section>

      {/* CEFR Level */}
      <section className="rounded-2xl border border-black/10 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground/70">CEFR Level Estimate</p>
            <div className="mt-2">
              {data.cefrLevel ? (
                <CefrBadge level={data.cefrLevel} />
              ) : (
                <span className="text-foreground/40 text-sm">—</span>
              )}
            </div>
          </div>
          {data.accuracyPercent !== null && (
            <div className="text-right">
              <p className="text-3xl font-bold">{data.accuracyPercent}%</p>
              <p className="text-xs text-foreground/50">weighted accuracy</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Reviews', value: data.totalReviews },
          { label: 'Mastered Cards', value: data.masteredCards },
          { label: 'Study Streak', value: `${data.studyStreakDays}d` },
          {
            label: 'Next Due',
            value: data.nextDueDate
              ? new Date(data.nextDueDate).toLocaleDateString()
              : '—',
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-black/10 bg-white p-4 text-center"
          >
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-foreground/50 mt-1">{label}</p>
          </div>
        ))}
      </section>

      <CategoryStats stats={data.byCategory} />
    </div>
  );
}
