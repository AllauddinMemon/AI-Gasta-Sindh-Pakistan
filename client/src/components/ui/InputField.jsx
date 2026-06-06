'use client';

/**
 * Labelled input with optional icon, helper text and error state.
 * Pass `as="textarea"` or `as="select"` to render those variants.
 */
export default function InputField({
  label,
  icon: Icon,
  helper,
  error,
  as = 'input',
  children,
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name;
  const base =
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition ' +
    'placeholder:text-ink-400 focus:ring-4 ' +
    (error
      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
      : 'border-ink-200 focus:border-brand-500 focus:ring-brand-100');

  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        )}
        {as === 'textarea' ? (
          <textarea id={inputId} {...props} className={`${base} ${Icon ? 'pl-9' : ''} ${className}`} />
        ) : as === 'select' ? (
          <select id={inputId} {...props} className={`${base} ${Icon ? 'pl-9' : ''} ${className}`}>
            {children}
          </select>
        ) : (
          <input id={inputId} {...props} className={`${base} ${Icon ? 'pl-9' : ''} ${className}`} />
        )}
      </div>
      {helper && !error && <span className="mt-1 block text-xs text-ink-400">{helper}</span>}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
