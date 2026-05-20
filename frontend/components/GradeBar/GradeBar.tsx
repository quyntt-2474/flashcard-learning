'use client';

import type { Grade } from '@/services/api';

interface Props {
  onGrade: (grade: Grade) => void;
  disabled?: boolean;
}

const GRADES: { grade: Grade; label: string; color: string; key: string }[] = [
  { grade: 'HARD', label: 'Hard', color: 'bg-orange-400 hover:bg-orange-500', key: '1' },
  { grade: 'GOOD', label: 'Good', color: 'bg-blue-500 hover:bg-blue-600', key: '2' },
  { grade: 'EASY', label: 'Easy', color: 'bg-emerald-500 hover:bg-emerald-600', key: '3' },
];

export default function GradeBar({ onGrade, disabled }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-black/10 p-4">
      <div className="max-w-lg mx-auto grid grid-cols-3 gap-2">
        {GRADES.map(({ grade, label, color, key }) => (
          <button
            key={grade}
            onClick={() => onGrade(grade)}
            disabled={disabled}
            className={`py-3 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-40 ${color}`}
          >
            <span className="hidden sm:inline">[{key}] </span>{label}
          </button>
        ))}
      </div>
    </div>
  );
}
