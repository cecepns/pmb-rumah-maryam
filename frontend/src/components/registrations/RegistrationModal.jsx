import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, User, Plus, Trash2, Home,
  Building, CheckCircle2, MessageCircle, AlertCircle, Sparkles,
  Stethoscope, Activity, FileText, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { formatRupiah, formatDate } from '@/utils/formatters';

export default function RegistrationModal({
  isOpen,
  onClose,
  preselectedPatient = null,
  onSuccess,
  onTriggerWAMessage
}) {
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [config, setConfig] = useState({});

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [tipeLayanan, setTipeLayanan] = useState('homevisit'); // Default homevisit as highlighted by client
  const [jadwalKunjungan, setJadwalKunjungan] = useState('');
  const [alamatHomevisit, setAlamatHomevisit] = useState('');
  const [jarakKm, setJarakKm] = useState('');
  const [biayaTransport, setBiayaTransport] = useState(25000);

  // Bidan / Terapis Bertugas state
  const [bidanPetugas, setBidanPetugas] = useState('Bdn. Norhalimah, S.Keb');
  const [bidanList, setBidanList] = useState([
    { id: 1, nama: 'Bdn. Norhalimah, S.Keb', role: 'admin' },
    { id: 2, nama: 'Megananda, Am.Keb', role: 'bidan' },
    { id: 3, nama: 'Rizqi Amaliyah Putri, Am.Keb', role: 'bidan' },
  ]);
  const [isCustomBidan, setIsCustomBidan] = useState(false);
  const [customBidanText, setCustomBidanText] = useState('');

  // Patient medical history state
  const [patientHistory, setPatientHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Examination / Hasil Pemeriksaan fields
  const [hasilPemeriksaan, setHasilPemeriksaan] = useState('');
  const [tekananDarah, setTekananDarah] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  const [keluhanUtama, setKeluhanUtama] = useState('');
  const [tindakanEdukasi, setTindakanEdukasi] = useState('');
  const [catatanKunjungan, setCatatanKunjungan] = useState('');

  // Selected Services List (Item rows: { layanan_id, nama_layanan, tarif, qty, subtotal })
  const [selectedItems, setSelectedItems] = useState([]);

  // Clinical data fields
  const [clinicalData, setClinicalData] = useState({
    jenis_kb: 'Suntik 3 Bulan',
    jadwal_ulang: '',
    kunjungan_nifas_ke: '1',
    jenis_vaksin: 'BCG & Polio 1',
    jadwal_berikutnya: '',
    usia_kehamilan: '',
    hpl: '',
    kondisi_ibu: '',
    catatan_bayi: ''
  });

  const [statusPembayaran, setStatusPembayaran] = useState('belum_lunas');
  const [metodePembayaran, setMetodePembayaran] = useState('transfer_bsi');
  const [sendWAImmediate, setSendWAImmediate] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  // Initialize data on modal open
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      // Set default datetime to today + 2 hours rounded
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setJadwalKunjungan(localISO);
    }
  }, [isOpen]);

  // Fetch medical history for selected patient
  const fetchPatientHistory = async (patientId) => {
    if (!patientId) {
      setPatientHistory([]);
      return;
    }
    try {
      setIsLoadingHistory(true);
      const res = await request.get(API_ENDPOINTS.PASIEN.DETAIL(patientId));
      if (res.success && res.data?.kunjungan) {
        setPatientHistory(res.data.kunjungan);
      } else {
        setPatientHistory([]);
      }
    } catch (err) {
      console.warn('Could not load patient history:', err);
      setPatientHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle preselected patient
  useEffect(() => {
    if (preselectedPatient?.id) {
      setSelectedPatientId(preselectedPatient.id.toString());
      if (preselectedPatient.alamat) {
        setAlamatHomevisit(preselectedPatient.alamat);
      }
      fetchPatientHistory(preselectedPatient.id);
    }
  }, [preselectedPatient]);

  const loadInitialData = async () => {
    try {
      const [resPatients, resServices, resConfig, resBidan] = await Promise.all([
        request.get(API_ENDPOINTS.PASIEN.LIST, { limit: 100 }),
        request.get(API_ENDPOINTS.LAYANAN.LIST, { limit: 100, is_active: 1 }),
        request.get(API_ENDPOINTS.CONFIG.GET),
        request.get(API_ENDPOINTS.BIDAN.LIST).catch(() => ({ success: false }))
      ]);

      if (resPatients.success) setPatients(resPatients.data);
      if (resServices.success) setServices(resServices.data);
      if (resConfig.success) {
        setConfig(resConfig.data);
        if (resConfig.data.default_transport_fee) {
          setBiayaTransport(Number(resConfig.data.default_transport_fee));
        }
      }
      if (resBidan.success && resBidan.data?.length > 0) {
        setBidanList(resBidan.data);
      }

      // Add 1 default service if none selected
      if (resServices.data?.length > 0 && selectedItems.length === 0) {
        // default to Pijat Bayi Homecare if available, or first service
        const defaultSrv = resServices.data.find(s => s.nama_layanan.toLowerCase().includes('pijat bayi')) || resServices.data[0];
        setSelectedItems([{
          layanan_id: defaultSrv.id,
          nama_layanan: defaultSrv.nama_layanan,
          tarif: Number(defaultSrv.tarif),
          qty: 1,
          subtotal: Number(defaultSrv.tarif)
        }]);
      }
    } catch (err) {
      console.error('Error loading registration data:', err);
    }
  };

  // When patient selection changes, auto-fill address & fetch past history
  const handlePatientChange = (patientId) => {
    setSelectedPatientId(patientId);
    const p = patients.find(x => x.id.toString() === patientId.toString());
    if (p && p.alamat) {
      setAlamatHomevisit(p.alamat);
    }
    fetchPatientHistory(patientId);
  };

  // Add service item
  const handleAddService = (serviceId) => {
    const srv = services.find(s => s.id.toString() === serviceId.toString());
    if (!srv) return;

    // Check if already in list
    const existing = selectedItems.find(i => i.layanan_id === srv.id);
    if (existing) {
      toast.error('Layanan ini sudah ditambahkan ke daftar.');
      return;
    }

    setSelectedItems(prev => [
      ...prev,
      {
        layanan_id: srv.id,
        nama_layanan: srv.nama_layanan,
        tarif: Number(srv.tarif),
        qty: 1,
        subtotal: Number(srv.tarif)
      }
    ]);
  };

  // Remove service item
  const handleRemoveItem = (index) => {
    setSelectedItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Change item quantity or price
  const handleUpdateItem = (index, field, value) => {
    setSelectedItems(prev => {
      const copy = [...prev];
      const item = { ...copy[index] };
      if (field === 'qty') {
        item.qty = Math.max(1, Number(value) || 1);
        item.subtotal = item.qty * item.tarif;
      } else if (field === 'tarif') {
        item.tarif = Math.max(0, Number(value) || 0);
        item.subtotal = item.qty * item.tarif;
      }
      copy[index] = item;
      return copy;
    });
  };

  // Totals calculation
  const subtotalLayanan = selectedItems.reduce((acc, item) => acc + Number(item.subtotal), 0);
  const currentTransport = tipeLayanan === 'homevisit' ? Number(biayaTransport) || 0 : 0;
  const totalBiaya = subtotalLayanan + currentTransport;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatientId) {
      toast.error('Silakan pilih pasien');
      return;
    }

    if (!jadwalKunjungan) {
      toast.error('Silakan tentukan jadwal tanggal & jam kunjungan');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Pilih minimal satu layanan yang akan diambil');
      return;
    }

    try {
      setIsLoading(true);

      const finalBidan = isCustomBidan && customBidanText.trim()
        ? customBidanText.trim()
        : bidanPetugas;

      const mergedClinical = {
        ...clinicalData,
        keluhan_utama: keluhanUtama,
        tekanan_darah: tekananDarah,
        berat_badan: beratBadan,
        tindakan_edukasi: tindakanEdukasi,
        hasil_pemeriksaan: hasilPemeriksaan
      };

      const payload = {
        pasien_id: Number(selectedPatientId),
        tipe_layanan: tipeLayanan,
        jadwal_kunjungan: jadwalKunjungan,
        alamat_homevisit: tipeLayanan === 'homevisit' ? alamatHomevisit : '',
        jarak_km: tipeLayanan === 'homevisit' ? Number(jarakKm) || 0 : 0,
        biaya_transport: currentTransport,
        bidan_petugas: finalBidan,
        catatan_kunjungan: catatanKunjungan,
        hasil_pemeriksaan: hasilPemeriksaan || (tekananDarah ? `TD: ${tekananDarah}` : ''),
        data_klinis: mergedClinical,
        items: selectedItems,
        status_pembayaran: statusPembayaran,
        metode_pembayaran: metodePembayaran
      };

      const res = await request.post(API_ENDPOINTS.KUNJUNGAN.CREATE, payload);

      if (res.success && res.data) {
        toast.success('Pendaftaran layanan / homevisit berhasil disimpan!');

        const patientObj = patients.find(p => p.id.toString() === selectedPatientId.toString()) || { nama: 'Pasien' };

        if (sendWAImmediate && onTriggerWAMessage) {
          onTriggerWAMessage({
            visit: res.data,
            patient: patientObj,
            config
          });
        }

        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan pendaftaran layanan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daftarkan Layanan / Homevisit"
      subtitle="Kalkulasi otomatis tarif layanan + biaya transport & invoice WhatsApp"
      maxWidth="max-w-3xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
          <div className="text-left">
            <span className="text-xs text-slate-500 block">Total Tagihan:</span>
            <span className="text-xl font-bold font-mono text-brand-700">
              {formatRupiah(totalBiaya)}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Simpan & Buat Invoice</span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Pilih Pasien */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-brand-600" />
            1. Pilih Pasien <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={selectedPatientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 bg-white"
            >
              <option value="">-- Pilih dari Daftar Pasien --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.no_rm}) — WA: {p.hp_wa}
                </option>
              ))}
            </select>
          </div>

          {/* Previous Medical History Card when patient visits again */}
          {isLoadingHistory ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
              <span>Memeriksa riwayat rekam medis pasien...</span>
            </div>
          ) : patientHistory.length > 0 ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-50/80 via-purple-50/50 to-brand-50/60 border border-brand-200/80 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
                  <Stethoscope className="w-4 h-4 text-brand-600" />
                  <span>Riwayat Pemeriksaan Sebelumnya ({patientHistory.length} Kunjungan)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllHistory(prev => !prev)}
                  className="text-[11px] font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-0.5 underline"
                >
                  {showAllHistory ? 'Tutup Rincian' : 'Lihat Riwayat'}
                  {showAllHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Latest Visit Summary */}
              {(() => {
                const latest = patientHistory[0];
                return (
                  <div className="text-xs text-slate-700 bg-white/90 p-2.5 rounded-lg border border-brand-100 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                      <span>Kunjungan Terakhir: <strong className="text-slate-800">{formatDate(latest.jadwal_kunjungan)}</strong> ({latest.tipe_layanan})</span>
                      <span>Oleh: <strong className="text-brand-700">{latest.bidan_petugas || 'Bdn. Norhalimah, S.Keb'}</strong></span>
                    </div>
                    {latest.daftar_layanan && (
                      <p className="text-[11px] text-slate-600">
                        Layanan: <span className="font-medium text-slate-800">{latest.daftar_layanan}</span>
                      </p>
                    )}
                    {(latest.hasil_pemeriksaan || latest.catatan_kunjungan) && (
                      <div className="mt-1 pt-1 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-brand-700 block">Hasil Pemeriksaan Terakhir:</span>
                        <p className="text-xs text-slate-800 font-medium whitespace-pre-line">
                          {latest.hasil_pemeriksaan || latest.catatan_kunjungan}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Older visits dropdown */}
              {showAllHistory && patientHistory.length > 1 && (
                <div className="space-y-1.5 pt-1 border-t border-brand-100 max-h-48 overflow-y-auto">
                  {patientHistory.slice(1).map((v) => (
                    <div key={v.id} className="text-[11px] bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{formatDate(v.jadwal_kunjungan)} — {v.daftar_layanan || v.tipe_layanan}</span>
                        <span className="text-slate-500">{v.bidan_petugas}</span>
                      </div>
                      {(v.hasil_pemeriksaan || v.catatan_kunjungan) && (
                        <p className="text-slate-600 text-[11px] italic">
                          "{v.hasil_pemeriksaan || v.catatan_kunjungan}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : selectedPatientId ? (
            <p className="text-[11px] text-slate-400 italic">
              Pasien ini baru pertama kali kunjungan (belum ada riwayat sebelumnya).
            </p>
          ) : null}
        </div>

        {/* Step 2: Tipe Kunjungan (Homevisit vs Klinik) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-brand-600" />
            2. Tipe Lokasi Layanan
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTipeLayanan('homevisit')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                tipeLayanan === 'homevisit'
                  ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/20 text-brand-900 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${tipeLayanan === 'homevisit' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm block">Homevisit (Ke Rumah)</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Bidan berkunjung ke rumah pasien + biaya transport
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTipeLayanan('klinik')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                tipeLayanan === 'klinik'
                  ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/20 text-brand-900 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${tipeLayanan === 'klinik' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm block">Klinik PMB</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Pasien datang langsung ke tempat praktik mandiri bidan
                </span>
              </div>
            </button>
          </div>

          {/* Homevisit specific fields */}
          {tipeLayanan === 'homevisit' && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3 mt-2 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Detail Lokasi Kunjungan Homevisit</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Alamat Kunjungan Lengkap
                </label>
                <textarea
                  value={alamatHomevisit}
                  onChange={(e) => setAlamatHomevisit(e.target.value)}
                  rows={2}
                  placeholder="Alamat rumah, patokan, nomor rumah/blok..."
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Perkiraan Jarak (km)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={jarakKm}
                    onChange={(e) => setJarakKm(e.target.value)}
                    placeholder="Contoh: 4.5"
                    className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Biaya Transport Homevisit (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={biayaTransport}
                    onChange={(e) => setBiayaTransport(Number(e.target.value) || 0)}
                    placeholder="Contoh: 25000"
                    className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs sm:text-sm font-bold font-mono text-brand-700 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Pilih Layanan (Multi-select) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              3. Rincian Layanan & Tarif (Bisa Lebih Dari 1) <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs font-semibold text-brand-600">
              Subtotal: {formatRupiah(subtotalLayanan)}
            </span>
          </div>

          {/* Quick Add Dropdown */}
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddService(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 bg-white focus:border-brand-500 focus:outline-none"
            >
              <option value="">+ Tambah Layanan ke Invoice...</option>
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.nama_layanan} — {formatRupiah(srv.tarif)} ({srv.kategori.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Items Table / Cards */}
          {selectedItems.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-xs">
              Belum ada layanan dipilih. Silakan pilih layanan dari dropdown di atas.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item, index) => (
                <div
                  key={item.layanan_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate">
                      {item.nama_layanan}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatRupiah(item.tarif)} / sesi
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleUpdateItem(index, 'qty', item.qty - 1)}
                        className="px-2 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-bold text-slate-800">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItem(index, 'qty', item.qty + 1)}
                        className="px-2 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs sm:text-sm font-bold font-mono text-brand-700 min-w-[85px] text-right">
                      {formatRupiah(item.subtotal)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Jadwal Kunjungan & Bidan Petugas */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                4. Jadwal Tanggal & Jam Kunjungan <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={jadwalKunjungan}
                onChange={(e) => setJadwalKunjungan(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Bidan / Terapis Bertugas</span>
                <span className="text-[10px] font-normal text-brand-600">Pilih cepat:</span>
              </label>

              {/* Quick Click Badges for Midwives as requested */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {bidanList.map((b) => {
                  const isSelected = !isCustomBidan && bidanPetugas === b.nama;
                  return (
                    <button
                      key={b.id || b.nama}
                      type="button"
                      onClick={() => {
                        setBidanPetugas(b.nama);
                        setIsCustomBidan(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-300 scale-[1.02]'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      <span>{b.role === 'admin' ? '🌸' : '👩‍⚕️'}</span>
                      <span>{b.nama}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setIsCustomBidan(prev => !prev)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isCustomBidan
                      ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  ✍️ Ketik Manual
                </button>
              </div>

              {isCustomBidan && (
                <div className="pt-1 animate-fade-in">
                  <input
                    type="text"
                    value={customBidanText}
                    onChange={(e) => setCustomBidanText(e.target.value)}
                    placeholder="Ketik nama bidan / terapis bertugas..."
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 5: Hasil Pemeriksaan & Catatan Medis (Revisi Klien) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-pink-50/30 to-purple-50/30 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-brand-600" />
              <span>5. Catatan Rekam Medis & Hasil Pemeriksaan</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              (Bisa diisi sekarang atau setelah periksa)
            </span>
          </div>

          {/* Quick Vital Signs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                Tekanan Darah / Tensi:
              </label>
              <input
                type="text"
                value={tekananDarah}
                onChange={(e) => setTekananDarah(e.target.value)}
                placeholder="misal: 120/80 mmHg"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                Berat Badan (BB):
              </label>
              <input
                type="text"
                value={beratBadan}
                onChange={(e) => setBeratBadan(e.target.value)}
                placeholder="misal: 62 kg / Bayi 4.5 kg"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Hasil Pemeriksaan & Diagnosa */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Hasil Pemeriksaan Fisik, Diagnosa & Keluhan:
            </label>
            <textarea
              rows={2}
              value={hasilPemeriksaan}
              onChange={(e) => setHasilPemeriksaan(e.target.value)}
              placeholder="Contoh: Kondisi ibu baik, involusi rahim 2 jari bawah pusat, lochea serosa normal. Bayi relaks setelah pijat bayi, BAB/BAK lancar."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Tindakan, Anjuran & Terapi */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Tindakan, Anjuran & Terapi Bidan:
            </label>
            <input
              type="text"
              value={tindakanEdukasi}
              onChange={(e) => setTindakanEdukasi(e.target.value)}
              placeholder="Contoh: Edukasi ASI eksklusif, senam nifas mandiri, vitamin diminum teratur"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Step 6: Pembayaran & Opsi WhatsApp */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            6. Status Pembayaran & Notifikasi Pasien
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-600 font-semibold block">Status Pembayaran Saat Ini:</span>
              <select
                value={statusPembayaran}
                onChange={(e) => setStatusPembayaran(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold bg-white text-slate-800"
              >
                <option value="belum_lunas">Belum Lunas (Kirim Tagihan / Invoice)</option>
                <option value="lunas">Lunas (Sudah Dibayar)</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-600 font-semibold block">Metode Pembayaran Ditujukan:</span>
              <select
                value={metodePembayaran}
                onChange={(e) => setMetodePembayaran(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold bg-white text-slate-800"
              >
                <option value="transfer_bsi">Transfer BSI (7124826197 a.n. Norhalimah)</option>
                <option value="qris">QRIS (Tanpa Biaya Admin)</option>
                <option value="tunai">Tunai / Cash saat kunjungan</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 pt-2 cursor-pointer border-t border-slate-200">
            <input
              type="checkbox"
              checked={sendWAImmediate}
              onChange={(e) => setSendWAImmediate(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Buka pratinjau pesan WhatsApp otomatis setelah registrasi berhasil disimpan
            </span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
