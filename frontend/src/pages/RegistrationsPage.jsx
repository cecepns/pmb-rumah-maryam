import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarCheck, Plus, Search, MessageCircle, MapPin,
  Clock, CheckCircle2, XCircle, AlertCircle, Trash2, Eye,
  Building, Home, CreditCard, Sparkles, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import DebouncedSearch from '@/components/common/DebouncedSearch';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/common/LoadingState';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { formatRupiah, formatDate, formatDateTime, getInitials } from '@/utils/formatters';

export default function RegistrationsPage() {
  const { onOpenNewVisit, onOpenWAMessage } = useOutletContext();

  const [visits, setVisits] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [tipeLayanan, setTipeLayanan] = useState('semua');
  const [statusKunjungan, setStatusKunjungan] = useState('semua');
  const [statusPembayaran, setStatusPembayaran] = useState('semua');
  const [filterTanggal, setFilterTanggal] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVisitForDetail, setSelectedVisitForDetail] = useState(null);

  // Delete Dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVisits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await request.get(API_ENDPOINTS.KUNJUNGAN.LIST, {
        page: currentPage,
        limit,
        search: searchQuery,
        tipe_layanan: tipeLayanan,
        status_kunjungan: statusKunjungan,
        status_pembayaran: statusPembayaran,
        tanggal: filterTanggal
      });

      if (res.success) {
        setVisits(res.data);
        setTotalItems(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar kunjungan');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchQuery, tipeLayanan, statusKunjungan, statusPembayaran, filterTanggal]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleTogglePayment = async (visit) => {
    const nextStatus = visit.status_pembayaran === 'lunas' ? 'belum_lunas' : 'lunas';
    try {
      await request.put(API_ENDPOINTS.KUNJUNGAN.UPDATE_PAYMENT(visit.id), {
        status_pembayaran: nextStatus
      });

      if (nextStatus === 'lunas') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`Kunjungan ${visit.kode_kunjungan} ditandai LUNAS`);
      } else {
        toast.success(`Status pembayaran diubah menjadi BELUM LUNAS`);
      }
      fetchVisits();
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah status pembayaran');
    }
  };

  const handleStatusChange = async (visitId, newStatus) => {
    try {
      await request.put(API_ENDPOINTS.KUNJUNGAN.UPDATE(visitId), {
        status_kunjungan: newStatus
      });
      toast.success(`Status kunjungan berhasil diubah ke ${newStatus.toUpperCase()}`);
      fetchVisits();
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah status kunjungan');
    }
  };

  const handleConfirmDelete = async () => {
    if (!visitToDelete) return;
    try {
      setIsDeleting(true);
      await request.delete(API_ENDPOINTS.KUNJUNGAN.DELETE(visitToDelete.id));
      toast.success(`Kunjungan ${visitToDelete.kode_kunjungan} berhasil dihapus`);
      setIsDeleteOpen(false);
      setVisitToDelete(null);
      fetchVisits();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus kunjungan');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-brand-600" />
            Layanan & Jadwal Kunjungan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Reservasi layanan klinik & homecare, hitung transport dan kirim invoice WhatsApp
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenNewVisit()}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Daftarkan Layanan / Homevisit</span>
        </button>
      </div>

      {/* Filter & Realtime Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <DebouncedSearch
            placeholder="Cari pasien, kode reservasi, alamat..."
            onChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            delay={350}
            className="flex-1"
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Tipe Lokasi */}
            <select
              value={tipeLayanan}
              onChange={(e) => {
                setTipeLayanan(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="semua">Semua Lokasi</option>
              <option value="homevisit">Homevisit (Ke Rumah)</option>
              <option value="klinik">Klinik PMB</option>
            </select>

            {/* Status Kunjungan */}
            <select
              value={statusKunjungan}
              onChange={(e) => {
                setStatusKunjungan(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="semua">Semua Status</option>
              <option value="terjadwal">Terjadwal</option>
              <option value="dalam_proses">Dalam Proses</option>
              <option value="selesai">Selesai</option>
              <option value="batal">Batal</option>
            </select>

            {/* Status Pembayaran */}
            <select
              value={statusPembayaran}
              onChange={(e) => {
                setStatusPembayaran(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="semua">Semua Pembayaran</option>
              <option value="belum_lunas">Belum Lunas</option>
              <option value="lunas">Lunas</option>
            </select>

            {/* Filter Tanggal */}
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => {
                setFilterTanggal(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            />

            {filterTanggal && (
              <button
                type="button"
                onClick={() => {
                  setFilterTanggal('');
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-rose-600 hover:underline px-1"
              >
                Reset Tanggal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={5} cols={7} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchVisits} />
        ) : visits.length === 0 ? (
          <EmptyState
            title="Tidak Ada Kunjungan Ditemukan"
            message="Belum ada jadwal layanan atau reservasi yang cocok dengan kriteria pencarian ini."
            actionText="+ Daftarkan Layanan / Homevisit"
            onAction={() => onOpenNewVisit()}
            icon={CalendarCheck}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Reservasi</th>
                  <th className="py-3.5 px-4">Pasien</th>
                  <th className="py-3.5 px-4">Layanan</th>
                  <th className="py-3.5 px-4 text-right">Total Biaya</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Pembayaran</th>
                  <th className="py-3.5 px-4 text-center">WhatsApp & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map((visit) => {
                  const items = visit.items || [];
                  return (
                    <tr
                      key={visit.id}
                      className="hover:bg-brand-50/30 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        // Avoid triggering row click if clicking interactive buttons or selects
                        if (e.target.closest('button') || e.target.closest('select') || e.target.closest('a')) {
                          return;
                        }
                        setSelectedVisitForDetail(visit);
                        setIsDetailOpen(true);
                      }}
                    >
                      {/* Reservasi & Jadwal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 block text-xs">
                          {visit.kode_kunjungan}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {formatDateTime(visit.jadwal_kunjungan)}
                        </span>
                        <div className="mt-1">
                          <Badge variant={visit.tipe_layanan} size="sm">
                            {visit.tipe_layanan === 'homevisit' ? 'Homevisit' : 'Klinik'}
                          </Badge>
                        </div>
                      </td>

                      {/* Pasien (Ringkas: Nama & Kontak) */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                          {visit.pasien_nama}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-400">{visit.pasien_no_rm}</span>
                          <span className="text-slate-300">•</span>
                          <span>WA: {visit.pasien_wa}</span>
                        </div>
                      </td>

                      {/* Layanan (Ringkas & Bersih - Rincian lengkap ada di Detail) */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="space-y-1">
                          {items.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-800 text-xs truncate max-w-[170px]" title={items[0].nama_layanan}>
                                {items[0].nama_layanan}
                              </span>
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVisitForDetail(visit);
                                    setIsDetailOpen(true);
                                  }}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
                                  title="Klik untuk melihat semua layanan di modal Detail"
                                >
                                  +{items.length - 1} lainnya
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Belum ada layanan</span>
                          )}

                          {visit.tipe_layanan === 'homevisit' && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-700">
                              <span>🚗 Homecare</span>
                              {visit.jarak_km > 0 && <span className="text-slate-400">({visit.jarak_km} km)</span>}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Biaya */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 text-sm block">
                          {formatRupiah(visit.total_biaya)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">
                          {visit.metode_pembayaran?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status Kunjungan Selector */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={visit.status_kunjungan}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(visit.id, e.target.value);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none"
                        >
                          <option value="terjadwal">Terjadwal</option>
                          <option value="dalam_proses">Dalam Proses</option>
                          <option value="selesai">Selesai</option>
                          <option value="batal">Batal</option>
                        </select>
                      </td>

                      {/* Status Pembayaran Toggle */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePayment(visit);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 mx-auto ${
                            visit.status_pembayaran === 'lunas'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Klik untuk mengubah status pembayaran"
                        >
                          {visit.status_pembayaran === 'lunas' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Lunas</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Belum Lunas</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* WhatsApp & Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1-Click WhatsApp Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenWAMessage({
                                visit,
                                patient: { nama: visit.pasien_nama, hp_wa: visit.pasien_wa, alamat: visit.alamat_homevisit }
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                            title="Kirim Invoice / Notifikasi WhatsApp Langsung"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WA</span>
                          </button>

                          {/* View Detail Modal Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVisitForDetail(visit);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Lihat Rincian Lengkap & Data Pasien"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisitToDelete(visit);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Kunjungan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalItems > 0 && (
          <div className="border-t border-slate-200 px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              limit={limit}
              onPageChange={setCurrentPage}
              onLimitChange={(l) => {
                setLimit(l);
                setCurrentPage(1);
              }}
              limits={[10, 25, 50, 100]}
            />
          </div>
        )}
      </div>

      {/* Visit Detail & Invoice Modal */}
      {selectedVisitForDetail && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedVisitForDetail(null);
          }}
          title={`Detail Reservasi: ${selectedVisitForDetail.kode_kunjungan}`}
          subtitle={`Pasien: ${selectedVisitForDetail.pasien_nama} (${selectedVisitForDetail.pasien_no_rm})`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={() => {
                  const v = selectedVisitForDetail;
                  setIsDetailOpen(false);
                  onOpenWAMessage({
                    visit: v,
                    patient: { nama: v.pasien_nama, hp_wa: v.pasien_wa, alamat: v.alamat_homevisit }
                  });
                }}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Format Invoice via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Header: Status & Info Kunjungan */}
            <div className="bg-gradient-to-r from-brand-50 via-pink-50 to-purple-50 p-4 rounded-2xl border border-brand-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block">
                  Jadwal Kunjungan & Layanan
                </span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {formatDateTime(selectedVisitForDetail.jadwal_kunjungan)}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Bidan / Terapis: <span className="font-semibold text-slate-800">{selectedVisitForDetail.bidan_petugas || 'Bdn. Norhalimah, S.Tr.Keb'}</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <Badge variant={selectedVisitForDetail.tipe_layanan} size="md">
                  {selectedVisitForDetail.tipe_layanan === 'homevisit' ? 'Homevisit (Ke Rumah)' : 'Klinik PMB'}
                </Badge>
                <button
                  type="button"
                  onClick={() => handleTogglePayment(selectedVisitForDetail)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
                    selectedVisitForDetail.status_pembayaran === 'lunas'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                  }`}
                  title="Klik untuk ubah status pembayaran"
                >
                  {selectedVisitForDetail.status_pembayaran === 'lunas' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>LUNAS (Klik ubah)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                      <span>BELUM LUNAS (Klik tandai)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Data Lengkap Pasien & Kontak */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Data Lengkap Pasien
                </span>
                <span className="font-mono text-xs font-semibold text-brand-600">
                  {selectedVisitForDetail.pasien_no_rm}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Pasien</span>
                  <span className="font-bold text-slate-900 block text-sm">{selectedVisitForDetail.pasien_nama}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nomor WhatsApp Pasien</span>
                  <a
                    href={`https://wa.me/${selectedVisitForDetail.pasien_wa?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{selectedVisitForDetail.pasien_wa}</span>
                  </a>
                </div>
              </div>

              {/* Alamat Lengkap & Homevisit */}
              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-slate-400 block text-[10px] mb-0.5">Alamat / Lokasi</span>
                <p className="text-xs text-slate-700 font-medium">
                  📍 {selectedVisitForDetail.alamat_homevisit || selectedVisitForDetail.pasien_alamat || 'Alamat klinik / tidak ada rincian'}
                </p>
                {selectedVisitForDetail.tipe_layanan === 'homevisit' && selectedVisitForDetail.jarak_km > 0 && (
                  <p className="text-[11px] text-amber-700 font-semibold mt-1">
                    🚗 Jarak Homevisit: {selectedVisitForDetail.jarak_km} km | Transport Fee: {formatRupiah(selectedVisitForDetail.biaya_transport)}
                  </p>
                )}
              </div>
            </div>

            {/* Rincian Lengkap Tagihan Layanan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Rincian Tagihan Layanan
                </h5>
                <span className="text-[11px] text-slate-400">
                  Metode: <strong className="text-slate-700 uppercase">{selectedVisitForDetail.metode_pembayaran?.replace('_', ' ')}</strong>
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Nama Layanan</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Tarif</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(selectedVisitForDetail.items || []).map((it) => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{it.nama_layanan}</td>
                        <td className="py-2.5 px-3 text-center">{it.qty}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatRupiah(it.tarif)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatRupiah(it.subtotal)}</td>
                      </tr>
                    ))}
                    {Number(selectedVisitForDetail.biaya_transport) > 0 && (
                      <tr className="bg-amber-50/60">
                        <td colSpan={3} className="py-2.5 px-3 font-semibold text-amber-900">
                          🚗 Biaya Transport Homevisit ({selectedVisitForDetail.jarak_km || 0} km)
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900">
                          {formatRupiah(selectedVisitForDetail.biaya_transport)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-brand-50/70 font-bold border-t-2 border-brand-200">
                      <td colSpan={3} className="py-3 px-3 text-slate-900 text-sm">Total Tagihan</td>
                      <td className="py-3 px-3 text-right font-mono text-brand-700 text-base font-extrabold">
                        {formatRupiah(selectedVisitForDetail.total_biaya)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes / Clinical Data */}
            {selectedVisitForDetail.catatan_kunjungan && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Catatan Bidan:</span>
                <p className="text-slate-600">{selectedVisitForDetail.catatan_kunjungan}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setVisitToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Kunjungan"
        message={`Apakah Anda yakin ingin menghapus catatan reservasi ${visitToDelete?.kode_kunjungan} untuk pasien ${visitToDelete?.pasien_nama}?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
