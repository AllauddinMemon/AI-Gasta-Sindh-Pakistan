'use client';

const STYLES = {
  PENDING: 'bg-gold-50 text-gold-600 ring-gold-100',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-100',
};

export default function Badge({ status, children }) {
  const dot = {
    PENDING: 'bg-gold-500',
    APPROVED: 'bg-emerald-500',
    REJECTED: 'bg-rose-500',
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        STYLES[status] || 'bg-ink-100 text-ink-700 ring-ink-200'
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {children || status}
    </span>
  );
}
