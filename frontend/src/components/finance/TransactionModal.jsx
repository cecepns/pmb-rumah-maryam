import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';

const KATEGORI_MASUK = [
  'Biaya Layanan',
  'Homecare + Transport',
  'Penjualan Produk / Perlengkapan Bayi',
  'Penjualan Obat / Vitamin',
  'Lain-lain'
];

const KATEGORI_KELUAR = [
  'Pembelian BHP',
  'Gaji Owner',
  'Gaji Bidan Tetap',
  'Gaji Bidan Freelance',
  'Keperluan PMB',
  'Listrik & Kuota',
  'Obat-obatan',
  'Sampah Medis',
  'Sedekah',
  'Pelatihan/Seminar',
  'Lain-lain'
];

export default function TransactionModal({ isOpen, onClose, transaction = null, defaultTipe = 'masuk', onSuccess }) {
  const isEdit = !!transaction?.id;

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    tipe: defaultTipe,
    kategori: defaultTipe === 'masuk' ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0],
    jumlah: '',
    keterangan: '',
    pasien_nama: '',
    metode: 'Transfer BSI',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        tanggal: transaction.tanggal ? transaction.tanggal.slice(0, 10) : new Date().toISOString().slice(0, 10),
        tipe: transaction.tipe || 'masuk',
        kategori: transaction.kategori || (transaction.tipe === 'masuk' ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0]),
        jumlah: transaction.jumlah || '',
        keterangan: transaction.keterangan || '',
        pasien_nama: transaction.pasien_nama || '',
        metode: transaction.metode || 'Transfer BSI',
      });
    } else {
      setFormData({
        tanggal: new Date().toISOString().slice(0, 10),
        tipe: defaultTipe,
        kategori: defaultTipe === 'masuk' ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0],
        jumlah: '',
        keterangan: '',
        pasien_nama: '',
        metode: 'Transfer BSI',
      });
    }
  }, [transaction, defaultTipe, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Switch category default if type changes
      if (name === 'tipe') {
        updated.kategori = value === 'masuk' ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0];
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tanggal) {
      toast.error('Tanggal transaksi wajib diisi');
      return;
    }
    if (!formData.jumlah || Number(formData.jumlah) <= 0) {
      toast.error('Nominal transaksi wajib diisi angka lebih dari 0');
      return;
    }

    try {
      setIsLoading(true);
      if (isEdit) {
        await request.put(API_ENDPOINTS.TRANSAKSI.UPDATE(transaction.id), {
          ...formData,
          jumlah: Number(formData.jumlah)
        });
        toast.success('Transaksi keuangan berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.TRANSAKSI.CREATE, {
          ...formData,
          jumlah: Number(formData.jumlah)
        });
        toast.success('Transaksi keuangan berhasil dicatat');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  const kategoriOpts = formData.tipe === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Transaksi Keuangan' : (formData.tipe === 'masuk' ? 'Catat Pemasukan Kas' : 'Catat Pengeluaran Kas')}
      subtitle="Buku kas operasional PMB Rumah Maryam"
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
            className={`px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ${
              formData.tipe === 'masuk' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            <span>{isEdit ? 'Simpan Perubahan' : 'Catat Transaksi'}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipe Selector Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'tipe', value: 'masuk' } })}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              formData.tipe === 'masuk'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Kas Masuk (Pemasukan)
          </button>
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'tipe', value: 'keluar' } })}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              formData.tipe === 'keluar'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            - Kas Keluar (Pengeluaran)
          </button>
        </div>

        {/* Tanggal & Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Tanggal Transaksi</label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Kategori</label>
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
            >
              {kategoriOpts.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nominal & Metode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Jumlah Nominal (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="jumlah"
              value={formData.jumlah}
              onChange={handleChange}
              placeholder="0"
              min="1"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-bold font-mono text-slate-800 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Metode Pembayaran</label>
            <select
              name="metode"
              value={formData.metode}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
            >
              <option value="Transfer BSI">Transfer BSI</option>
              <option value="QRIS">QRIS</option>
              <option value="Tunai">Tunai / Kasir</option>
              <option value="Bank Lain">Bank Lain / Rekening Operasional</option>
            </select>
          </div>
        </div>

        {/* Nama Pasien / Pihak Terkait (Opsional) */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Nama Pasien / Pihak Terkait (Opsional)
          </label>
          <input
            type="text"
            name="pasien_nama"
            value={formData.pasien_nama}
            onChange={handleChange}
            placeholder="Contoh: Bunda Siti / Toko Alkes Sehat"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Keterangan */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Keterangan / Rincian Transaksi
          </label>
          <textarea
            name="keterangan"
            value={formData.keterangan}
            onChange={handleChange}
            rows={2}
            placeholder="Tuliskan catatan rincian transaksi..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
}
