import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock, User, Eye, EyeOff, Heart, Sparkles, LogIn,
  ShieldCheck, ArrowRight, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleQuickLogin = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('bidan');
      setPassword('bidan123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF1F4] via-[#FFF9FB] to-[#FCE7F3] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background aesthetic decorative blur orbs */}
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-brand-200/40 blur-3xl pointer-events-none"></div>
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-pink-300/30 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Card Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-brand-500/25 border-2 border-white">
            <div className="relative">
              <Heart className="w-8 h-8 text-pink-200 fill-pink-200/50" />
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[8px] border-b-white"></span>
            </div>
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

          {/* Quick Demo Login Helper */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider text-center">
              Akses Cepat Pengguna (Akun Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl border border-brand-200 bg-brand-50/60 hover:bg-brand-100/80 text-left transition-all group"
              >
                <span className="text-[11px] font-bold text-brand-800 block truncate flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  Admin / Owner
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                  admin / admin123
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('bidan')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <span className="text-[11px] font-bold text-slate-800 block truncate flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                  Bidan Pelaksana
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                  bidan / bidan123
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400">
          <p>Sistem Layanan PMB Rumah Maryam &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
