'use client';

/**
 * Premium button with variants, sizes, hover/active animations and a loading state.
 * variant: primary | secondary | ghost | gold | danger
 */
const VARIANTS = {
  primary:
    'bg-brand-800 text-white hover:bg-brand-900 shadow-soft hover:shadow-lift focus-visible:ring-brand-300',
  secondary:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-soft hover:shadow-lift focus-visible:ring-brand-200',
  gold:
    'bg-gold-500 text-white hover:bg-gold-600 shadow-soft hover:shadow-lift focus-visible:ring-gold-100',
  ghost:
    'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 focus-visible:ring-ink-200',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 shadow-soft focus-visible:ring-rose-200',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-11 w-11',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-semibold
        transition-all duration-200 ease-out active:scale-[0.97]
        focus:outline-none focus-visible:ring-4 disabled:opacity-60 disabled:pointer-events-none
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}
