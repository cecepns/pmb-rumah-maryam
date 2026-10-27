import React, { useState, useEffect } from 'react';
import {
  User, Phone, MapPin, Calendar, Heart, ShieldAlert,
  MessageCircle, Plus, Edit2, Clock, CheckCircle2, AlertCircle, Stethoscope
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
      maxWidth="max-w-4xl"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 w-full">
          <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex items-center justify-end gap-2">
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
                        <td className="py-3 px-3.5 align-top min-w-[125px]">
                          <p className="font-semibold text-slate-800">{v.kode_kunjungan}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(v.jadwal_kunjungan)}</p>
                          {v.bidan_petugas && (
                            <p className="text-[10px] text-brand-700 font-semibold mt-1 truncate max-w-[130px] bg-brand-50/80 px-1.5 py-0.5 rounded border border-brand-100 inline-block">
                              {v.bidan_petugas}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3.5 align-top min-w-[95px]">
                          <Badge variant={v.tipe_layanan} size="sm">
                            {v.tipe_layanan === 'homevisit' ? 'Homevisit' : 'Klinik'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3.5 align-top min-w-[280px] max-w-sm sm:max-w-md">
                          <p className="font-bold text-slate-800">{v.daftar_layanan || '-'}</p>
                          {(v.hasil_pemeriksaan || v.catatan_kunjungan) && (
                            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-[11px] text-slate-700 leading-relaxed shadow-xs">
                              <span className="font-bold text-emerald-800 block text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1">
                                <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                Hasil Rekam Medis:
                              </span>
                              <div className="whitespace-pre-line break-words text-slate-800 font-medium leading-relaxed">
                                {v.hasil_pemeriksaan || v.catatan_kunjungan}
                              </div>

                              {/* Vitals breakdown if available */}
                              {(() => {
                                let dk = {};
                                if (v.data_klinis) {
                                  dk = typeof v.data_klinis === 'string'
                                    ? JSON.parse(v.data_klinis || '{}')
                                    : (v.data_klinis || {});
                                }
                                const hasVitals = dk.tekanan_darah || dk.berat_badan || dk.suhu || dk.djj;
                                if (!hasVitals) return null;
                                return (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-emerald-200/70 text-[10px]">
                                    {dk.tekanan_darah && (
                                      <span className="px-1.5 py-0.5 rounded bg-white text-rose-700 font-bold border border-rose-200 shadow-2xs">
                                        TD: {dk.tekanan_darah}
                                      </span>
                                    )}
                                    {dk.berat_badan && (
                                      <span className="px-1.5 py-0.5 rounded bg-white text-blue-700 font-bold border border-blue-200 shadow-2xs">
                                        BB: {dk.berat_badan} kg
                                      </span>
                                    )}
                                    {dk.suhu && (
                                      <span className="px-1.5 py-0.5 rounded bg-white text-amber-700 font-bold border border-amber-200 shadow-2xs">
                                        Suhu: {dk.suhu} °C
                                      </span>
                                    )}
                                    {dk.djj && (
                                      <span className="px-1.5 py-0.5 rounded bg-white text-purple-700 font-bold border border-purple-200 shadow-2xs">
                                        DJJ: {dk.djj} bpm
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3.5 align-top text-right font-bold font-mono text-slate-800 whitespace-nowrap">
                          {formatRupiah(v.total_biaya)}
                        </td>
                        <td className="py-3 px-3.5 align-top text-center whitespace-nowrap">
                          <Badge variant={v.status_kunjungan} size="sm">
                            {v.status_kunjungan}
                          </Badge>
                        </td>
                        <td className="py-3 px-3.5 align-top text-center whitespace-nowrap">
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
