interface CategoryStat {
  categoryId: number;
  categoryName: string;
  totalReviews: number;
  accuracyPercent: number;
}

export default function CategoryStats({ stats }: { stats: CategoryStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="font-semibold">By Category</h2>
      <ul className="space-y-2">
        {stats.map((s) => (
          <li
            key={s.categoryId}
            className="flex items-center gap-4 rounded-xl border border-black/10 p-3 bg-white"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{s.categoryName}</p>
              <p className="text-xs text-foreground/50">{s.totalReviews} reviews</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{s.accuracyPercent}%</p>
              <p className="text-xs text-foreground/40">accuracy</p>
            </div>
            <div className="w-16 h-2 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full bg-black rounded-full"
                style={{ width: `${s.accuracyPercent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
