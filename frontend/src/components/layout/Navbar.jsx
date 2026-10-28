import React from 'react';
import { Menu, Plus, QrCode, Clock, Sparkles, LogOut, User, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '@/utils/formatters';
import logo from '@/assets/logo.png';

export default function Navbar({ onToggleSidebar, onOpenNewVisit, onOpenQris, onOpenInstall }) {
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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-brand-100/70 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Page Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-1 sm:ml-0 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors shrink-0"
            title="Buka Menu"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <img 
              src={logo} 
              alt="PMB Rumah Maryam" 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain bg-white p-0.5 border border-brand-200/80 shadow-sm shrink-0" 
            />
            <div className="hidden sm:block min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-700 tracking-wide truncate">
                  PMB Rumah Maryam
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200 shrink-0">
                  <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                  Layanan Buka (Homecare & Klinik)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                {todayFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Install PWA Button */}
          {onOpenInstall && (
            <button
              type="button"
              onClick={onOpenInstall}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 transition-all flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95"
              title="Install Aplikasi di Komputer / Tablet"
            >
              <Download className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="hidden xl:inline whitespace-nowrap">Install App</span>
            </button>
          )}

          {/* QRIS / Transfer Button */}
          <button
            type="button"
            onClick={onOpenQris}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 transition-all flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95"
            title="Lihat QRIS & No Rekening BSI"
          >
            <QrCode className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">QRIS & BSI</span>
          </button>

          {/* Quick Register Service / Homevisit Button */}
          <button
            type="button"
            onClick={onOpenNewVisit}
            className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-sm shadow-brand-500/25 hover:shadow-brand-500/35 transition-all flex items-center gap-1 sm:gap-1.5 active:scale-95 shrink-0 whitespace-nowrap"
            title="Tambah Layanan Baru"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Layanan</span>
          </button>

          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-100 to-pink-100 text-brand-700 border border-brand-200/80 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm"
                  title={`${user.nama} (${isAdmin ? 'Admin' : 'Bidan'})`}
                >
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
                <div className="hidden lg:block text-left">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors shrink-0"
                title="Keluar (Logout)"
                aria-label="Logout"
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
