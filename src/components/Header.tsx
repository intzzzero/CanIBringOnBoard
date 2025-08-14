'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-14 flex items-center gap-3 px-4">
        <Link
          href="/"
          className="text-base md:text-lg font-semibold px-2 py-1 rounded hover:bg-black/5"
        >
          ✈️ Can I Bring On Board?
        </Link>
        <div className="flex-1" />
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
        <nav className={`md:flex items-center gap-1 md:gap-2 text-sm ${isMenuOpen ? 'absolute top-14 left-0 right-0 bg-background/80 backdrop-blur' : 'hidden'}`}>
          <ul className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 text-sm w-full ${isMenuOpen ? 'p-4' : ''}`}>
            <li>
              <Link
                href="/"
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-black/5 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🏠</span>
                <span className="sm:inline">홈 · 검색</span>
              </Link>
            </li>
            <li>
              <Link
                href="/report"
                className="flex items-center gap-2 px-2 py-1.5 rounded border border-black/10 hover:bg-black/5 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>📝</span>
                <span>제보하기</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
