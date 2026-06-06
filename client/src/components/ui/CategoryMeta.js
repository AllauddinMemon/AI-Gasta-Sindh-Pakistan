import { Stethoscope, Home, GraduationCap, Award, LifeBuoy } from 'lucide-react';

export const CATEGORIES = [
  { key: 'MEDICAL', label: 'Medical Claim', hint: 'Hospitalization / Medicines', icon: Stethoscope, color: 'bg-rose-50 text-rose-600' },
  { key: 'HOUSING', label: 'Housing', hint: 'Rental / Allotment', icon: Home, color: 'bg-amber-50 text-amber-600' },
  { key: 'SCHOLARSHIP', label: 'Scholarships', hint: 'Education Fund', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
  { key: 'SUN_QUOTA', label: 'Sun Quota', hint: 'Merit Applications', icon: Award, color: 'bg-violet-50 text-violet-600' },
  { key: 'EMERGENCY', label: 'Emergency Fund', hint: 'Urgent Assistance', icon: LifeBuoy, color: 'bg-sky-50 text-sky-600' },
];

export const categoryByKey = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];

export const STATUS_STYLES = {
  PENDING: 'bg-gold-50 text-gold-600 ring-1 ring-gold-100',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
};
