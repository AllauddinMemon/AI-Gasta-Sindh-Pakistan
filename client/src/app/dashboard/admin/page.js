'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Check, X, Filter } from 'lucide-react';
import { categoryByKey } from '@/components/ui/CategoryMeta';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [busy, setBusy] = useState(false);

  // Gate: admins only
  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [loading, user, router]);

  const load = useCallback(() => {
    if (user?.role !== 'ADMIN') return;
    api.adminClaims(filter === 'ALL' ? undefined : filter)
      .then((r) => setClaims(r.claims))
      .catch(() => {});
  }, [filter, user]);

  useEffect(() => { load(); }, [load]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-ink-400">Loading…</div>;
  }
  if (user.role !== 'ADMIN') {
    return <div className="grid min-h-screen place-items-center text-ink-400">Redirecting…</div>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/dashboard" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-800 text-white shadow-soft">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink-900">Claims Review</h1>
            <p className="text-sm text-ink-400">Approve or reject submitted claims.</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 shadow-soft">
          <Filter className="ml-2 h-4 w-4 text-ink-400" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === f ? 'bg-brand-800 text-white' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center text-ink-400">
          No claims in this view.
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((c) => (
            <AdminClaimRow key={c.id} claim={c} busy={busy} setBusy={setBusy} onDone={load} />
          ))}
        </div>
      )}
    </main>
  );
}

function AdminClaimRow({ claim, busy, setBusy, onDone }) {
  const meta = categoryByKey(claim.category);
  const Icon = meta.icon;
  const [notes, setNotes] = useState(claim.reviewerNotes || '');
  const [open, setOpen] = useState(false);

  const review = async (status) => {
    setBusy(true);
    try {
      await api.reviewClaim(claim.id, { status, reviewerNotes: notes });
      setOpen(false);
      onDone();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-xl ${meta.color}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-ink-900">{claim.title}</p>
            <p className="text-xs text-ink-400">
              {meta.label} · {claim.user?.name} · Rs {Number(claim.amount).toLocaleString()}
            </p>
          </div>
        </div>
        <Badge status={claim.status} />
      </div>

      {claim.notes && <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">{claim.notes}</p>}

      {claim.status === 'PENDING' ? (
        <div className="mt-3">
          {open ? (
            <div className="space-y-3">
              <InputField as="textarea" rows={2} label="Reviewer notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason / remarks for the teacher…" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="primary" loading={busy} onClick={() => review('APPROVED')}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button size="sm" variant="danger" loading={busy} onClick={() => review('REJECTED')}>
                  <X className="h-4 w-4" /> Reject
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Review claim</Button>
          )}
        </div>
      ) : (
        claim.reviewerNotes && (
          <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
            <span className="font-semibold text-ink-700">Your note:</span> {claim.reviewerNotes}
          </p>
        )
      )}
    </div>
  );
}
