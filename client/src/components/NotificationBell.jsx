'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { api } from '@/lib/api';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = useCallback(() => {
    api.notifications().then((r) => setItems(r.notifications || [])).catch(() => {});
  }, []);

  // Initial load + light polling (every 30s) so new claim-review updates appear.
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  // Close on outside click / Escape
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markAll = async () => {
    try {
      const r = await api.markAllRead();
      setItems(r.notifications || []);
    } catch { /* no-op */ }
  };

  const onOpen = () => {
    setOpen((o) => !o);
    if (!open) load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onOpen}
        className="relative rounded-lg p-2 text-ink-500 transition hover:bg-ink-100"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="text-sm font-semibold text-ink-900">Notifications</p>
            {unread > 0 && (
              <button onClick={markAll} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="scroll-area max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-ink-400">
                <Inbox className="h-7 w-7" />
                <p className="text-sm">You&apos;re all caught up</p>
              </div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {items.map((n) => (
                  <li key={n.id} className={`flex gap-3 px-4 py-3 ${n.read ? '' : 'bg-brand-50/50'}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-ink-200' : 'bg-brand-500'}`} />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-ink-800">{n.message}</p>
                      <p className="mt-0.5 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
