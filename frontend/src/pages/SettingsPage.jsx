import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Settings, Building, CreditCard, QrCode, Upload, Save,
  Calendar, MapPin, Phone, Instagram, ShieldCheck, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { formatRupiah } from '@/utils/formatters';

const VAKSIN_JADWAL = [
  { usia: 'Saat Lahir (0 - 24 Jam)', vaksin: 'HB-0 (Hepatitis B Monovalen)' },
  { usia: '1 Bulan', vaksin: 'BCG, Polio 1' },
  { usia: '2 Bulan', vaksin: 'DPT-HB-Hib 1, Polio 2, PCV 1, Rotavirus 1' },
  { usia: '3 Bulan', vaksin: 'DPT-HB-Hib 2, Polio 3, PCV 2, Rotavirus 2' },
  { usia: '4 Bulan', vaksin: 'DPT-HB-Hib 3, Polio 4 / IPV 1, Rotavirus 3' },
  { usia: '9 Bulan', vaksin: 'Campak / MR 1, IPV 2' },
  { usia: '18 Bulan', vaksin: 'DPT-HB-Hib Lanjutan (Booster), Campak / MR Lanjutan' },
  { usia: '24 Bulan', vaksin: 'Imunisasi Lengkap Booster Lanjutan' },
];

export default function SettingsPage() {
  const { config, refreshConfig, onOpenQris } = useOutletContext();

  const [formData, setFormData] = useState({
    nama_praktik: 'PMB Rumah Maryam',
    tagline: 'Praktik Mandiri Bidan & Homecare Spesialis Ibu & Anak',
    bidan_nama: 'Bdn. Norhalimah, S.Tr.Keb',
    sipb: 'SIPB. 503/446/PMB/2024',
    alamat: 'Jl. Manunggal No. 12, Banjarmasin',
    no_wa: '6282350313030',
    instagram: '@rumahmaryam.id',
    bank_nama: 'BSI (Bank Syariah Indonesia)',
    bank_rekening: '7124826197',
    bank_atas_nama: 'Norhalimah',
    qris_image_url: '/uploads/qris.jpeg',
    default_transport_fee: 25000,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (config && Object.keys(config).length > 0) {
      setFormData({
        nama_praktik: config.nama_praktik || 'PMB Rumah Maryam',
        tagline: config.tagline || '',
        bidan_nama: config.bidan_nama || '',
        sipb: config.sipb || '',
        alamat: config.alamat || '',
        no_wa: config.no_wa || '',
        instagram: config.instagram || '',
        bank_nama: config.bank_nama || 'BSI',
        bank_rekening: config.bank_rekening || '7124826197',
        bank_atas_nama: config.bank_atas_nama || 'Norhalimah',
        qris_image_url: config.qris_image_url || '/uploads/qris.jpeg',
        default_transport_fee: Number(config.default_transport_fee) || 25000,
      });
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQRISUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await request.upload(API_ENDPOINTS.UPLOAD.FILE, file);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, qris_image_url: res.data.url }));
        toast.success('Gambar QRIS berhasil diunggah!');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah gambar QRIS');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await request.put(API_ENDPOINTS.CONFIG.UPDATE, {
        ...formData,
        default_transport_fee: Number(formData.default_transport_fee)
      });
      toast.success('Pengaturan klinik & rekening berhasil disimpan!');
      if (refreshConfig) refreshConfig();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header Bar */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-600" />
          Pengaturan PMB Rumah Maryam
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Identitas praktik mandiri bidan, rekening bank BSI, QRIS, dan tarif dasar transport homevisit
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profil Praktik Bidan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base font-display">
              Informasi Praktik Mandiri Bidan (PMB)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Nama Praktik</label>
              <input
                type="text"
                name="nama_praktik"
                value={formData.nama_praktik}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Bidan Penanggung Jawab</label>
              <input
                type="text"
                name="bidan_nama"
                value={formData.bidan_nama}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Nomor SIPB Bidan</label>
              <input
                type="text"
                name="sipb"
                value={formData.sipb}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">No. WhatsApp Business</label>
              <input
                type="text"
                name="no_wa"
                value={formData.no_wa}
                onChange={handleChange}
                placeholder="62823xxxxxxx"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Instagram Resmi</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@rumahmaryam.id"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Slogan / Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">Alamat Tempat Praktik</label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Rekening & Pembayaran QRIS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base font-display">
                Rekening Pembayaran & QRIS
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenQris}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline"
            >
              Lihat Tampilan QRIS &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Nama Bank</label>
              <input
                type="text"
                name="bank_nama"
                value={formData.bank_nama}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Nomor Rekening</label>
              <input
                type="text"
                name="bank_rekening"
                value={formData.bank_rekening}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Atas Nama Rekening</label>
              <input
                type="text"
                name="bank_atas_nama"
                value={formData.bank_atas_nama}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Tarif Dasar Transport Homevisit (Rp)
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                name="default_transport_fee"
                value={formData.default_transport_fee}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-brand-700 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* QRIS Upload Box */}
          <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 p-2 shadow-sm flex items-center justify-center shrink-0">
              <img
                src={formData.qris_image_url}
                alt="QRIS Preview"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/qris.jpeg';
                }}
              />
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left">
              <p className="text-xs font-bold text-slate-800">Gambar QRIS PMB Rumah Maryam</p>
              <p className="text-[11px] text-slate-500">
                File saat ini: {formData.qris_image_url}
              </p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 text-xs font-bold cursor-pointer transition-all shadow-sm">
                <Upload className="w-3.5 h-3.5 text-brand-600" />
                <span>{isUploading ? 'Sedang Mengunggah...' : 'Ganti Gambar QRIS'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQRISUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Referensi Jadwal Imunisasi Nasional */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-card space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base font-display">
            Panduan Jadwal Imunisasi Nasional (IDAI / Kemenkes)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Gunakan referensi ini sebagai acuan otomatis saat menjadwalkan suntik vaksin bayi & balita.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Usia Bayi / Anak</th>
                <th className="py-2.5 px-3">Jenis Vaksin Wajib</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {VAKSIN_JADWAL.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-bold text-brand-700 whitespace-nowrap">
                    {item.usia}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{item.vaksin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
