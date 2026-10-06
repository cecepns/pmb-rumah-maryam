import React, { useState } from 'react';
import { Copy, Check, Download, QrCode, Building, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/common/Modal';

export default function QrisModal({ isOpen, onClose, config = {} }) {
  const [copied, setCopied] = useState(false);

  const bankName = config.bank_nama || 'Bank Syariah Indonesia (BSI)';
  const rekening = config.bank_rekening || '7124826197';
  const atasNama = config.bank_atas_nama || 'Norhalimah';
  const qrisUrl = config.qris_image_url || '/uploads/qris.jpeg';

  const handleCopyRekening = () => {
    navigator.clipboard.writeText(rekening);
    setCopied(true);
    toast.success('Nomor rekening BSI berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pembayaran QRIS & Transfer Bank"
      subtitle="PMB Rumah Maryam — Bebas Biaya Admin"
      maxWidth="max-w-lg"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Tutup
        </button>
      }
    >
      <div className="space-y-5 text-center">
        {/* QRIS Display Container */}
        <div className="bg-gradient-to-b from-brand-50/70 to-pink-50/30 p-4 sm:p-5 rounded-2xl border border-brand-100 flex flex-col items-center shadow-inner">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md max-w-[280px] w-full">
            <img
              src={qrisUrl}
              alt="QRIS PMB Rumah Maryam"
              className="w-full h-auto object-contain rounded-xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/qris.jpeg';
              }}
            />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Scan via BCA, Mandiri, BSI, GoPay, OVO, Dana & ShopeePay</span>
          </div>
          <a
            href={qrisUrl}
            download="qris-rumah-maryam.jpeg"
            className="mt-2 text-xs text-brand-600 hover:text-brand-800 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Gambar QRIS
          </a>
        </div>

        {/* Bank Transfer Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              Transfer Bank Langsung
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              Terverifikasi
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
            <div>
              <p className="text-xs font-medium text-slate-500">{bankName}</p>
              <p className="text-lg font-bold text-slate-800 tracking-wide font-mono mt-0.5">
                {rekening}
              </p>
              <p className="text-xs font-semibold text-brand-600 mt-0.5">
                a.n. {atasNama}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyRekening}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200'
              }`}
              title="Salin Nomor Rekening"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed text-center">
            Setelah transfer, bukti pembayaran dapat dikonfirmasi via WhatsApp atau langsung ditandai lunas di sistem.
          </p>
        </div>
      </div>
    </Modal>
  );
}
