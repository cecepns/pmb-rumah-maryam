import React from 'react';
import { Inbox, AlertCircle } from 'lucide-react';

export function LoadingSpinner({ text = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-xs sm:text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      <div className="h-10 bg-slate-100 rounded-xl"></div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-8 bg-slate-50 border border-slate-100 rounded-lg flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = 'Belum Ada Data',
  message = 'Tidak ada catatan yang ditemukan untuk kriteria ini.',
  actionText,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 text-brand-500 flex items-center justify-center mb-4 shadow-soft">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800 font-display">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">{message}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all shadow-md shadow-brand-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message = 'Gagal memuat data', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800">Terjadi Kesalahan</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
