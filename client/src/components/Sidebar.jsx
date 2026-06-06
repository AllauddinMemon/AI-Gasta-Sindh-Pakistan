'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, X, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/components/ui/CategoryMeta';
import StatusPanel from '@/components/StatusPanel';
import { api } from '@/lib/api';

export default function Sidebar({ onSelectCategory, selected, open = false, onClose }) {
  const [stats, setStats] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0, total: 0 });

  useEffect(() => {
    api.claimStats().then((r) => setStats(r.stats)).catch(() => {});
  }, []);

  const content = (
    <div className="flex h-full flex-col gap-5 p-4">
      {/* Logo */}
      <div className="flex items-center justify-between px-1">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-soft">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-left">
            <span className="block text-[15px] font-bold leading-tight tracking-tight text-ink-900">GASTA AI</span>
            <span className="block text-[11px] font-medium text-ink-400">Teachers&apos; Welfare</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div>
        <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Claim Services
        </p>
        <nav className="mt-2 space-y-1">
          {CATEGORIES.map(({ key, label, hint, icon: Icon, color }) => {
            const active = selected === key;
            return (
              <button
                key={key}
                onClick={() => {
                  onSelectCategory(key);
                  onClose?.();
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200
                  ${active ? 'bg-brand-50 ring-1 ring-brand-100 shadow-soft' : 'hover:bg-ink-50'}`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${color}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-semibold ${active ? 'text-brand-800' : 'text-ink-700'}`}>{label}</span>
                  <span className="block truncate text-xs text-ink-400">{hint}</span>
                </span>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    active ? 'text-brand-500 opacity-100' : 'text-ink-300 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      <StatusPanel stats={stats} />
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-ink-200 bg-white lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-ink-200 bg-white shadow-lift animate-slide-in-left">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
