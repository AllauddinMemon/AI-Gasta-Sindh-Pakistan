'use client';

export default function Card({ children, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      {...props}
      className={`rounded-2xl border border-ink-200/70 bg-white shadow-card ${className}`}
    >
      {children}
    </Tag>
  );
}
