import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  footer
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card Centering Container */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div 
          className={`w-full ${maxWidth} relative z-10 transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-brand-100 flex flex-col max-h-[92vh] animate-scale-up`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-100/70 px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-brand-50/50 to-white shrink-0">
            <div className="min-w-0 pr-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 font-display tracking-tight flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-brand-500 inline-block shrink-0"></span>
                <span className="truncate">{title}</span>
              </h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 space-y-4 text-sm">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="border-t border-brand-100/70 bg-slate-50/70 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-end gap-3 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
