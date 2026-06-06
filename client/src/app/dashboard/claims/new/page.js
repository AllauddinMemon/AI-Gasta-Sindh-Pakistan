'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ClaimForm from '@/components/ClaimForm';

function NewClaimInner() {
  const params = useSearchParams();
  const category = params.get('category') || 'MEDICAL';
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/dashboard" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <ClaimForm initialCategory={category} />
    </main>
  );
}

export default function NewClaimPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-400">Loading…</div>}>
      <NewClaimInner />
    </Suspense>
  );
}
