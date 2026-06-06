import Link from 'next/link';
import { ShieldCheck, FileText, Bot, ArrowRight, Stethoscope, Home, GraduationCap, Award, LifeBuoy } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink-50">
      {/* Hero */}
      <div className="bg-mesh text-white">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span className="text-lg font-bold tracking-tight">GASTA AI</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-white/10">Login</Link>
            <Link href="/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-50">Register</Link>
          </nav>
        </header>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:pt-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-200">
            Government Secondary Teachers&apos; Association
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            File and track welfare claims, guided by AI.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-100">
            Submit medical, housing, scholarship, sun-quota and emergency claims in minutes.
            Upload documents, get instant guidance, and follow every claim from pending to resolved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-800 shadow-lift transition hover:bg-brand-50">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10">
              I have an account
            </Link>
          </div>
        </section>
      </div>

      {/* Feature cards */}
      <section className="mx-auto -mt-12 max-w-6xl px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: FileText, title: 'Structured claims', body: 'Five claim categories, each with the exact documents it needs.' },
            { icon: Bot, title: 'AI assistant', body: 'Ask what to upload and get step-by-step help filling the form.' },
            { icon: ShieldCheck, title: 'Secure by design', body: 'JWT auth, hashed passwords, validation and rate limiting.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{title}</h3>
              <p className="mt-2 text-sm text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold text-ink-900">Five claim services, one portal</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: Stethoscope, label: 'Medical', color: 'bg-rose-50 text-rose-600' },
            { icon: Home, label: 'Housing', color: 'bg-amber-50 text-amber-600' },
            { icon: GraduationCap, label: 'Scholarships', color: 'bg-emerald-50 text-emerald-600' },
            { icon: Award, label: 'Sun Quota', color: 'bg-violet-50 text-violet-600' },
            { icon: LifeBuoy, label: 'Emergency', color: 'bg-sky-50 text-sky-600' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-2xl border border-ink-200/70 bg-white p-6 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-card">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-ink-700">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-200 py-8 text-center text-sm text-ink-400">
        © {new Date().getFullYear()} GASTA AI — Government Secondary Teachers&apos; Association
      </footer>
    </main>
  );
}
