'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthBrand />
      <div className="flex items-center justify-center bg-ink-50 px-4 py-10">
        <div className="w-full max-w-md animate-slide-up rounded-2xl border border-ink-200/70 bg-white p-8 shadow-card">
          <div className="mb-6">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-soft lg:hidden">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-500">Sign in to your GASTA account</p>
          </div>

          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in">{error}</div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <InputField label="Email" name="email" type="email" icon={Mail} value={form.email} onChange={onChange} placeholder="you@gasta.gov" required />
            <InputField label="Password" name="password" type="password" icon={Lock} value={form.password} onChange={onChange} placeholder="••••••••" required />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? 'Signing in…' : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            No account? <Link href="/signup" className="font-semibold text-brand-700 hover:underline">Register here</Link>
          </p>
          <p className="mt-4 rounded-lg bg-ink-50 px-3 py-2 text-center text-xs text-ink-400">
            Demo: teacher@gasta.gov · Teacher@12345
          </p>
        </div>
      </div>
    </main>
  );
}

function AuthBrand() {
  return (
    <div className="bg-mesh relative hidden flex-col justify-between p-12 text-white lg:flex">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <span className="text-lg font-bold tracking-tight">GASTA AI</span>
      </Link>
      <div>
        <h2 className="max-w-sm text-3xl font-bold leading-tight">Welfare claims, made effortless.</h2>
        <p className="mt-4 max-w-sm text-brand-100">
          File medical, housing, scholarship, sun-quota and emergency claims — guided by an AI
          assistant, tracked from pending to resolved.
        </p>
      </div>
      <p className="text-sm text-brand-200">Government Secondary Teachers&apos; Association</p>
    </div>
  );
}
