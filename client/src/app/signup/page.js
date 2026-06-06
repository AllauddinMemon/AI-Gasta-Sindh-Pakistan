'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, User, Mail, Phone, IdCard, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';

export default function SignupPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', cnic: '', password: '' });
  const [error, setError] = useState('');
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDetails([]);
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.message);
      setDetails(err.details || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-mesh relative hidden flex-col justify-between p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold tracking-tight">GASTA AI</span>
        </Link>
        <div>
          <h2 className="max-w-sm text-3xl font-bold leading-tight">Join the association portal.</h2>
          <p className="mt-4 max-w-sm text-brand-100">Create your teacher account to submit and track welfare claims in minutes.</p>
        </div>
        <p className="text-sm text-brand-200">Secure · JWT auth · Encrypted passwords</p>
      </div>

      <div className="flex items-center justify-center bg-ink-50 px-4 py-10">
        <div className="w-full max-w-md animate-slide-up rounded-2xl border border-ink-200/70 bg-white p-8 shadow-card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
            <p className="mt-1 text-sm text-ink-500">Register as a GASTA teacher</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in">
              {error}
              {details.length > 0 && <ul className="mt-1 list-disc pl-5">{details.map((d) => <li key={d.path}>{d.message}</li>)}</ul>}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <InputField label="Full name" name="name" icon={User} value={form.name} onChange={onChange} placeholder="Ayesha Khan" required />
            <InputField label="Email" name="email" type="email" icon={Mail} value={form.email} onChange={onChange} placeholder="you@gasta.gov" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Phone" name="phone" icon={Phone} value={form.phone} onChange={onChange} placeholder="+9230000000" required />
              <InputField label="CNIC / ID" name="cnic" icon={IdCard} value={form.cnic} onChange={onChange} placeholder="42101-1234567-8" required />
            </div>
            <InputField label="Password" name="password" type="password" icon={Lock} helper="At least 8 characters, with a letter and a number." value={form.password} onChange={onChange} placeholder="••••••••" required />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? 'Creating account…' : <>Register <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already registered? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
