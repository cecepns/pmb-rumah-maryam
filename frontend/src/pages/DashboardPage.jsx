import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users, CalendarCheck, Clock, Wallet, QrCode, Plus,
  MessageCircle, ArrowUpRight, TrendingUp, AlertCircle,
  Home, CheckCircle2, Heart, Sparkles, ChevronRight, Phone
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import Badge from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingState';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { formatRupiah, formatDate, formatDateTime, getInitials } from '@/utils/formatters';

export default function DashboardPage() {
  const { onOpenQris, onOpenNewVisit, onOpenWAMessage } = useOutletContext();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await request.get(API_ENDPOINTS.DASHBOARD.STATS);
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat ringkasan PMB Rumah Maryam..." />;
  }

  const upcomingVisits = stats?.upcoming_visits || [];
  const recentTransactions = stats?.recent_transactions || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white p-6 sm:p-8 shadow-xl">
        {/* Decorative background shapes */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute right-20 -bottom-10 w-48 h-48 rounded-full bg-pink-400/20 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-pink-200 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              Sistem Layanan Mandiri Bidan & Homecare
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display tracking-tight text-white">
              Assalamu'alaikum, Bunda Norhalimah 🌸
            </h2>
            <p className="text-xs sm:text-sm text-pink-100/90 leading-relaxed">
              Selamat datang di portal operasional <strong>PMB Rumah Maryam</strong>. Kelola jadwal kunjungan klinik & homevisit, hitung otomatis tagihan pasien, dan kirim notifikasi WhatsApp dengan 1-klik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenNewVisit()}
              className="px-4 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-pink-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 text-brand-600" />
              <span>+ Daftarkan Layanan</span>
            </button>
            <button
              type="button"
              onClick={onOpenQris}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>QRIS & Rekening</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Pasien Terdaftar"
          value={stats?.total_pasien || 0}
          subtext="Ibu & anak tercatat di rekam medis"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Kunjungan Hari Ini"
          value={stats?.kunjungan_hari_ini || 0}
          subtext={`${stats?.kunjungan_terjadwal || 0} jadwal mendatang`}
          icon={CalendarCheck}
          color="purple"
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          value={formatRupiah(stats?.pemasukan_bulan_ini || 0)}
          subtext="Kas masuk layanan & homecare"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Piutang Belum Lunas"
          value={formatRupiah(stats?.total_piutang || 0)}
          subtext={`${stats?.piutang_belum_lunas || 0} tagihan belum dibayar`}
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Main Grid: Jadwal Kunjungan Mendatang & Kasir Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Jadwal Kunjungan Mendatang */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                Jadwal Kunjungan Terdekat
              </h3>
              <p className="text-xs text-slate-500">Pasien yang terjadwal untuk klinik atau homevisit</p>
            </div>
            <Link
              to="/kunjungan"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          {upcomingVisits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada jadwal kunjungan terdekat</p>
              <p className="text-xs text-slate-400 mt-1">Semua reservasi telah selesai atau belum ada jadwal baru.</p>
              <button
                type="button"
                onClick={() => onOpenNewVisit()}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700"
              >
                + Tambah Jadwal Layanan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-soft transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-display font-bold text-base shrink-0 shadow-sm">
                      {getInitials(visit.pasien_nama)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">
                          {visit.pasien_nama}
                        </span>
                        <Badge variant={visit.tipe_layanan} size="sm">
                          {visit.tipe_layanan === 'homevisit' ? 'Homevisit' : 'Klinik'}
                        </Badge>
                        <Badge variant={visit.status_pembayaran} size="sm">
                          {visit.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-brand-700">
                          <CalendarCheck className="w-3.5 h-3.5 text-brand-500" />
                          {formatDateTime(visit.jadwal_kunjungan)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {visit.pasien_wa}
                        </span>
                      </div>

                      {visit.alamat_homevisit && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          📍 {visit.alamat_homevisit}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenWAMessage({
                        visit,
                        patient: { nama: visit.pasien_nama, hp_wa: visit.pasien_wa }
                      })}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-sm"
                      title="Kirim Invoice / Pengingat ke WhatsApp Pasien"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kirim WA</span>
                    </button>

                    <Link
                      to="/kunjungan"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Detail Kunjungan"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (1 col): Ringkasan Keuangan & Pembayaran QRIS */}
        <div className="space-y-6">
          {/* QRIS & Rekening Info Box */}
          <div className="rounded-2xl border border-brand-100 bg-gradient-to-b from-brand-50/70 via-white to-pink-50/30 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-brand-700 tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                Informasi Pembayaran
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700">
                BSI & QRIS
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-brand-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-500 font-medium">Rekening Bank Syariah Indonesia</p>
                <p className="text-sm font-bold font-mono text-slate-900 truncate">7124826197</p>
                <p className="text-[11px] font-semibold text-brand-600">a.n. Norhalimah</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenQris}
              className="w-full py-2 px-3 text-xs font-bold text-center text-brand-700 bg-white hover:bg-brand-50 rounded-xl border border-brand-200 transition-all shadow-sm"
            >
              Buka Gambar QRIS & Rincian Rekening &rarr;
            </button>
          </div>

          {/* Quick Transactions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-slate-500" />
                Aktivitas Kas Terakhir
              </h4>
              <Link to="/keuangan" className="text-xs text-brand-600 font-semibold hover:underline">
                Buku Kas
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada transaksi kas.</p>
            ) : (
              <div className="space-y-2.5">
                {recentTransactions.map((trx) => (
                  <div key={trx.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-slate-800 truncate">{trx.kategori}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(trx.tanggal)}</p>
                    </div>
                    <span className={`font-mono font-bold shrink-0 ${trx.tipe === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {trx.tipe === 'masuk' ? '+' : '-'} {formatRupiah(trx.jumlah)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
