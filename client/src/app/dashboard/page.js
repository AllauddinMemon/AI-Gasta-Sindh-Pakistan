'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Menu, LogOut, ShieldCheck, ShieldAlert, ListChecks, FilePlus2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatAssistant from '@/components/ChatAssistant';
import ClaimCard from '@/components/ClaimCard';
import ClaimForm from '@/components/ClaimForm';
import NotificationBell from '@/components/NotificationBell';
import Button from '@/components/ui/Button';
import { categoryByKey } from '@/components/ui/CategoryMeta';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [selected, setSelected] = useState('MEDICAL');
  const [claims, setClaims] = useState([]);
  const [preset, setPreset] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Right-panel state: 'claims' (list) or 'form' (contextual injection)
  const [panel, setPanel] = useState('claims');
  const [formCategory, setFormCategory] = useState('MEDICAL');

  const loadClaims = useCallback(() => {
    api.listClaims().then((r) => setClaims(r.claims)).catch(() => {});
  }, []);

  useEffect(() => { loadClaims(); }, [loadClaims]);

  // Selecting a category guides the chat AND injects the matching form (contextual).
  const onSelectCategory = (key) => {
    setSelected(key);
    setFormCategory(key);
    setPanel('form');
    const meta = categoryByKey(key);
    setPreset(`I want to file a ${meta.label} (${meta.hint}) claim. What documents do I need and how do I file it?`);
  };

  const openNewClaim = () => {
    setFormCategory(selected || 'MEDICAL');
    setPanel('form');
  };

  const onSubmitted = () => {
    setPanel('claims');
    loadClaims();
  };

  const initials = (user?.name || 'U').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="flex min-h-screen">
      <Sidebar onSelectCategory={onSelectCategory} selected={selected} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-ink-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <span className="flex items-center gap-2 lg:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-800 text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="font-bold text-ink-900">GASTA AI</span>
            </span>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-ink-900">Dashboard</h1>
              <p className="text-sm text-ink-400">Welcome back, {user?.name?.split(' ')[0]} — chat for guidance, then file or track claims.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user?.role === 'ADMIN' && (
              <Link href="/dashboard/admin" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100">
                <ShieldAlert className="h-4 w-4" /> <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <NotificationBell />
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white shadow-soft" title={user?.name}>
              {initials}
            </span>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Left: AI chat */}
            <section className="h-[30rem] xl:h-[40rem]">
              <ChatAssistant presetMessage={preset} />
            </section>

            {/* Right: contextual panel (claims list OR injected form) */}
            <section className="flex flex-col">
              {/* Panel tabs */}
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1 shadow-soft">
                  <TabButton active={panel === 'claims'} onClick={() => setPanel('claims')} icon={ListChecks}>
                    My Claims
                  </TabButton>
                  <TabButton active={panel === 'form'} onClick={openNewClaim} icon={FilePlus2}>
                    New Claim
                  </TabButton>
                </div>
                {panel === 'claims' && (
                  <Button size="sm" onClick={openNewClaim}>
                    <Plus className="h-4 w-4" /> New
                  </Button>
                )}
              </div>

              {panel === 'form' ? (
                <div className="animate-scale-in">
                  <ClaimForm
                    key={formCategory}
                    initialCategory={formCategory}
                    embedded
                    onSubmitted={onSubmitted}
                    onCancel={() => setPanel('claims')}
                  />
                </div>
              ) : (
                <div className="scroll-area max-h-[40rem] space-y-3 overflow-y-auto pr-1">
                  {claims.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-10 text-center">
                      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                        <Plus className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-ink-700">No claims yet</p>
                      <p className="mt-1 text-sm text-ink-400">Pick a service on the left or click <strong>New Claim</strong> to start.</p>
                    </div>
                  ) : (
                    claims.map((c) => <ClaimCard key={c.id} claim={c} />)
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        active ? 'bg-brand-800 text-white shadow-soft' : 'text-ink-500 hover:text-ink-800'
      }`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}
