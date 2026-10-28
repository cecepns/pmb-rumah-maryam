import React, { useState, useEffect } from 'react';
import { Download, Monitor, Tablet, Smartphone, X, Sparkles, Share, PlusSquare } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export default function PwaInstallPrompt({ manualOpen, onCloseManual }) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstall();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (manualOpen) {
      setIsOpen(true);
      return;
    }

    // Check if dismissed previously in this session
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (!dismissed && (isInstallable || isIOS) && !isInstalled) {
      // Delay prompt slightly so page loads first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [manualOpen, isInstallable, isIOS, isInstalled]);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    if (onCloseManual) onCloseManual();
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, show step-by-step
      return;
    }
    const installed = await promptInstall();
    if (installed) {
      setIsOpen(false);
      if (onCloseManual) onCloseManual();
    }
  };

  if (!isOpen || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden transform transition-all animate-scale-up">
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-brand-500 via-pink-500 to-rose-400" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          {/* Logo container with white background and neat proportions */}
          <div className="mx-auto w-24 h-24 rounded-2xl bg-white border border-pink-100 shadow-md p-2 flex items-center justify-center mb-4">
            <img
              src="/icons/icon-192.png"
              alt="Logo PMB Rumah Maryam"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/80 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Aplikasi Resmi PMB Rumah Maryam</span>
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            Install Aplikasi di Perangkat Anda
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
            Pasang langsung di <strong>Komputer, Tablet, atau HP</strong> untuk akses lebih cepat, nyaman, dan tampilan layar penuh.
          </p>

          {/* Device Support Badges */}
          <div className="flex items-center justify-center gap-4 my-4 py-2.5 px-3 bg-pink-50/50 rounded-2xl border border-pink-100/80 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-brand-600" />
              <span>Komputer / PC</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <Tablet className="w-4 h-4 text-brand-600" />
              <span>Tablet / iPad</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-brand-600" />
              <span>Ponsel</span>
            </div>
          </div>

          {/* iOS Safari Instruction */}
          {isIOS ? (
            <div className="text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2 mb-5">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <span>Cara Pasang di iPad / iPhone:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>
                  Tekan tombol <Share className="w-3.5 h-3.5 inline text-blue-600" /> (Bagikan / Share) di menu browser Safari.
                </li>
                <li>
                  Gulir ke bawah dan pilih <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" /> <strong>"Tambah ke Layar Utama"</strong>.
                </li>
                <li>Tekan <strong>"Tambah"</strong> di pojok kanan atas.</li>
              </ol>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Nanti Saja
            </button>
            {!isIOS && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700 shadow-md shadow-brand-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Install Sekarang</span>
              </button>
            )}
            {isIOS && (
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
              >
                Saya Mengerti
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
