'use client';

import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusPanel({ stats }) {
  const resolved = (stats.APPROVED || 0) + (stats.REJECTED || 0);
  const items = [
    { label: 'Pending', value: stats.PENDING, Icon: Clock, color: 'text-gold-500', bg: 'bg-gold-50' },
    { label: 'Approved', value: stats.APPROVED, Icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected', value: stats.REJECTED, Icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="mt-auto rounded-2xl border border-ink-200 bg-gradient-to-b from-white to-ink-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Current Status</p>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
          {stats.total} total
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Pending" value={stats.PENDING} color="text-gold-600" ring="ring-gold-100" />
        <Stat label="Resolved" value={resolved} color="text-emerald-600" ring="ring-emerald-100" />
      </div>

      <ul className="mt-3 space-y-1.5">
        {items.map(({ label, value, Icon, color, bg }) => (
          <li key={label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink-600">
              <span className={`grid h-6 w-6 place-items-center rounded-md ${bg}`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </span>
              {label}
            </span>
            <span className="font-semibold text-ink-900">{value ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, color, ring }) {
  return (
    <div className={`rounded-xl bg-white p-3 ring-1 ${ring}`}>
      <p className={`text-2xl font-bold leading-none ${color}`}>{value ?? 0}</p>
      <p className="mt-1 text-xs text-ink-400">{label}</p>
    </div>
  );
}
