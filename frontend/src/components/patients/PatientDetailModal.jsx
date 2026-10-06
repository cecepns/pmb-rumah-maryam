import React, { useState, useEffect } from 'react';
import {
  User, Phone, MapPin, Calendar, Heart, ShieldAlert,
  MessageCircle, Plus, Edit2, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { formatRupiah, formatDate, formatDateTime, getInitials } from '@/utils/formatters';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { LoadingSpinner } from '@/components/common/LoadingState';

export default function PatientDetailModal({
  isOpen,
  onClose,
  patientId,
  onOpenEdit,
  onOpenNewVisitForPatient,
  onOpenWAMessage
}) {
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchDetail();
    }
  }, [isOpen, patientId]);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      const res = await request.get(API_ENDPOINTS.PASIEN.DETAIL(patientId));
      if (res.success && res.data) {
        setPatientData(res.data);
      }
    } catch (err) {
      console.error('Error fetching patient detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const visits = patientData?.kunjungan || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patientData ? `${patientData.nama} (${patientData.no_rm})` : 'Detail Pasien'}
      subtitle="Profil rekam medis & riwayat kunjungan layanan"
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWAMessage(patientData);
              }}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewVisitForPatient(patientData);
              }}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-brand-600" />
              <span>+ Jadwal Layanan</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit(patientData);
              }}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <LoadingSpinner text="Memuat data rekam medis pasien..." />
      ) : patientData ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-brand-50 via-white to-pink-50 p-4 sm:p-5 rounded-2xl border border-brand-100 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-brand-100 border border-brand-200 text-brand-700 flex items-center justify-center font-display font-bold text-2xl shadow-sm overflow-hidden shrink-0">
              {patientData.foto_url ? (
                <img
                  src={patientData.foto_url}
                  alt={patientData.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(patientData.nama)
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="text-lg font-bold text-slate-900 font-display">
                  {patientData.nama}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-100 text-brand-800 border border-brand-200">
                  {patientData.no_rm}
                </span>
                {patientData.golongan_darah && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Gol. Darah {patientData.golongan_darah}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  {patientData.hp_wa}
                </span>
                {patientData.tanggal_lahir && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Lahir: {formatDate(patientData.tanggal_lahir)}
                  </span>
                )}
                {patientData.nama_suami && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    Suami: {patientData.nama_suami}
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-start gap-1 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{patientData.alamat || 'Alamat belum diisi'}</span>
              </div>
            </div>
          </div>

          {/* Clinical Alerts / Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Alergi */}
            <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Riwayat Alergi
              </span>
              <p className="text-xs text-slate-700 font-medium">
                {patientData.alergi || 'Tidak ada riwayat alergi yang tercatat.'}
              </p>
            </div>

            {/* Catatan Khusus */}
            <div className="p-3.5 rounded-xl border border-brand-100 bg-brand-50/40 space-y-1">
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Catatan Bidan
              </span>
              <p className="text-xs text-slate-700 font-medium">
                {patientData.catatan_khusus || 'Tidak ada catatan klinis khusus.'}
              </p>
            </div>
          </div>

          {/* Riwayat Kunjungan / Layanan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-600" />
                Riwayat Kunjungan & Layanan ({visits.length})
              </h5>
            </div>

            {visits.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-400">Belum ada riwayat layanan/kunjungan untuk pasien ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Kode / Tanggal</th>
                      <th className="py-2.5 px-3">Tipe</th>
                      <th className="py-2.5 px-3">Layanan</th>
                      <th className="py-2.5 px-3 text-right">Biaya</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visits.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-800">{v.kode_kunjungan}</p>
                          <p className="text-[10px] text-slate-400">{formatDate(v.jadwal_kunjungan)}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={v.tipe_layanan} size="sm">
                            {v.tipe_layanan === 'homevisit' ? 'Homevisit' : 'Klinik'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 max-w-[200px] truncate text-slate-700">
                          {v.daftar_layanan || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-800">
                          {formatRupiah(v.total_biaya)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={v.status_kunjungan} size="sm">
                            {v.status_kunjungan}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={v.status_pembayaran} size="sm">
                            {v.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
