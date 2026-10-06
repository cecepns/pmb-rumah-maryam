import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  CalendarCheck,
  Stethoscope,
  Wallet,
  MessageCircle,
  Settings,
  X,
  QrCode,
  Heart,
  ChevronRight,
  UserCheck,
  LogOut,
  ShieldCheck,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/formatters';

export default function Sidebar({ isOpen, onClose, onOpenQris }) {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout(true);
    navigate('/login');
  };

  const menuItems = [
    {
      to: '/',
      label: 'Beranda',
      icon: Home,
      exact: true,
      description: 'Ringkasan & Aksi Cepat'
    },
    {
      to: '/pasien',
      label: 'Daftar Pasien',
      icon: Users,
      description: 'Rekam Medis & Kontak'
    },
    {
      to: '/kunjungan',
      label: 'Layanan & Kunjungan',
      icon: CalendarCheck,
      description: 'Klinik & Homevisit'
    },
    {
      to: '/layanan',
      label: 'Master Layanan & Biaya',
      icon: Stethoscope,
      description: 'Tarif & Kategori'
    },
    {
      to: '/keuangan',
      label: 'Uang Masuk / Keluar',
      icon: Wallet,
      description: 'Laporan Kas PMB'
    },
    {
      to: '/tagihan',
      label: 'Tagihan & Pesan WA',
      icon: MessageCircle,
      description: 'Piutang & Notifikasi'
    },
    {
      to: '/users',
      label: 'Manajemen Pengguna',
      icon: UserCheck,
      description: 'Kelola Bidan & Admin'
    },
    {
      to: '/pengaturan',
      label: 'Pengaturan & Profil',
      icon: Settings,
      description: 'Info PMB & Rekening'
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-brand-600 via-brand-700 to-brand-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner shrink-0">
              {/* Roof & Heart motif */}
              <div className="relative">
                <Heart className="w-6 h-6 text-pink-300 fill-pink-300/40" />
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white"></span>
              </div>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white tracking-wide leading-tight">
                Rumah Maryam
              </h1>
              <p className="text-[10px] text-pink-200/80 font-medium tracking-wider uppercase mt-0.5">
                Praktik Mandiri Bidan
              </p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-pink-200/50">
            Menu Utama
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-brand-700 font-bold shadow-lg shadow-black/10 scale-[1.01]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-600'
                            : 'bg-white/5 text-pink-200 group-hover:bg-white/10 group-hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span>{item.label}</span>
                        <p className={`text-[10px] font-normal leading-none mt-0.5 ${isActive ? 'text-brand-500' : 'text-pink-200/60'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'opacity-100 text-brand-600 translate-x-0.5' : 'opacity-0 group-hover:opacity-40'}`} />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer: User Profile & Quick QRIS Card */}
        <div className="p-3.5 border-t border-white/10 bg-black/15 space-y-2.5">
          {/* Logged in User Card */}
          {user && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between gap-2 border border-white/15">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white text-brand-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-inner">
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
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white block truncate">
                      {user.nama}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                      isAdmin
                        ? 'bg-purple-400/25 text-purple-200 border border-purple-300/30'
                        : 'bg-emerald-400/25 text-emerald-200 border border-emerald-300/30'
                    }`}>
                      {isAdmin ? 'Admin' : 'Bidan'}
                    </span>
                    <span className="text-[10px] text-pink-200/60 truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-pink-200/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title="Keluar (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick QRIS Card */}
          <button
            type="button"
            onClick={onOpenQris}
            className="w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-white/15 rounded-xl p-2.5 flex items-center gap-2.5 hover:bg-white/15 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-white text-brand-700 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">
                QRIS & Rekening BSI
              </span>
              <span className="text-[10px] text-pink-200 block truncate">
                7124826197 (Norhalimah)
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
