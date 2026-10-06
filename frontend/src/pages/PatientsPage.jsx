import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users, Plus, Search, Edit2, Trash2, Phone, Eye,
  Calendar, MapPin, Heart, ShieldAlert, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import DebouncedSearch from '@/components/common/DebouncedSearch';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/common/LoadingState';
import PatientModal from '@/components/patients/PatientModal';
import PatientDetailModal from '@/components/patients/PatientDetailModal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { formatDate, getInitials } from '@/utils/formatters';

export default function PatientsPage() {
  const { onOpenNewVisit, onOpenWAMessage } = useOutletContext();

  const [patients, setPatients] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPatientIdForDetail, setSelectedPatientIdForDetail] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await request.get(API_ENDPOINTS.PASIEN.LIST, {
        page: currentPage,
        limit,
        search: searchQuery,
      });

      if (res.success) {
        setPatients(res.data);
        setTotalItems(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data pasien');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchQuery]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedPatientForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setSelectedPatientForEdit(patient);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (id) => {
    setSelectedPatientIdForDetail(id);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (patient) => {
    setPatientToDelete(patient);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      setIsDeleting(true);
      await request.delete(API_ENDPOINTS.PASIEN.DELETE(patientToDelete.id));
      toast.success(`Data pasien ${patientToDelete.nama} berhasil dihapus`);
      setIsDeleteOpen(false);
      setPatientToDelete(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus data pasien');
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
            <Users className="w-6 h-6 text-brand-600" />
            Daftar Pasien & Rekam Medis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manajemen rekam medis ibu, bayi & keluarga di PMB Rumah Maryam
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Daftarkan Pasien Baru</span>
        </button>
      </div>

      {/* Filter & Realtime Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <DebouncedSearch
            placeholder="Cari berdasarkan nama, no. RM, no. WA, NIK, atau alamat..."
            onChange={handleSearchChange}
            delay={350}
            className="flex-1 w-full"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchPatients} />
        ) : patients.length === 0 ? (
          <EmptyState
            title="Tidak Ada Pasien Ditemukan"
            message={searchQuery ? `Tidak ada hasil pencarian untuk "${searchQuery}". Coba kata kunci lain.` : 'Belum ada pasien terdaftar di PMB Rumah Maryam.'}
            actionText="+ Daftarkan Pasien Baru"
            onAction={handleOpenCreate}
            icon={Users}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">No. RM</th>
                  <th className="py-3.5 px-4">Data Pasien</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4">Alamat Rumah</th>
                  <th className="py-3.5 px-4 text-center">Kunjungan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-brand-50/30 transition-colors group"
                  >
                    {/* No. RM */}
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-700 whitespace-nowrap">
                      {patient.no_rm}
                    </td>

                    {/* Patient Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center font-display font-bold text-sm shrink-0 overflow-hidden shadow-sm">
                          {patient.foto_url ? (
                            <img
                              src={patient.foto_url}
                              alt={patient.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(patient.nama)
                          )}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(patient.id)}
                            className="font-bold text-slate-900 hover:text-brand-600 transition-colors text-left block"
                          >
                            {patient.nama}
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            {patient.golongan_darah && (
                              <span className="font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                                Gol. {patient.golongan_darah}
                              </span>
                            )}
                            {patient.nama_suami && <span>Suami: {patient.nama_suami}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact / WhatsApp */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-700">{patient.hp_wa}</span>
                        <button
                          type="button"
                          onClick={() => onOpenWAMessage({
                            patient,
                            type: 'sambutan_pasien_baru'
                          })}
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Kirim Pesan WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 text-xs">
                      {patient.alamat || '-'}
                    </td>

                    {/* Visit Count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {patient.total_kunjungan || 0}x
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(patient.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Detail Rekam Medis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(patient)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit Pasien"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(patient)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Pasien"
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
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}
      </div>

      {/* Patient Create / Edit Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPatientForEdit(null);
        }}
        patient={selectedPatientForEdit}
        onSuccess={fetchPatients}
      />

      {/* Patient Detail Modal */}
      <PatientDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedPatientIdForDetail(null);
        }}
        patientId={selectedPatientIdForDetail}
        onOpenEdit={handleOpenEdit}
        onOpenNewVisitForPatient={onOpenNewVisit}
        onOpenWAMessage={(patient) => onOpenWAMessage({ patient, type: 'sambutan_pasien_baru' })}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setPatientToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Pasien"
        message={`Apakah Anda yakin ingin menghapus data pasien ${patientToDelete?.nama} (${patientToDelete?.no_rm}) beserta seluruh riwayat kunjungannya? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
