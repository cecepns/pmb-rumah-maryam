import React, { useState, useEffect } from 'react';
import { Send, Copy, Check, MessageCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import {
  WA_MESSAGE_TYPES,
  WA_TYPE_LABELS,
  buildWhatsAppMessage,
  openWhatsAppDirect
} from '@/utils/whatsapp';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { normalizeWA } from '@/utils/formatters';

export default function WAMessagePreviewModal({
  isOpen,
  onClose,
  initialType = WA_MESSAGE_TYPES.INVOICE_HOMEVISIT,
  visit,
  patient,
  config = {},
  onSuccess
}) {
  const [selectedType, setSelectedType] = useState(initialType);
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultType = visit?.tipe_layanan === 'homevisit'
        ? WA_MESSAGE_TYPES.INVOICE_HOMEVISIT
        : initialType;
      setSelectedType(defaultType);
      const generated = buildWhatsAppMessage(defaultType, { visit, patient, config });
      setMessageText(generated);
    }
  }, [isOpen, initialType, visit, patient, config]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    const generated = buildWhatsAppMessage(type, { visit, patient, config });
    setMessageText(generated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    toast.success('Teks pesan berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWA = async () => {
    const rawPhone = patient?.hp_wa || visit?.pasien_wa;
    if (!rawPhone) {
      toast.error('Nomor WhatsApp pasien tidak ditemukan!');
      return;
    }

    try {
      setIsSending(true);

      // 1. Open WhatsApp in new tab
      openWhatsAppDirect(rawPhone, messageText);

      // 2. Save to wa_log in backend
      try {
        await request.post(API_ENDPOINTS.WA_LOG.CREATE, {
          pasien_id: patient?.id || visit?.pasien_id,
          pasien_nama: patient?.nama || visit?.pasien_nama,
          no_wa: rawPhone,
          jenis_pesan: selectedType,
          pesan: messageText,
          status: 'dibuka_ke_wa'
        });
      } catch (logErr) {
        console.warn('Failed to log WA message:', logErr);
      }

      toast.success('Pesan WhatsApp dibuka untuk dikirim!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Gagal membuka WhatsApp');
    } finally {
      setIsSending(false);
    }
  };

  const patientPhone = patient?.hp_wa || visit?.pasien_wa || '-';
  const cleanPhone = normalizeWA(patientPhone);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kirim Pesan WhatsApp"
      subtitle={`Penerima: ${patient?.nama || visit?.pasien_nama || 'Pasien'} (${patientPhone})`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSendWA}
              disabled={isSending || !patientPhone}
              className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Buka di WhatsApp &rarr;</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Template Selector Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Pilih Template Pesan
          </label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(WA_TYPE_LABELS).map(([typeKey, typeLabel]) => (
              <button
                key={typeKey}
                type="button"
                onClick={() => handleTypeChange(typeKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedType === typeKey
                    ? 'bg-brand-600 text-white font-bold shadow-sm shadow-brand-200 ring-2 ring-brand-500/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {typeLabel}
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp Preview Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Pratinjau Pesan (Bisa Diedit Manual)
            </label>
            <span className="text-[11px] text-slate-400">
              Target: +{cleanPhone}
            </span>
          </div>

          <div className="relative rounded-2xl bg-[#EFEAE2] p-3 sm:p-4 border border-emerald-900/10 shadow-inner">
            {/* WhatsApp Chat Bubble */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 relative">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={11}
                className="w-full bg-transparent text-slate-800 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-none border-none p-0 whitespace-pre-wrap selection:bg-emerald-100"
                placeholder="Tulis pesan..."
              />
              <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400">
                <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-emerald-500 font-bold">&#10003;&#10003;</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80">
          💡 <strong>Tips:</strong> Klik "Buka di WhatsApp" untuk membuka WhatsApp Web atau WhatsApp Mobile secara otomatis dengan nomor tujuan dan pesan yang sudah siap dikirim.
        </p>
      </div>
    </Modal>
  );
}
