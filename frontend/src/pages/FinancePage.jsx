import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, Plus, Search, Download, TrendingUp, TrendingDown,
  Coins, Calendar, Trash2, Edit2, CheckCircle2, ArrowDownRight, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '@/components/common/StatCard';
import DebouncedSearch from '@/components/common/DebouncedSearch';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Badge from '@/components/common/Badge';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/common/LoadingState';
import TransactionModal from '@/components/finance/TransactionModal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { formatRupiah, formatDate } from '@/utils/formatters';

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Financial summary numbers from server
  const [summary, setSummary] = useState({
    total_masuk: 0,
    total_keluar: 0,
    net_saldo: 0
  });

  // Filters
  const [filterTipe, setFilterTipe] = useState('semua');
  const [filterBulan, setFilterBulan] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionForEdit, setSelectedTransactionForEdit] = useState(null);
  const [defaultTipeModal, setDefaultTipeModal] = useState('masuk');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await request.get(API_ENDPOINTS.TRANSAKSI.LIST, {
        page: currentPage,
        limit,
        search: searchQuery,
        tipe: filterTipe !== 'semua' ? filterTipe : '',
        bulan: filterBulan
      });

      if (res.success) {
        setTransactions(res.data);
        setTotalItems(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setSummary({
          total_masuk: res.total_masuk || 0,
          total_keluar: res.total_keluar || 0,
          net_saldo: res.net_saldo || 0
        });
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat catatan keuangan');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchQuery, filterTipe, filterBulan]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleOpenCreate = (tipe) => {
    setSelectedTransactionForEdit(null);
    setDefaultTipeModal(tipe);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trx) => {
    setSelectedTransactionForEdit(trx);
    setDefaultTipeModal(trx.tipe);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (trx) => {
    setTransactionToDelete(trx);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      setIsDeleting(true);
      await request.delete(API_ENDPOINTS.TRANSAKSI.DELETE(transactionToDelete.id));
      toast.success('Catatan transaksi berhasil dihapus');
      setIsDeleteOpen(false);
      setTransactionToDelete(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus transaksi');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (!transactions.length) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['Kode Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Pasien / Pihak', 'Jumlah (Rp)', 'Metode'];
    const rows = transactions.map(t => [
      t.kode_transaksi,
      t.tanggal ? t.tanggal.slice(0, 10) : '',
      t.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      `"${(t.kategori || '').replace(/"/g, '""')}"`,
      `"${(t.keterangan || '').replace(/"/g, '""')}"`,
      `"${(t.pasien_nama || '').replace(/"/g, '""')}"`,
      t.jumlah,
      `"${(t.metode || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-kas-pmb-rumah-maryam-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Laporan kas berhasil diunduh dalam format CSV!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-brand-600" />
            Buku Kas Masuk & Keluar PMB
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pencatatan pendapatan layanan, homecare, dan pengeluaran operasional PMB Rumah Maryam
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all flex items-center gap-1.5"
            title="Unduh Laporan CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreate('keluar')}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>- Catat Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreate('masuk')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Pemasukan</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="Total Pemasukan (Filter)"
          value={formatRupiah(summary.total_masuk)}
          subtext="Layanan, homecare & penjualan produk"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Pengeluaran (Filter)"
          value={formatRupiah(summary.total_keluar)}
          subtext="BHP, gaji, listrik, sampah medis, dll"
          icon={TrendingDown}
          color="amber"
        />
        <StatCard
          title="Saldo Kas Bersih"
          value={formatRupiah(summary.net_saldo)}
          subtext="Selisih kas masuk dikurangi kas keluar"
          icon={Coins}
          color="brand"
        />
      </div>

      {/* Filter & Realtime Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DebouncedSearch
            placeholder="Cari keterangan, kategori, kode transaksi..."
            onChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            delay={350}
            className="flex-1"
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Tipe Filter */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setFilterTipe('semua');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterTipe === 'semua' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterTipe('masuk');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterTipe === 'masuk' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterTipe('keluar');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterTipe === 'keluar' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pengeluaran
              </button>
            </div>

            {/* Bulan Filter */}
            <input
              type="month"
              value={filterBulan}
              onChange={(e) => {
                setFilterBulan(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            />

            {filterBulan && (
              <button
                type="button"
                onClick={() => {
                  setFilterBulan('');
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-rose-600 hover:underline px-1"
              >
                Reset Bulan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTransactions} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Tidak Ada Catatan Transaksi"
            message="Belum ada transaksi kas yang tercatat untuk filter pencarian ini."
            actionText="+ Catat Pemasukan"
            onAction={() => handleOpenCreate('masuk')}
            icon={Wallet}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tanggal & Kode</th>
                  <th className="py-3.5 px-4">Tipe</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Keterangan / Pasien</th>
                  <th className="py-3.5 px-4 text-right">Jumlah</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-brand-50/30 transition-colors group"
                  >
                    {/* Tanggal & Kode */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 block text-xs">
                        {formatDate(trx.tanggal)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                        {trx.kode_transaksi}
                      </span>
                    </td>

                    {/* Tipe Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          trx.tipe === 'masuk'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {trx.tipe === 'masuk' ? (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kas Masuk</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                            <span>Kas Keluar</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Kategori */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {trx.kategori}
                    </td>

                    {/* Keterangan & Pasien */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-700 text-xs">{trx.keterangan || '-'}</p>
                      {trx.pasien_nama && (
                        <p className="text-[11px] font-semibold text-brand-700 mt-0.5">
                          Terkait: {trx.pasien_nama}
                        </p>
                      )}
                    </td>

                    {/* Jumlah */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={`text-sm ${
                          trx.tipe === 'masuk' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {trx.tipe === 'masuk' ? '+' : '-'} {formatRupiah(trx.jumlah)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-normal">
                        {trx.metode || 'Transfer'}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(trx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit Transaksi"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(trx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransactionForEdit(null);
        }}
        transaction={selectedTransactionForEdit}
        defaultTipe={defaultTipeModal}
        onSuccess={fetchTransactions}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setTransactionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Transaksi"
        message={`Apakah Anda yakin ingin menghapus catatan transaksi ${transactionToDelete?.kode_transaksi} (${transactionToDelete?.kategori} - ${formatRupiah(transactionToDelete?.jumlah)})?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
