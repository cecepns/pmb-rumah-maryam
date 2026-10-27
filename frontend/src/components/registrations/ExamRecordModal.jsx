import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Stethoscope, Activity, CheckCircle2, AlertCircle, FileText, Calendar, User } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { formatDate } from '@/utils/formatters';

export default function ExamRecordModal({
  isOpen,
  onClose,
  visit,
  onSuccess
}) {
  const [hasilPemeriksaan, setHasilPemeriksaan] = useState('');
  const [catatanKunjungan, setCatatanKunjungan] = useState('');
  const [tekananDarah, setTekananDarah] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  const [suhuTubuh, setSuhuTubuh] = useState('');
  const [djj, setDjj] = useState('');
  const [tindakanEdukasi, setTindakanEdukasi] = useState('');
  const [statusKunjungan, setStatusKunjungan] = useState('selesai');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visit) {
      setHasilPemeriksaan(visit.hasil_pemeriksaan || '');
      setCatatanKunjungan(visit.catatan_kunjungan || '');
      setStatusKunjungan(visit.status_kunjungan || 'selesai');

      let parsedKlinis = {};
      if (visit.data_klinis) {
        parsedKlinis = typeof visit.data_klinis === 'string'
          ? JSON.parse(visit.data_klinis || '{}')
          : (visit.data_klinis || {});
      }
      setTekananDarah(parsedKlinis.tekanan_darah || '');
      setBeratBadan(parsedKlinis.berat_badan || '');
      setSuhuTubuh(parsedKlinis.suhu || '');
      setDjj(parsedKlinis.djj || '');
      setTindakanEdukasi(parsedKlinis.tindakan_edukasi || '');
    }
  }, [visit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!visit?.id) return;

    try {
      setIsLoading(true);

      const clinicalData = {
        tekanan_darah: tekananDarah,
        berat_badan: beratBadan,
        suhu: suhuTubuh,
        djj: djj,
        tindakan_edukasi: tindakanEdukasi,
        hasil_pemeriksaan: hasilPemeriksaan
      };

      const res = await request.put(API_ENDPOINTS.KUNJUNGAN.UPDATE_EXAM(visit.id), {
        hasil_pemeriksaan: hasilPemeriksaan || (tekananDarah ? `TD: ${tekananDarah}` : ''),
        catatan_kunjungan: catatanKunjungan,
        data_klinis: clinicalData,
        status_kunjungan: statusKunjungan
      });

      if (res.success) {
        toast.success('Hasil pemeriksaan & rekam medis berhasil disimpan!');
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan hasil pemeriksaan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !visit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Hasil Pemeriksaan & Rekam Medis"
      subtitle={`Kunjungan ${visit.kode_kunjungan} — ${visit.pasien_nama || 'Pasien'}`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
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
            className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Simpan Hasil Pemeriksaan</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Pasien & Layanan */}
        <div className="p-3.5 rounded-xl bg-brand-50/50 border border-brand-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Pasien:</span>
            <span className="font-bold text-slate-900 text-sm">{visit.pasien_nama} ({visit.pasien_no_rm || 'RM'})</span>
            <span className="text-slate-500 block mt-0.5">Layanan: <strong>{visit.daftar_layanan || 'Pemeriksaan Layanan'}</strong></span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Bidan Bertugas:</span>
            <span className="font-semibold text-brand-700">{visit.bidan_petugas || 'Bdn. Norhalimah, S.Keb'}</span>
            <span className="text-slate-400 block mt-0.5">{formatDate(visit.jadwal_kunjungan)}</span>
          </div>
        </div>

        {/* Tanda Vital (Vital Signs) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>Tanda Vital & Pemeriksaan Fisik Dasar</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 block mb-1">Tensi Darah (TD)</span>
              <input
                type="text"
                value={tekananDarah}
                onChange={(e) => setTekananDarah(e.target.value)}
                placeholder="misal: 110/80"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-600 block mb-1">Berat Badan (BB)</span>
              <input
                type="text"
                value={beratBadan}
                onChange={(e) => setBeratBadan(e.target.value)}
                placeholder="misal: 58 kg"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-600 block mb-1">Suhu (°C)</span>
              <input
                type="text"
                value={suhuTubuh}
                onChange={(e) => setSuhuTubuh(e.target.value)}
                placeholder="misal: 36.5"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-600 block mb-1">DJJ / Lainnya</span>
              <input
                type="text"
                value={djj}
                onChange={(e) => setDjj(e.target.value)}
                placeholder="misal: 140x/m"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hasil Pemeriksaan & Diagnosa */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
            <span>Hasil Pemeriksaan Fisik, Palpasi & Diagnosa <span className="text-rose-500">*</span></span>
          </label>
          <textarea
            rows={3}
            value={hasilPemeriksaan}
            onChange={(e) => setHasilPemeriksaan(e.target.value)}
            placeholder="Contoh: Kondisi umum ibu baik, TFU 3 jari bawah pusat, lochea rubra normal, kontraksi rahim baik. Payudara lunak, ASI lancar. Tidak ada tanda bahaya nifas."
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          />
        </div>

        {/* Tindakan, Anjuran & Edukasi */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Tindakan / Terapi & Anjuran Bidan</span>
          </label>
          <textarea
            rows={2}
            value={tindakanEdukasi}
            onChange={(e) => setTindakanEdukasi(e.target.value)}
            placeholder="Contoh: Dilakukan pijat laktasi & oksitosin, edukasi posisi menyusui pelekatan yang benar, anjuran istirahat cukup & minum air 2-3 liter per hari."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 bg-white focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Catatan Tambahan & Status Kunjungan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">
              Catatan Internal Bidan (Opsional):
            </label>
            <input
              type="text"
              value={catatanKunjungan}
              onChange={(e) => setCatatanKunjungan(e.target.value)}
              placeholder="Catatan reservasi / pesan khusus..."
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">
              Status Kunjungan:
            </label>
            <select
              value={statusKunjungan}
              onChange={(e) => setStatusKunjungan(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white focus:border-brand-500 focus:outline-none"
            >
              <option value="selesai">Selesai (Sudah Diperiksa / Dilayani)</option>
              <option value="dalam_proses">Dalam Proses</option>
              <option value="terjadwal">Terjadwal</option>
              <option value="batal">Batal</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
