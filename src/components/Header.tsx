'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header 
      className="sticky top-0 z-10 backdrop-blur-md"
      style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: `1px solid var(--border-light)`,
        boxShadow: '0 1px 3px rgba(0, 163, 224, 0.1)'
      }}
    >
      <div className="h-16 flex items-center gap-3 px-4">
        <Link href="/">
          <div className="flex items-center gap-3 px-3 py-2">
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}
            >
              <span className="text-sm">✈️</span>
            </div>
            <span 
              className="text-base md:text-lg font-bold hidden sm:block"
              style={{ color: 'var(--secondary)' }}
            >
              Can I Bring On Board?
            </span>
          </div>
        </Link>
        <div className="flex-1" />
        <button
          className="md:hidden p-2 rounded-lg transition-colors duration-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ 
            background: isMenuOpen ? 'var(--primary-light)' : 'transparent',
            color: isMenuOpen ? 'var(--primary)' : 'var(--foreground)'
          }}
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
        <nav className={`md:flex items-center gap-2 ${isMenuOpen ? 'absolute top-16 left-0 right-0 backdrop-blur-md border-b' : 'hidden'}`}
             style={{ 
               background: isMenuOpen ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
               borderColor: isMenuOpen ? 'var(--border-light)' : 'transparent'
             }}>
          <ul className={`flex flex-col md:flex-row items-center gap-2 w-full ${isMenuOpen ? 'p-4' : ''}`}>
            <li>
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'var(--surface)',
                  color: 'var(--secondary)',
                  border: `1px solid var(--border-light)`
                }}
              >
                <span>🏠</span>
                <span className="font-medium">홈 · 검색</span>
              </Link>
            </li>
            <li>
              <Link
                href="/report"
                className="btn-primary flex items-center gap-3"
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
