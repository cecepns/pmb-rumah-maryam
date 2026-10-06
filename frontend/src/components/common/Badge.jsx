import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantStyles = {
    // Status Kunjungan
    terjadwal: 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/20',
    dalam_proses: 'bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-500/20',
    selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/20',
    batal: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10',

    // Pembayaran
    lunas: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    belum_lunas: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',

    // Tipe Layanan
    homevisit: 'bg-brand-50 text-brand-700 border-brand-200/80 ring-brand-500/20 font-semibold',
    klinik: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',

    // Kategori
    ibu: 'bg-pink-50 text-pink-700 border-pink-200',
    bayi: 'bg-sky-50 text-sky-700 border-sky-200',
    homecare: 'bg-brand-50 text-brand-700 border-brand-200',
    newborn: 'bg-teal-50 text-teal-700 border-teal-200',
    kb: 'bg-violet-50 text-violet-700 border-violet-200',
    imunisasi: 'bg-amber-50 text-amber-700 border-amber-200',
    umum: 'bg-slate-100 text-slate-700 border-slate-200',

    // Generic
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs font-semibold'
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${currentVariant} ${currentSize} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
}
