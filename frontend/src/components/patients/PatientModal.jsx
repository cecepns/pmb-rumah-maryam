import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { Camera, User, Phone, MapPin, Calendar, Heart, AlertCircle } from 'lucide-react';

export default function PatientModal({ isOpen, onClose, patient = null, onSuccess }) {
  const isEdit = !!patient?.id;

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    tanggal_lahir: '',
    hp_wa: '',
    alamat: '',
    nama_suami: '',
    golongan_darah: '',
    alergi: '',
    catatan_khusus: '',
    foto_url: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        nama: patient.nama || '',
        nik: patient.nik || '',
        tanggal_lahir: patient.tanggal_lahir ? patient.tanggal_lahir.slice(0, 10) : '',
        hp_wa: patient.hp_wa || '',
        alamat: patient.alamat || '',
        nama_suami: patient.nama_suami || '',
        golongan_darah: patient.golongan_darah || '',
        alergi: patient.alergi || '',
        catatan_khusus: patient.catatan_khusus || '',
        foto_url: patient.foto_url || '',
      });
    } else {
      setFormData({
        nama: '',
        nik: '',
        tanggal_lahir: '',
        hp_wa: '',
        alamat: '',
        nama_suami: '',
        golongan_darah: '',
        alergi: '',
        catatan_khusus: '',
        foto_url: '',
      });
    }
  }, [patient, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await request.upload(API_ENDPOINTS.UPLOAD.FILE, file);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, foto_url: res.data.url }));
        toast.success('Foto pasien berhasil diunggah');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      toast.error('Nama pasien wajib diisi');
      return;
    }
    if (!formData.hp_wa.trim()) {
      toast.error('Nomor WhatsApp wajib diisi untuk pengiriman notifikasi');
      return;
    }

    try {
      setIsLoading(true);
      if (isEdit) {
        await request.put(API_ENDPOINTS.PASIEN.UPDATE(patient.id), formData);
        toast.success('Data pasien berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.PASIEN.CREATE, formData);
        toast.success('Pasien baru berhasil didaftarkan');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data pasien');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Data Pasien (${patient.no_rm})` : 'Daftarkan Pasien Baru'}
      subtitle="Data rekam medis ibu & anak PMB Rumah Maryam"
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            <span>{isEdit ? 'Simpan Perubahan' : 'Daftarkan Pasien'}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo & Basic Info Row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3 bg-brand-50/50 rounded-2xl border border-brand-100">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-brand-300 flex items-center justify-center overflow-hidden shadow-sm">
              {formData.foto_url ? (
                <img
                  src={formData.foto_url}
                  alt="Foto Pasien"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-brand-400" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-brand-600 text-white cursor-pointer hover:bg-brand-700 shadow-md transition-all">
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1 w-full space-y-1 text-center sm:text-left">
            <p className="text-xs font-bold text-brand-700">Foto Pasien / Ibu</p>
            <p className="text-[11px] text-slate-500">
              {isUploading ? 'Sedang mengunggah...' : 'Format JPG, PNG atau WebP (Maks 5MB)'}
            </p>
            {formData.foto_url && (
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, foto_url: '' }))}
                className="text-[11px] text-rose-600 hover:underline inline-block font-semibold"
              >
                Hapus Foto
              </button>
            )}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Nama Lengkap */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Nama Lengkap Pasien <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Contoh: Bunda Siti Rahma"
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>

          {/* Nomor WhatsApp */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Nomor WhatsApp (Aktif) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="hp_wa"
                value={formData.hp_wa}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>

          {/* NIK */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              NIK (Nomor Induk Kependudukan)
            </label>
            <input
              type="text"
              name="nik"
              value={formData.nik}
              onChange={handleChange}
              placeholder="16 digit NIK"
              maxLength={16}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>

          {/* Tanggal Lahir */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Tanggal Lahir
            </label>
            <input
              type="date"
              name="tanggal_lahir"
              value={formData.tanggal_lahir}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>

          {/* Nama Suami */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Nama Suami / Penanggung Jawab
            </label>
            <input
              type="text"
              name="nama_suami"
              value={formData.nama_suami}
              onChange={handleChange}
              placeholder="Contoh: Bpk. Dimas Pratama"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>

          {/* Golongan Darah */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Golongan Darah
            </label>
            <select
              name="golongan_darah"
              value={formData.golongan_darah}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            >
              <option value="">-- Pilih Golongan Darah --</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>

          {/* Alergi Obat / Makanan */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Riwayat Alergi (Obat / Makanan)
            </label>
            <input
              type="text"
              name="alergi"
              value={formData.alergi}
              onChange={handleChange}
              placeholder="Contoh: Alergi Amoksisilin, seafood, atau tidak ada"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>

          {/* Alamat Lengkap */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Alamat Lengkap (Penting untuk Layanan Homevisit)
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              rows={2}
              placeholder="Nama jalan, nomor rumah, RT/RW, kompleks, kelurahan/kecamatan..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>

          {/* Catatan Khusus */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Catatan Khusus Bidan / Kondisi Pasien
            </label>
            <textarea
              name="catatan_khusus"
              value={formData.catatan_khusus}
              onChange={handleChange}
              rows={2}
              placeholder="Contoh: Kehamilan anak pertama, riwayat tensi tinggi, bayi lahir sesar, dll"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
