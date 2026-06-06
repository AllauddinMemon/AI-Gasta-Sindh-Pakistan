'use client';

import { categoryByKey } from '@/components/ui/CategoryMeta';
import Badge from '@/components/ui/Badge';
import { Paperclip, Calendar } from 'lucide-react';

export default function ClaimCard({ claim }) {
  const meta = categoryByKey(claim.category);
  const Icon = meta.icon;
  const amount = Number(claim.amount).toLocaleString();

  return (
    <div className="group rounded-2xl border border-ink-200/70 bg-white p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${meta.color}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{claim.title}</p>
            <p className="text-xs font-medium text-ink-400">{meta.label}</p>
          </div>
        </div>
        <Badge status={claim.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500">
        <span className="font-semibold text-ink-900">Rs {amount}</span>
        {claim.hospitalName && <span className="text-ink-500">· {claim.hospitalName}</span>}
        <span className="inline-flex items-center gap-1 text-xs text-ink-400">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(claim.createdAt).toLocaleDateString()}
        </span>
        {claim.documents?.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-ink-400">
            <Paperclip className="h-3.5 w-3.5" /> {claim.documents.length} file(s)
          </span>
        )}
      </div>

      {claim.reviewerNotes && (
        <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-600">
          <span className="font-semibold text-ink-700">Reviewer:</span> {claim.reviewerNotes}
        </p>
      )}
    </div>
  );
}
