'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import Image from 'next/image';

// Runs at module load time — before any React render/useEffect.
// ngrok free tier returns its browser-warning HTML page when this header
// is absent, breaking all /api/* calls.
if (typeof window !== 'undefined') {
  const w = window as Window & { __fetchIntercepted?: boolean };
  if (!w.__fetchIntercepted) {
    const _orig = window.fetch.bind(window);
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const headers = new Headers(init?.headers);
      headers.set('ngrok-skip-browser-warning', 'true');
      return _orig(input, { ...init, headers });
    };
    w.__fetchIntercepted = true;
  }
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Mobile header */}
      <header className="no-print lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm h-14">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <Image src="/logo-dark.png" alt="EPAJ" width={26} height={26} className="rounded-full shrink-0" />
          <span className="font-bold text-slate-800 text-sm tracking-tight truncate">EPAJ Proformas</span>
        </div>
      </header>

      <div className="lg:flex">
        {/* Overlay */}
        <div
          className={`no-print fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`no-print fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] z-50 transform transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:z-auto lg:w-60 lg:max-w-none lg:shrink-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </aside>

        <main className="flex-1 min-w-0 lg:min-h-screen">
          {children}
        </main>
      </div>
    </>
  );
}
