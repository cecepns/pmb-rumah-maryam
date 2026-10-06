import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MessageCircle, Receipt, AlertCircle, CheckCircle2,
  Calendar, Phone, Clock, Send, Eye, Sparkles, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import DebouncedSearch from '@/components/common/DebouncedSearch';
import Pagination from '@/components/common/Pagination';
import Badge from '@/components/common/Badge';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/common/LoadingState';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { formatRupiah, formatDate, formatDateTime, getInitials } from '@/utils/formatters';
import { WA_TYPE_LABELS } from '@/utils/whatsapp';

export default function InvoicesPage() {
  const { onOpenWAMessage } = useOutletContext();

  const [activeTab, setActiveTab] = useState('piutang'); // 'piutang' | 'walog'

  // Piutang state
  const [unpaidVisits, setUnpaidVisits] = useState([]);
  const [totalPiutang, setTotalPiutang] = useState(0);
  const [piutangPage, setPiutangPage] = useState(1);
  const [piutangLimit, setPiutangLimit] = useState(10);
  const [piutangTotalPages, setPiutangTotalPages] = useState(1);
  const [piutangSearch, setPiutangSearch] = useState('');
  const [isPiutangLoading, setIsPiutangLoading] = useState(true);

  // WA Log state
  const [waLogs, setWaLogs] = useState([]);
  const [waLogTotal, setWaLogTotal] = useState(0);
  const [waLogPage, setWaLogPage] = useState(1);
  const [waLogLimit, setWaLogLimit] = useState(15);
  const [waLogTotalPages, setWaLogTotalPages] = useState(1);
  const [waLogSearch, setWaLogSearch] = useState('');
  const [isWaLogLoading, setIsWaLogLoading] = useState(false);

  // Fetch Unpaid Visits (Piutang)
  const fetchUnpaidVisits = useCallback(async () => {
    try {
      setIsPiutangLoading(true);
      const res = await request.get(API_ENDPOINTS.KUNJUNGAN.LIST, {
        status_pembayaran: 'belum_lunas',
        page: piutangPage,
        limit: piutangLimit,
        search: piutangSearch,
      });

      if (res.success) {
        setUnpaidVisits(res.data);
        setTotalPiutang(res.pagination.total);
        setPiutangTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching unpaid visits:', err);
    } finally {
      setIsPiutangLoading(false);
    }
  }, [piutangPage, piutangLimit, piutangSearch]);

  // Fetch WA Logs
  const fetchWaLogs = useCallback(async () => {
    try {
      setIsWaLogLoading(true);
      const res = await request.get(API_ENDPOINTS.WA_LOG.LIST, {
        page: waLogPage,
        limit: waLogLimit,
        search: waLogSearch,
      });

      if (res.success) {
        setWaLogs(res.data);
        setWaLogTotal(res.pagination.total);
        setWaLogTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching WA logs:', err);
    } finally {
      setIsWaLogLoading(false);
    }
  }, [waLogPage, waLogLimit, waLogSearch]);

  useEffect(() => {
    if (activeTab === 'piutang') {
      fetchUnpaidVisits();
    } else {
      fetchWaLogs();
    }
  }, [activeTab, fetchUnpaidVisits, fetchWaLogs]);

  // Quick mark lunas
  const handleMarkLunas = async (visit) => {
    try {
      await request.put(API_ENDPOINTS.KUNJUNGAN.UPDATE_PAYMENT(visit.id), {
        status_pembayaran: 'lunas',
      });

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });

      toast.success(`Tagihan ${visit.kode_kunjungan} ditandai LUNAS`);
      fetchUnpaidVisits();
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah status pembayaran');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-600" />
            Tagihan Pasien & Notifikasi WhatsApp
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola piutang belum lunas dan pantau riwayat pesan WhatsApp yang telah dikirim
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('piutang')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'piutang'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>Tagihan Belum Lunas</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            {totalPiutang}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('walog')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'walog'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Riwayat Pesan WhatsApp</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            {waLogTotal}
          </span>
        </button>
      </div>

      {/* Tab 1: Tagihan Belum Lunas */}
      {activeTab === 'piutang' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <DebouncedSearch
              placeholder="Cari nama pasien, no. RM, kode kunjungan..."
              onChange={(q) => {
                setPiutangSearch(q);
                setPiutangPage(1);
              }}
              delay={350}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
            {isPiutangLoading ? (
              <SkeletonTable rows={5} cols={6} />
            ) : unpaidVisits.length === 0 ? (
              <EmptyState
                title="Tidak Ada Tagihan Belum Lunas 🎉"
                message="Semua tagihan layanan & homecare telah lunas dibayar. Kerja luar biasa!"
                icon={CheckCircle2}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Kode / Tanggal</th>
                      <th className="py-3.5 px-4">Pasien</th>
                      <th className="py-3.5 px-4">Layanan & Tipe</th>
                      <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Tindakan Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unpaidVisits.map((visit) => (
                      <tr
                        key={visit.id}
                        className="hover:bg-brand-50/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-800 block">
                            {visit.kode_kunjungan}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDateTime(visit.jadwal_kunjungan)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">
                            {visit.pasien_nama}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            WA: {visit.pasien_wa}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant={visit.tipe_layanan} size="sm">
                              {visit.tipe_layanan === 'homevisit' ? 'Homevisit' : 'Klinik'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">
                            {(visit.items || []).map((i) => i.nama_layanan).join(', ') || '-'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-rose-600 text-sm block">
                            {formatRupiah(visit.total_biaya)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Via {visit.metode_pembayaran?.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Belum Lunas
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {/* Send WA Invoice Button */}
                            <button
                              type="button"
                              onClick={() => onOpenWAMessage({
                                visit,
                                patient: { nama: visit.pasien_nama, hp_wa: visit.pasien_wa, alamat: visit.alamat_homevisit },
                                type: visit.tipe_layanan === 'homevisit' ? 'invoice_homevisit' : 'invoice_klinik'
                              })}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Kirim Tagihan WA</span>
                            </button>

                            {/* Mark Lunas Button */}
                            <button
                              type="button"
                              onClick={() => handleMarkLunas(visit)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all flex items-center gap-1"
                              title="Tandai pembayaran telah diterima"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tandai Lunas</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isPiutangLoading && totalPiutang > 0 && (
              <div className="border-t border-slate-200 px-4">
                <Pagination
                  currentPage={piutangPage}
                  totalPages={piutangTotalPages}
                  totalItems={totalPiutang}
                  limit={piutangLimit}
                  onPageChange={setPiutangPage}
                  onLimitChange={(l) => {
                    setPiutangLimit(l);
                    setPiutangPage(1);
                  }}
                  limits={[10, 25, 50]}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Riwayat Pesan WhatsApp */}
      {activeTab === 'walog' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <DebouncedSearch
              placeholder="Cari riwayat pesan berdasarkan nama pasien, no. WA, atau jenis pesan..."
              onChange={(q) => {
                setWaLogSearch(q);
                setWaLogPage(1);
              }}
              delay={350}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
            {isWaLogLoading ? (
              <SkeletonTable rows={6} cols={5} />
            ) : waLogs.length === 0 ? (
              <EmptyState
                title="Belum Ada Pesan WhatsApp Dikirim"
                message="Semua notifikasi atau invoice yang dikirim lewat tombol WhatsApp akan otomatis tercatat di sini."
                icon={MessageCircle}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Waktu Dikirim</th>
                      <th className="py-3.5 px-4">Pasien Penerima</th>
                      <th className="py-3.5 px-4">Jenis Pesan</th>
                      <th className="py-3.5 px-4">Isi Pesan Terkirim</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {waLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800 block">{log.pasien_nama}</span>
                          <span className="text-[11px] text-slate-400">{log.no_wa}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {WA_TYPE_LABELS[log.jenis_pesan] || log.jenis_pesan}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-md">
                          <p className="text-xs text-slate-700 whitespace-pre-wrap font-sans line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {log.pesan}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Dibuka di WA
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isWaLogLoading && waLogTotal > 0 && (
              <div className="border-t border-slate-200 px-4">
                <Pagination
                  currentPage={waLogPage}
                  totalPages={waLogTotalPages}
                  totalItems={waLogTotal}
                  limit={waLogLimit}
                  onPageChange={setWaLogPage}
                  onLimitChange={(l) => {
                    setWaLogLimit(l);
                    setWaLogPage(1);
                  }}
                  limits={[15, 30, 50]}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
