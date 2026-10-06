import React from 'react';
import { Menu, Plus, QrCode, Clock, Sparkles } from 'lucide-react';

export default function Navbar({ onToggleSidebar, onOpenNewVisit, onOpenQris }) {
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-brand-100/70 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-500" />
                PMB Rumah Maryam
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                <Clock className="w-3 h-3 text-emerald-600" />
                Layanan Buka (Homecare & Klinik)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block mt-0.5">
              {todayFormatted}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* QRIS / Transfer Button */}
          <button
            type="button"
            onClick={onOpenQris}
            className="px-3 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 transition-all flex items-center gap-1.5 shadow-sm"
            title="Lihat QRIS & No Rekening BSI"
          >
            <QrCode className="w-4 h-4 text-brand-600" />
            <span className="hidden sm:inline">QRIS & BSI</span>
          </button>

          {/* Quick Register Service / Homevisit Button */}
          <button
            type="button"
            onClick={onOpenNewVisit}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Layanan / Homevisit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
