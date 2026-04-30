'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/my-decks', label: 'My Decks' },
  { href: '/progress', label: 'Progress' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 sticky top-0 bg-background/95 backdrop-blur z-10">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="font-bold text-lg tracking-tight">
          📚 FlashCards
        </Link>
        <ul className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-black/10 text-foreground'
                      : 'text-foreground/60 hover:text-foreground hover:bg-black/5'
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
