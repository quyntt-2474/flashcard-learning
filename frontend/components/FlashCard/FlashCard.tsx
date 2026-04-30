"use client";

import { useState } from "react";

interface Props {
  front: string;
  back: string;
  onReveal?: () => void;
}

export default function FlashCard({ front, back, onReveal }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [prevFront, setPrevFront] = useState(front);

  if (prevFront !== front) {
    setPrevFront(front);
    setRevealed(false);
  }

  const handleReveal = () => {
    setRevealed(true);
    onReveal?.();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className="relative rounded-2xl border border-black/10 bg-white shadow-sm cursor-pointer select-none"
        style={{ minHeight: 220 }}
        onClick={!revealed ? handleReveal : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!revealed && (e.key === "Enter" || e.key === " ")) handleReveal();
        }}
        aria-label={revealed ? "Card revealed" : "Click to reveal answer"}
      >
        {/* Front */}
        <div className="flex items-center justify-center p-8 text-center">
          <p className="text-2xl font-bold">{front}</p>
        </div>

        {/* Back — visible after reveal */}
        {revealed ? (
          <div className="border-t border-black/10 flex items-center justify-center p-6 text-center bg-black/[0.02] rounded-b-2xl">
            <p className="text-lg text-foreground/80">{back}</p>
          </div>
        ) : (
          <div className="border-t border-black/10 flex items-center justify-center p-4 rounded-b-2xl text-foreground/40 text-sm">
            Tap to reveal
          </div>
        )}
      </div>
    </div>
  );
}
