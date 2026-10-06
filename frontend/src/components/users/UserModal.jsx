import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { User, Lock, Mail, Phone, ShieldCheck, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserModal({ isOpen, onClose, user = null, onSuccess }) {
  const isEdit = !!user?.id;

  const [formData, setFormData] = useState({
    username: '',
    nama: '',
    email: '',
    password: '',
    role: 'bidan',
    no_hp: '',
    foto_url: '',
    is_active: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        nama: user.nama || '',
        email: user.email || '',
        password: '', // Leave blank on edit unless changing
        role: user.role || 'bidan',
        no_hp: user.no_hp || '',
        foto_url: user.foto_url || '',
        is_active: user.is_active !== undefined ? user.is_active : 1,
      });
    } else {
      setFormData({
        username: '',
        nama: '',
        email: '',
        password: '',
        role: 'bidan',
        no_hp: '',
        foto_url: '',
        is_active: 1,
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await request.upload(API_ENDPOINTS.UPLOAD.FILE, file);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, foto_url: res.data.url }));
        toast.success('Foto profil berhasil diunggah');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !formData.username.trim()) {
      toast.error('Username wajib diisi');
      return;
    }
    if (!formData.nama.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    try {
      setIsLoading(true);
      if (isEdit) {
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password; // Do not send empty password on update
        }
        await request.put(API_ENDPOINTS.USERS.UPDATE(user.id), payload);
        toast.success('Data pengguna berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.USERS.CREATE, formData);
        toast.success('Pengguna baru berhasil ditambahkan');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Foto Profil & Avatar */}
        <div className="flex items-center gap-4 p-3 bg-brand-50/50 rounded-2xl border border-brand-100/60">
          <div className="relative w-16 h-16 rounded-2xl bg-white border border-brand-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
            {formData.foto_url ? (
              <img
                src={formData.foto_url}
                alt="Foto Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-brand-300" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Foto Pengguna (Opsional)
            </label>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-sm transition-colors">
              <Camera className="w-3.5 h-3.5 text-brand-600" />
              <span>{formData.foto_url ? 'Ganti Foto' : 'Unggah Foto'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG maks 2MB</p>
          </div>
        </div>

        {/* Username & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Username <span className="text-pink-600">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isEdit} // Username is unique identifier, locked on edit
                placeholder="misal: norhalimah"
                required
                className={`w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 ${
                  isEdit ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-white'
                }`}
              />
            </div>
            {isEdit && (
              <p className="text-[10px] text-slate-400 mt-0.5">Username tidak dapat diubah</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Role / Peran <span className="text-pink-600">*</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              >
                <option value="admin">Admin / Pemilik Praktik</option>
                <option value="bidan">Bidan Pelaksana</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nama Lengkap & Gelar */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nama Lengkap & Gelar <span className="text-pink-600">*</span>
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            placeholder="misal: Bdn. Norhalimah, S.Tr.Keb"
            required
            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Password {isEdit ? '(Opsional)' : <span className="text-pink-600">*</span>}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEdit ? 'Kosongkan jika tidak ingin ganti password' : '••••••••'}
              required={!isEdit}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
          {isEdit ? (
            <p className="text-[10px] text-slate-400 mt-0.5">Biarkan kosong jika tetap menggunakan password lama</p>
          ) : (
            <p className="text-[10px] text-slate-400 mt-0.5">Minimal 6 karakter</p>
          )}
        </div>

        {/* Email & No HP / WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email (Opsional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="no_hp"
                value={formData.no_hp}
                onChange={handleChange}
                placeholder="082350313030"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>
        </div>

        {/* Status Aktif Switch */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Status Akun Pengguna</span>
            <span className="text-[11px] text-slate-500 block">
              {formData.is_active ? 'Akun aktif dan dapat masuk ke sistem' : 'Akun dinonaktifkan (tidak bisa login)'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={!!formData.is_active}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
