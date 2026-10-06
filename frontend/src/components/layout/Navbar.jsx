import React from 'react';
import { Menu, Plus, QrCode, Clock, Sparkles, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '@/utils/formatters';

export default function Navbar({ onToggleSidebar, onOpenNewVisit, onOpenQris }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(true);
    navigate('/login');
  };

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

        {/* Right: Quick Action Buttons & User Menu */}
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
            <span className="hidden xs:inline">+ Layanan</span>
            <span className="xs:hidden">+ Layanan</span>
          </button>

          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-100 to-pink-100 text-brand-700 border border-brand-200/80 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm">
                  {user.foto_url ? (
                    <img
                      src={user.foto_url}
                      alt={user.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(user.nama || user.username)}</span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px] leading-tight">
                    {user.nama}
                  </span>
                  <span className={`text-[10px] font-semibold leading-tight ${isAdmin ? 'text-purple-600' : 'text-emerald-600'}`}>
                    {isAdmin ? 'Admin' : 'Bidan'}
                  </span>
                </div>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                title="Keluar (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
