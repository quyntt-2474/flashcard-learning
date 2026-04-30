const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-slate-100 text-slate-700',
  A2: 'bg-yellow-100 text-yellow-700',
  B1: 'bg-lime-100 text-lime-700',
  B2: 'bg-blue-100 text-blue-700',
  C1: 'bg-violet-100 text-violet-700',
  C2: 'bg-rose-100 text-rose-700',
};

export default function CefrBadge({ level }: { level: string }) {
  const color = CEFR_COLORS[level] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${color}`}>
      {level}
    </span>
  );
}
