import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock, User, Eye, EyeOff, Sparkles, LogIn, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import PwaInstallPrompt from '@/components/common/PwaInstallPrompt';
import { usePwaInstall } from '@/hooks/usePwaInstall';

import logo from '@/assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { isInstalled } = usePwaInstall();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Silakan masukkan username atau email');
      return;
    }
    if (!password) {
      toast.error('Silakan masukkan password');
      return;
    }

    try {
      setIsLoading(true);
      const user = await login(username, password);
      toast.success(`Selamat datang kembali, ${user.nama}! 🌸`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login gagal. Periksa kembali username & password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF1F4] via-[#FFF9FB] to-[#FCE7F3] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background aesthetic decorative blur orbs */}
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-brand-200/40 blur-3xl pointer-events-none"></div>
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-pink-300/30 blur-3xl pointer-events-none"></div>

      {/* Floating PWA Install Button */}
      {!isInstalled && (
        <aside
          aria-label="Install Aplikasi PWA"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="group flex items-center gap-2.5 sm:gap-3 bg-white/95 hover:bg-white backdrop-blur-md border border-brand-200/90 hover:border-brand-400 p-2 sm:px-3.5 sm:py-2.5 rounded-2xl shadow-xl shadow-brand-900/10 hover:shadow-brand-900/20 transition-all duration-200 active:scale-95 text-left"
            title="Install Aplikasi di Komputer, Tablet, atau HP"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 border border-pink-100 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/icons/icon-192.png"
                alt="Logo PMB Rumah Maryam"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 pr-1 text-left">
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-700 block truncate leading-tight">
                Install Aplikasi PMB
              </span>
              <span className="text-[10px] text-slate-500 font-medium block truncate leading-tight mt-0.5">
                Komputer • Tablet • HP
              </span>
            </div>
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors shrink-0">
              <Download className="w-4 h-4" />
            </div>
          </button>
        </aside>
      )}

      {/* Modal Prompt Install */}
      <PwaInstallPrompt
        manualOpen={isInstallModalOpen}
        onCloseManual={() => setIsInstallModalOpen(false)}
      />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Card Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-3xl bg-white p-2 shadow-xl shadow-brand-500/20 border-2 border-brand-100 flex items-center justify-center mx-auto">
            <img src={logo} alt="PMB Rumah Maryam" className="w-full h-full object-contain" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-[11px] font-bold text-brand-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            PMB Rumah Maryam
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Masuk ke Sistem
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Praktik Mandiri Bidan & Homecare Spesialis Ibu & Anak (@rumahmaryam.id)
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-brand-100 p-6 sm:p-8 shadow-2xl shadow-brand-900/5 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Username atau Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau email"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>Masuk ke Dashboard</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400">
          <p>Sistem Layanan PMB Rumah Maryam &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
