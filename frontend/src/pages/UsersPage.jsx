import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck, Plus, Search, Edit2, Trash2, Phone, Mail,
  ShieldCheck, Shield, KeyRound, AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import DebouncedSearch from '@/components/common/DebouncedSearch';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/common/LoadingState';
import UserModal from '@/components/users/UserModal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/formatters';

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await request.get(API_ENDPOINTS.USERS.LIST, {
        page: currentPage,
        limit,
        search: searchQuery,
        role: roleFilter || undefined,
      });

      if (res.success) {
        setUsers(res.data);
        setTotalItems(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchQuery, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedUserForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUserForEdit(user);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    if (user.id === 1) {
      toast.error('Akun Administrator Utama tidak boleh dihapus demi keamanan sistem');
      return;
    }
    if (user.id === currentUser?.id) {
      toast.error('Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini');
      return;
    }
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const res = await request.delete(API_ENDPOINTS.USERS.DELETE(userToDelete.id));
      if (res.success) {
        toast.success(`Akun ${userToDelete.nama} berhasil dihapus`);
        setIsDeleteOpen(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus pengguna');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 rounded-l-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-pink-100 mb-2 border border-white/20">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Akses & Manajemen Akun</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              Manajemen Pengguna
            </h1>
            <p className="text-pink-100/90 text-xs sm:text-sm mt-1 max-w-xl">
              Kelola data bidan dan admin yang memiliki hak akses ke sistem PMB Rumah Maryam.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-white text-brand-700 hover:bg-pink-50 font-bold text-xs sm:text-sm shadow-lg shadow-black/10 transition-all flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white rounded-2xl border border-brand-100/80 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <DebouncedSearch
            placeholder="Cari berdasarkan nama, username, atau email..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Role:</span>
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            >
              <option value="">Semua Role</option>
              <option value="admin">Admin / Owner</option>
              <option value="bidan">Bidan</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Muat Ulang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Table or States */}
      <div className="bg-white rounded-2xl border border-brand-100/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={5} columns={5} />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchUsers} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={UserCheck}
              title="Tidak ada pengguna ditemukan"
              description={
                searchQuery
                  ? `Tidak ada hasil untuk pencarian "${searchQuery}". Coba kata kunci lain.`
                  : 'Belum ada pengguna terdaftar selain administrator.'
              }
              actionLabel="Tambah Pengguna"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Kontak</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                  {users.map((u) => {
                    const isAdmin = u.role === 'admin';
                    const isSelf = u.id === currentUser?.id;

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-brand-50/30 transition-colors group"
                      >
                        {/* Profile Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-100 to-pink-100 text-brand-700 border border-brand-200/80 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm">
                              {u.foto_url ? (
                                <img
                                  src={u.foto_url}
                                  alt={u.nama}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{getInitials(u.nama || u.username)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate flex items-center gap-1.5">
                                {u.nama}
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-brand-100 text-brand-700 font-semibold border border-brand-200">
                                    Anda
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                Terdaftar sejak {new Date(u.created_at).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">
                          @{u.username}
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                              Admin / Owner
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Shield className="w-3.5 h-3.5 text-emerald-600" />
                              Bidan Pelaksana
                            </span>
                          )}
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            {u.no_hp ? (
                              <a
                                href={`https://wa.me/${u.no_hp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-slate-600 hover:text-brand-600 flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-emerald-500" />
                                <span>{u.no_hp}</span>
                              </a>
                            ) : null}
                            {u.email ? (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[140px]">{u.email}</span>
                              </div>
                            ) : null}
                            {!u.no_hp && !u.email && (
                              <span className="text-xs text-slate-400 italic">-</span>
                            )}
                          </div>
                        </td>

                        {/* Active status */}
                        <td className="py-3.5 px-4">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Nonaktif
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="Ubah Data Pengguna"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(u)}
                              disabled={u.id === 1 || isSelf}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.id === 1 || isSelf
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-500 hover:text-pink-600 hover:bg-pink-50'
                              }`}
                              title={
                                u.id === 1
                                  ? 'Admin utama tidak bisa dihapus'
                                  : isSelf
                                  ? 'Tidak bisa menghapus akun sendiri'
                                  : 'Hapus Pengguna'
                              }
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

            {/* Pagination Component */}
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal Create / Edit */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUserForEdit}
        onSuccess={fetchUsers}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${userToDelete?.nama}" (@${userToDelete?.username})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Pengguna"
        variant="danger"
      />
    </div>
  );
}
