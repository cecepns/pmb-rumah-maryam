import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';

export default function ServiceModal({ isOpen, onClose, service = null, onSuccess }) {
  const isEdit = !!service?.id;

  const [formData, setFormData] = useState({
    nama_layanan: '',
    kategori: 'ibu',
    tarif: '',
    is_homecare_available: 1,
    deskripsi: '',
    is_active: 1,
    kode: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        nama_layanan: service.nama_layanan || '',
        kategori: service.kategori || 'ibu',
        tarif: service.tarif || '',
        is_homecare_available: service.is_homecare_available ? 1 : 0,
        deskripsi: service.deskripsi || '',
        is_active: service.is_active ? 1 : 0,
        kode: service.kode || '',
      });
    } else {
      setFormData({
        nama_layanan: '',
        kategori: 'ibu',
        tarif: '',
        is_homecare_available: 1,
        deskripsi: '',
        is_active: 1,
        kode: '',
      });
    }
  }, [service, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_layanan.trim()) {
      toast.error('Nama layanan wajib diisi');
      return;
    }
    if (formData.tarif === '' || isNaN(formData.tarif) || Number(formData.tarif) < 0) {
      toast.error('Tarif layanan wajib diisi angka valid');
      return;
    }

    try {
      setIsLoading(true);
      if (isEdit) {
        await request.put(API_ENDPOINTS.LAYANAN.UPDATE(service.id), {
          ...formData,
          tarif: Number(formData.tarif)
        });
        toast.success('Layanan berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.LAYANAN.CREATE, {
          ...formData,
          tarif: Number(formData.tarif)
        });
        toast.success('Layanan baru berhasil ditambahkan');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan layanan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Layanan: ${service.nama_layanan}` : 'Tambah Layanan & Tarif Baru'}
      subtitle="Katalog tarif resmi PMB Rumah Maryam"
      maxWidth="max-w-lg"
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
            <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Layanan'}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Layanan */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Nama Layanan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nama_layanan"
            value={formData.nama_layanan}
            onChange={handleChange}
            placeholder="Contoh: Pijat Bayi Homecare, ANC, Imunisasi BCG..."
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          />
        </div>

        {/* Kategori & Tarif Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Kategori Layanan <span className="text-rose-500">*</span>
            </label>
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            >
              <option value="ibu">Layanan Ibu (ANC, Yoga, Persalinan, Nifas)</option>
              <option value="bayi">Bayi & Balita (Baby Spa, MPASI)</option>
              <option value="homecare">Homecare (Pijat Bayi, Hamil, Laktasi)</option>
              <option value="newborn">Newborn Care & Mom Treatment</option>
              <option value="kb">Pelayanan KB</option>
              <option value="imunisasi">Imunisasi / Vaksin</option>
              <option value="umum">Berobat Umum</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Biaya / Tarif (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="tarif"
              value={formData.tarif}
              onChange={handleChange}
              placeholder="Contoh: 100000"
              min="0"
              step="1000"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
        </div>

        {/* Kode Layanan (Opsional) */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Kode Layanan (Opsional)
          </label>
          <input
            type="text"
            name="kode"
            value={formData.kode}
            onChange={handleChange}
            placeholder="Otomatis jika dikosongkan (contoh: SRV-HOME-01)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          />
        </div>

        {/* Deskripsi Layanan */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Deskripsi & Manfaat Layanan
          </label>
          <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            rows={2}
            placeholder="Tuliskan tindakan atau manfaat yang didapatkan pasien..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          />
        </div>

        {/* Checkbox Options */}
        <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              name="is_homecare_available"
              checked={!!formData.is_homecare_available}
              onChange={handleChange}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <span>Dapat dilayani via <strong>Homevisit (Kunjungan ke Rumah)</strong></span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              name="is_active"
              checked={!!formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <span>Status Layanan Aktif (Ditampilkan dalam formulir pendaftaran)</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
