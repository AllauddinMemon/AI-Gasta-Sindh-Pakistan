'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <div className="flex flex-col items-center gap-3 text-ink-400">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
          <span className="text-sm">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-ink-50">{children}</div>;
}
