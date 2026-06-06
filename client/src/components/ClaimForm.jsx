'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, X, FileText, Info, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '@/components/ui/CategoryMeta';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { api } from '@/lib/api';

export default function ClaimForm({ initialCategory = 'MEDICAL', embedded = false, onSubmitted, onCancel }) {
  const router = useRouter();
  const [form, setForm] = useState({
    category: initialCategory,
    title: '',
    hospitalName: '',
    amount: '',
    incidentDate: '',
    notes: '',
  });
  const [files, setFiles] = useState([]);
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [error, setError] = useState('');
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setForm((f) => ({ ...f, category: initialCategory }));
  }, [initialCategory]);

  useEffect(() => {
    api.requiredDocs(form.category.toLowerCase())
      .then((r) => setRequiredDocs(r.documents))
      .catch(() => setRequiredDocs([]));
  }, [form.category]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addFiles = (list) =>
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 5));
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDetails([]);
    setLoading(true);
    setProgress(15);
    const timer = setInterval(() => setProgress((p) => Math.min(p + 12, 90)), 200);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v !== '' && fd.append(k, v));
      files.forEach((f) => fd.append('documents', f));
      const { claim } = await api.createClaim(fd);
      setProgress(100);
      setTimeout(() => {
        if (embedded) {
          onSubmitted?.(claim);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }, 350);
    } catch (err) {
      setError(err.message);
      setDetails(err.details || []);
      setProgress(0);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const isMedical = form.category === 'MEDICAL';
  const fmtSize = (b) => (b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-card animate-slide-up"
    >
      {/* Header */}
      <div className="border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white px-6 py-5">
        <h2 className="text-lg font-bold text-ink-900">New Claim</h2>
        <p className="text-sm text-ink-500">Fill in the details and attach supporting documents.</p>
      </div>

      <div className="space-y-5 p-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in">
            {error}
            {details.length > 0 && (
              <ul className="mt-1 list-disc pl-5">
                {details.map((d) => <li key={d.path}>{d.message}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <InputField as="select" label="Category" name="category" value={form.category} onChange={onChange}>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </InputField>
          <InputField label="Claim title" name="title" value={form.title} onChange={onChange} placeholder="e.g. Hospitalization reimbursement" />
          {isMedical && (
            <InputField label="Hospital name" name="hospitalName" value={form.hospitalName} onChange={onChange} placeholder="City General Hospital" />
          )}
          <InputField label="Date" name="incidentDate" type="date" value={form.incidentDate} onChange={onChange} />
          <InputField label="Claim amount (Rs)" name="amount" type="number" min="1" step="0.01" value={form.amount} onChange={onChange} placeholder="45000" />
        </div>

        <InputField as="textarea" rows={3} label="Notes (discharge summary, etc.)" name="notes" value={form.notes} onChange={onChange} placeholder="Add any context the reviewer should know…" />

        {requiredDocs.length > 0 && (
          <div className="flex gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div className="text-sm text-brand-900">
              <p className="font-semibold">Recommended documents</p>
              <ul className="mt-1 grid gap-x-4 gap-y-0.5 sm:grid-cols-2">
                {requiredDocs.map((d) => (
                  <li key={d} className="flex items-center gap-1.5 text-brand-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Upload zone */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-700">Documents (PDF / images, max 5)</span>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/50 px-4 py-7 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-600 shadow-soft">
              <UploadCloud className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink-700">Click to upload or drag &amp; drop</span>
            <span className="text-xs text-ink-400">PDF, PNG, JPG up to 10 MB each</span>
            <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2.5 animate-fade-in">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-800">{f.name}</span>
                    <span className="block text-xs text-ink-400">{fmtSize(f.size)}</span>
                  </span>
                  <button type="button" onClick={() => removeFile(i)} className="rounded-lg p-1.5 text-ink-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label="Remove">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upload / submit progress bar */}
        {loading && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
          <Button type="button" variant="ghost" onClick={() => router.push('/dashboard')} className="sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="sm:flex-1">
            {loading ? 'Submitting…' : 'Submit claim'}
          </Button>
        </div>
      </div>
    </form>
  );
}
