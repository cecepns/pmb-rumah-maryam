import React, { useState, useEffect, useCallback } from 'react';
import { Stethoscope, Plus, Search, Edit2, Trash2, Home, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import DebouncedSearch from '@/components/common/DebouncedSearch';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Badge from '@/components/common/Badge';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/common/LoadingState';
import ServiceModal from '@/components/services/ServiceModal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { formatRupiah } from '@/utils/formatters';

const KATEGORI_TABS = [
  { key: 'semua', label: 'Semua Layanan' },
  { key: 'ibu', label: 'Layanan Ibu' },
  { key: 'homecare', label: 'Homecare Treatment' },
  { key: 'bayi', label: 'Bayi & Balita' },
  { key: 'newborn', label: 'Newborn Care' },
  { key: 'kb', label: 'Keluarga Berencana (KB)' },
  { key: 'imunisasi', label: 'Imunisasi' },
  { key: 'umum', label: 'Berobat Umum' }
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('semua');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceForEdit, setSelectedServiceForEdit] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await request.get(API_ENDPOINTS.LAYANAN.LIST, {
        page: currentPage,
        limit,
        search: searchQuery,
        kategori: selectedKategori !== 'semua' ? selectedKategori : ''
      });

      if (res.success) {
        setServices(res.data);
        setTotalItems(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat katalog layanan');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchQuery, selectedKategori]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleKategoriChange = (kategori) => {
    setSelectedKategori(kategori);
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedServiceForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setSelectedServiceForEdit(service);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (service) => {
    setServiceToDelete(service);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      setIsDeleting(true);
      const res = await request.delete(API_ENDPOINTS.LAYANAN.DELETE(serviceToDelete.id));
      toast.success(res.message || 'Layanan berhasil dihapus / dinonaktifkan');
      setIsDeleteOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus layanan');
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
            <Stethoscope className="w-6 h-6 text-brand-600" />
            Master Layanan & Tarif
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar harga & jenis layanan PMB Rumah Maryam (Klinik & Homevisit)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Layanan Baru</span>
        </button>
      </div>

      {/* Category Pills Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {KATEGORI_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleKategoriChange(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedKategori === tab.key
                ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Realtime Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <DebouncedSearch
          placeholder="Cari layanan berdasarkan nama, kode, atau deskripsi..."
          onChange={handleSearchChange}
          delay={350}
        />
      </div>

      {/* Services Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchServices} />
        ) : services.length === 0 ? (
          <EmptyState
            title="Tidak Ada Layanan Ditemukan"
            message={searchQuery ? `Tidak ada layanan dengan kata kunci "${searchQuery}".` : 'Belum ada katalog layanan untuk kategori ini.'}
            actionText="+ Tambah Layanan Baru"
            onAction={handleOpenCreate}
            icon={Stethoscope}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Kode</th>
                  <th className="py-3.5 px-4">Nama Layanan</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Tarif Biaya</th>
                  <th className="py-3.5 px-4 text-center">Homevisit</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((srv) => (
                  <tr
                    key={srv.id}
                    className="hover:bg-brand-50/30 transition-colors group"
                  >
                    {/* Kode */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-xs whitespace-nowrap">
                      {srv.kode}
                    </td>

                    {/* Nama & Deskripsi */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <span className="font-bold text-slate-900 block">
                        {srv.nama_layanan}
                      </span>
                      {srv.deskripsi && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {srv.deskripsi}
                        </p>
                      )}
                    </td>

                    {/* Kategori */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={srv.kategori} size="sm">
                        {srv.kategori.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Tarif */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      {formatRupiah(srv.tarif)}
                    </td>

                    {/* Homevisit Available */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {srv.is_homecare_available ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Home className="w-3 h-3" />
                          Bisa Homecare
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          Klinik Saja
                        </span>
                      )}
                    </td>

                    {/* Status Aktif */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {srv.is_active ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Aktif"></span>
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-slate-300" title="Nonaktif"></span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(srv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit Tarif"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(srv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Layanan"
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

      {/* Service Create / Edit Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedServiceForEdit(null);
        }}
        service={selectedServiceForEdit}
        onSuccess={fetchServices}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus / Nonaktifkan Layanan"
        message={`Apakah Anda yakin ingin menghapus layanan "${serviceToDelete?.nama_layanan}"? Jika sudah ada riwayat kunjungan yang menggunakan layanan ini, sistem akan menonaktifkannya secara aman.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
