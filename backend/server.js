/**
 * PMB RUMAH MARYAM - BACKEND API SERVER
 * Praktik Mandiri Bidan & Homecare Keluarga
 * Stack: Express JS, MySQL (mysql2/promise), Multer, Cors, Dotenv
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'pmb_rumah_maryam_jwt_secret_key_2026_super_secure';

// Authentication Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Akses ditolak: token otentikasi tidak ditemukan. Silakan login kembali.' });
  }
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Sesi login telah kedaluwarsa atau tidak valid. Silakan login ulang.' });
  }
};

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload directory setup
const UPLOADS_DIR = path.join(__dirname, 'uploads-pmb-rumah-maryam');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) && allowed.test(mime)) {
      return cb(null, true);
    }
    cb(new Error('Format file tidak didukung! Hanya gambar (JPG, PNG, WebP) diperbolehkan.'));
  }
});

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pmb_rumah_maryam',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper for standardized pagination response
const sendPaginatedResponse = (res, data, total, page, limit, extra = {}) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.json({
    success: true,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages
    },
    ...extra
  });
};

// ===================================================================
// 1. CONFIG & DASHBOARD STATS
// ===================================================================

// GET /api/config - Get Clinic & Bank Settings
app.get('/api/config', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM klinik_config LIMIT 1');
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Konfigurasi klinik tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching config:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil konfigurasi klinik' });
  }
});

// PUT /api/config - Update Clinic & Bank Settings
app.put('/api/config', async (req, res) => {
  try {
    const {
      nama_praktik, tagline, bidan_nama, sipb, alamat, no_wa,
      instagram, bank_nama, bank_rekening, bank_atas_nama,
      qris_image_url, default_transport_fee
    } = req.body;

    await pool.query(
      `UPDATE klinik_config SET 
        nama_praktik = ?, tagline = ?, bidan_nama = ?, sipb = ?, alamat = ?, 
        no_wa = ?, instagram = ?, bank_nama = ?, bank_rekening = ?, 
        bank_atas_nama = ?, qris_image_url = ?, default_transport_fee = ?
       WHERE id = 1`,
      [
        nama_praktik || 'PMB Rumah Maryam',
        tagline || '',
        bidan_nama || '',
        sipb || '',
        alamat || '',
        no_wa || '',
        instagram || '',
        bank_nama || 'BSI',
        bank_rekening || '7124826197',
        bank_atas_nama || 'Norhalimah',
        qris_image_url || '/uploads/qris.jpeg',
        default_transport_fee || 25000.00
      ]
    );

    const [updated] = await pool.query('SELECT * FROM klinik_config WHERE id = 1');
    res.json({ success: true, message: 'Konfigurasi klinik berhasil disimpan', data: updated[0] });
  } catch (err) {
    console.error('Error updating config:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui konfigurasi klinik' });
  }
});

// GET /api/dashboard/stats - Dashboard metrics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = today.slice(0, 7);

    // Total Patients
    const [[{ total_pasien }]] = await pool.query('SELECT COUNT(*) as total_pasien FROM pasien');

    // Visits Today
    const [[{ kunjungan_hari_ini }]] = await pool.query(
      'SELECT COUNT(*) as kunjungan_hari_ini FROM kunjungan WHERE DATE(jadwal_kunjungan) = ?',
      [today]
    );

    // Upcoming Visits (Terjadwal)
    const [[{ kunjungan_terjadwal }]] = await pool.query(
      "SELECT COUNT(*) as kunjungan_terjadwal FROM kunjungan WHERE status_kunjungan = 'terjadwal'"
    );

    // Unpaid Invoices
    const [[{ piutang_belum_lunas, total_piutang }]] = await pool.query(
      "SELECT COUNT(*) as piutang_belum_lunas, COALESCE(SUM(total_biaya), 0) as total_piutang FROM kunjungan WHERE status_pembayaran = 'belum_lunas'"
    );

    // Financial totals (All Time & This Month)
    const [[{ pemasukan_bulan_ini }]] = await pool.query(
      "SELECT COALESCE(SUM(jumlah), 0) as pemasukan_bulan_ini FROM transaksi_keuangan WHERE tipe = 'masuk' AND DATE_FORMAT(tanggal, '%Y-%m') = ?",
      [thisMonth]
    );

    const [[{ pengeluaran_bulan_ini }]] = await pool.query(
      "SELECT COALESCE(SUM(jumlah), 0) as pengeluaran_bulan_ini FROM transaksi_keuangan WHERE tipe = 'keluar' AND DATE_FORMAT(tanggal, '%Y-%m') = ?",
      [thisMonth]
    );

    const [[{ total_masuk_all }]] = await pool.query(
      "SELECT COALESCE(SUM(jumlah), 0) as total_masuk_all FROM transaksi_keuangan WHERE tipe = 'masuk'"
    );

    const [[{ total_keluar_all }]] = await pool.query(
      "SELECT COALESCE(SUM(jumlah), 0) as total_keluar_all FROM transaksi_keuangan WHERE tipe = 'keluar'"
    );

    const saldo_kas = Number(total_masuk_all) - Number(total_keluar_all);

    // Nearest upcoming visits (5 items)
    const [upcomingVisits] = await pool.query(
      `SELECT k.*, p.nama as pasien_nama, p.hp_wa as pasien_wa, p.no_rm as pasien_no_rm
       FROM kunjungan k
       JOIN pasien p ON k.pasien_id = p.id
       WHERE k.status_kunjungan = 'terjadwal'
       ORDER BY k.jadwal_kunjungan ASC
       LIMIT 5`
    );

    // Recent Transactions (5 items)
    const [recentTransactions] = await pool.query(
      'SELECT * FROM transaksi_keuangan ORDER BY tanggal DESC, id DESC LIMIT 5'
    );

    res.json({
      success: true,
      data: {
        total_pasien: Number(total_pasien),
        kunjungan_hari_ini: Number(kunjungan_hari_ini),
        kunjungan_terjadwal: Number(kunjungan_terjadwal),
        piutang_belum_lunas: Number(piutang_belum_lunas),
        total_piutang: Number(total_piutang),
        pemasukan_bulan_ini: Number(pemasukan_bulan_ini),
        pengeluaran_bulan_ini: Number(pengeluaran_bulan_ini),
        saldo_kas,
        upcoming_visits: upcomingVisits,
        recent_transactions: recentTransactions
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik dashboard' });
  }
});

// ===================================================================
// 2. DATA PASIEN (PATIENTS)
// ===================================================================

// GET /api/pasien - List Patients with Search, Filter & Pagination
app.get('/api/pasien', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (search.trim()) {
      whereSql += ' AND (nama LIKE ? OR no_rm LIKE ? OR hp_wa LIKE ? OR nik LIKE ? OR alamat LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s);
    }

    // Count Total
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM pasien ${whereSql}`, params);

    // Valid sort columns
    const allowedSort = ['id', 'no_rm', 'nama', 'created_at', 'tanggal_lahir'];
    const sortCol = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Query Data with visit count
    const [rows] = await pool.query(
      `SELECT p.*, 
        COUNT(k.id) as total_kunjungan,
        MAX(k.jadwal_kunjungan) as kunjungan_terakhir
       FROM pasien p
       LEFT JOIN kunjungan k ON p.id = k.pasien_id
       ${whereSql}
       GROUP BY p.id
       ORDER BY p.${sortCol} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    sendPaginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    console.error('Error fetching pasien:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat data pasien' });
  }
});

// GET /api/pasien/:id - Detail Patient + Medical/Visit Records
app.get('/api/pasien/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [patients] = await pool.query('SELECT * FROM pasien WHERE id = ?', [id]);
    if (!patients.length) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
    }

    const patient = patients[0];

    // Get Visit history with services
    const [visits] = await pool.query(
      `SELECT k.*, 
        GROUP_CONCAT(kd.nama_layanan SEPARATOR ', ') as daftar_layanan
       FROM kunjungan k
       LEFT JOIN kunjungan_detail kd ON k.id = kd.kunjungan_id
       WHERE k.pasien_id = ?
       GROUP BY k.id
       ORDER BY k.jadwal_kunjungan DESC`,
      [id]
    );

    res.json({ success: true, data: { ...patient, kunjungan: visits } });
  } catch (err) {
    console.error('Error fetching patient detail:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail pasien' });
  }
});

// POST /api/pasien - Create Patient with Auto-Generated No RM
app.post('/api/pasien', async (req, res) => {
  try {
    const { nama, nik, tanggal_lahir, hp_wa, alamat, nama_suami, golongan_darah, alergi, catatan_khusus, foto_url } = req.body;

    if (!nama || !hp_wa) {
      return res.status(400).json({ success: false, message: 'Nama pasien dan nomor WhatsApp wajib diisi' });
    }

    // Auto-generate No RM: RM-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const [[{ max_id }]] = await pool.query('SELECT COALESCE(MAX(id), 0) as max_id FROM pasien');
    const nextSeq = String(Number(max_id) + 1).padStart(4, '0');
    const no_rm = `RM-${currentYear}-${nextSeq}`;

    const [result] = await pool.query(
      `INSERT INTO pasien (no_rm, nama, nik, tanggal_lahir, hp_wa, alamat, nama_suami, golongan_darah, alergi, catatan_khusus, foto_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        no_rm,
        nama.trim(),
        nik ? nik.trim() : null,
        tanggal_lahir || null,
        hp_wa.trim(),
        alamat ? alamat.trim() : null,
        nama_suami ? nama_suami.trim() : null,
        golongan_darah || null,
        alergi ? alergi.trim() : null,
        catatan_khusus ? catatan_khusus.trim() : null,
        foto_url || null
      ]
    );

    const [newPatient] = await pool.query('SELECT * FROM pasien WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Pasien berhasil ditambahkan', data: newPatient[0] });
  } catch (err) {
    console.error('Error creating pasien:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pasien' });
  }
});

// PUT /api/pasien/:id - Update Patient
app.put('/api/pasien/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nik, tanggal_lahir, hp_wa, alamat, nama_suami, golongan_darah, alergi, catatan_khusus, foto_url } = req.body;

    if (!nama || !hp_wa) {
      return res.status(400).json({ success: false, message: 'Nama pasien dan nomor WhatsApp wajib diisi' });
    }

    const [exists] = await pool.query('SELECT id FROM pasien WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
    }

    await pool.query(
      `UPDATE pasien SET 
        nama = ?, nik = ?, tanggal_lahir = ?, hp_wa = ?, alamat = ?, 
        nama_suami = ?, golongan_darah = ?, alergi = ?, catatan_khusus = ?, foto_url = ?
       WHERE id = ?`,
      [
        nama.trim(),
        nik ? nik.trim() : null,
        tanggal_lahir || null,
        hp_wa.trim(),
        alamat ? alamat.trim() : null,
        nama_suami ? nama_suami.trim() : null,
        golongan_darah || null,
        alergi ? alergi.trim() : null,
        catatan_khusus ? catatan_khusus.trim() : null,
        foto_url || null,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM pasien WHERE id = ?', [id]);
    res.json({ success: true, message: 'Data pasien berhasil diperbarui', data: updated[0] });
  } catch (err) {
    console.error('Error updating pasien:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data pasien' });
  }
});

// DELETE /api/pasien/:id - Delete Patient
app.delete('/api/pasien/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [exists] = await pool.query('SELECT id, nama FROM pasien WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
    }

    await pool.query('DELETE FROM pasien WHERE id = ?', [id]);
    res.json({ success: true, message: `Pasien ${exists[0].nama} berhasil dihapus` });
  } catch (err) {
    console.error('Error deleting pasien:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus pasien' });
  }
});

// ===================================================================
// 3. MASTER DATA LAYANAN & TARIF (SERVICES & PRICING)
// ===================================================================

// GET /api/layanan - List Services with Search, Kategori & Pagination
app.get('/api/layanan', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', kategori = '', is_active = '', sortBy = 'kategori', sortOrder = 'ASC' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (search.trim()) {
      whereSql += ' AND (nama_layanan LIKE ? OR kode LIKE ? OR deskripsi LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (kategori && kategori !== 'semua') {
      whereSql += ' AND kategori = ?';
      params.push(kategori);
    }

    if (is_active !== '') {
      whereSql += ' AND is_active = ?';
      params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM layanan ${whereSql}`, params);

    const allowedSort = ['id', 'kode', 'nama_layanan', 'kategori', 'tarif', 'created_at'];
    const sortCol = allowedSort.includes(sortBy) ? sortBy : 'kategori';
    const sortDir = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const [rows] = await pool.query(
      `SELECT * FROM layanan ${whereSql} ORDER BY ${sortCol} ${sortDir}, nama_layanan ASC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    sendPaginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    console.error('Error fetching layanan:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat daftar layanan' });
  }
});

// POST /api/layanan - Add New Service
app.post('/api/layanan', async (req, res) => {
  try {
    const { nama_layanan, kategori, tarif, is_homecare_available = 1, deskripsi = '', kode } = req.body;

    if (!nama_layanan || tarif === undefined || tarif === '') {
      return res.status(400).json({ success: false, message: 'Nama layanan dan tarif wajib diisi' });
    }

    // Auto-generate code if empty
    let srvCode = kode ? kode.trim().toUpperCase() : '';
    if (!srvCode) {
      const prefix = (kategori || 'SRV').toUpperCase().slice(0, 4);
      srvCode = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
    }

    const [result] = await pool.query(
      `INSERT INTO layanan (kode, nama_layanan, kategori, tarif, is_homecare_available, deskripsi, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        srvCode,
        nama_layanan.trim(),
        kategori || 'ibu',
        Number(tarif),
        is_homecare_available ? 1 : 0,
        deskripsi ? deskripsi.trim() : null
      ]
    );

    const [newService] = await pool.query('SELECT * FROM layanan WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Layanan baru berhasil ditambahkan', data: newService[0] });
  } catch (err) {
    console.error('Error creating layanan:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan layanan' });
  }
});

// PUT /api/layanan/:id - Update Service
app.put('/api/layanan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_layanan, kategori, tarif, is_homecare_available, deskripsi, is_active } = req.body;

    const [exists] = await pool.query('SELECT id FROM layanan WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
    }

    await pool.query(
      `UPDATE layanan SET 
        nama_layanan = COALESCE(?, nama_layanan),
        kategori = COALESCE(?, kategori),
        tarif = COALESCE(?, tarif),
        is_homecare_available = COALESCE(?, is_homecare_available),
        deskripsi = COALESCE(?, deskripsi),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        nama_layanan ? nama_layanan.trim() : null,
        kategori || null,
        tarif !== undefined ? Number(tarif) : null,
        is_homecare_available !== undefined ? (is_homecare_available ? 1 : 0) : null,
        deskripsi !== undefined ? deskripsi : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM layanan WHERE id = ?', [id]);
    res.json({ success: true, message: 'Layanan berhasil diperbarui', data: updated[0] });
  } catch (err) {
    console.error('Error updating layanan:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui layanan' });
  }
});

// DELETE /api/layanan/:id - Delete Service
app.delete('/api/layanan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [exists] = await pool.query('SELECT id, nama_layanan FROM layanan WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
    }

    // Check if used in kunjungan_detail
    const [[{ used_count }]] = await pool.query('SELECT COUNT(*) as used_count FROM kunjungan_detail WHERE layanan_id = ?', [id]);
    if (used_count > 0) {
      // Soft-delete instead of hard-delete to protect foreign key integrity
      await pool.query('UPDATE layanan SET is_active = 0 WHERE id = ?', [id]);
      return res.json({ success: true, message: `Layanan ${exists[0].nama_layanan} dinonaktifkan (karena sudah memiliki riwayat kunjungan)` });
    }

    await pool.query('DELETE FROM layanan WHERE id = ?', [id]);
    res.json({ success: true, message: `Layanan ${exists[0].nama_layanan} berhasil dihapus` });
  } catch (err) {
    console.error('Error deleting layanan:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus layanan' });
  }
});

// ===================================================================
// 4. KUNJUNGAN & REGISTRASI LAYANAN (HOMEVISIT & KLINIK)
// ===================================================================

// GET /api/kunjungan - List Visits with Filters & Pagination
app.get('/api/kunjungan', async (req, res) => {
  try {
    const {
      page = 1, limit = 10, search = '', tipe_layanan = '',
      status_kunjungan = '', status_pembayaran = '',
      tanggal = '', sortBy = 'jadwal_kunjungan', sortOrder = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (search.trim()) {
      whereSql += ' AND (p.nama LIKE ? OR p.no_rm LIKE ? OR k.kode_kunjungan LIKE ? OR k.alamat_homevisit LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (tipe_layanan && tipe_layanan !== 'semua') {
      whereSql += ' AND k.tipe_layanan = ?';
      params.push(tipe_layanan);
    }

    if (status_kunjungan && status_kunjungan !== 'semua') {
      whereSql += ' AND k.status_kunjungan = ?';
      params.push(status_kunjungan);
    }

    if (status_pembayaran && status_pembayaran !== 'semua') {
      whereSql += ' AND k.status_pembayaran = ?';
      params.push(status_pembayaran);
    }

    if (tanggal) {
      whereSql += ' AND DATE(k.jadwal_kunjungan) = ?';
      params.push(tanggal);
    }

    // Count Total
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total 
       FROM kunjungan k 
       JOIN pasien p ON k.pasien_id = p.id 
       ${whereSql}`,
      params
    );

    const allowedSort = ['id', 'jadwal_kunjungan', 'total_biaya', 'status_kunjungan', 'status_pembayaran', 'created_at'];
    const sortCol = allowedSort.includes(sortBy) ? sortBy : 'jadwal_kunjungan';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [rows] = await pool.query(
      `SELECT k.*, 
        p.nama as pasien_nama, p.no_rm as pasien_no_rm, p.hp_wa as pasien_wa, p.alamat as pasien_alamat_tetap
       FROM kunjungan k
       JOIN pasien p ON k.pasien_id = p.id
       ${whereSql}
       ORDER BY k.${sortCol} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    // Fetch details for each visit
    const visitIds = rows.map(r => r.id);
    let detailsMap = {};
    if (visitIds.length) {
      const [details] = await pool.query(
        `SELECT * FROM kunjungan_detail WHERE kunjungan_id IN (?)`,
        [visitIds]
      );
      details.forEach(d => {
        if (!detailsMap[d.kunjungan_id]) detailsMap[d.kunjungan_id] = [];
        detailsMap[d.kunjungan_id].push(d);
      });
    }

    const formattedRows = rows.map(r => ({
      ...r,
      items: detailsMap[r.id] || []
    }));

    sendPaginatedResponse(res, formattedRows, total, page, limit);
  } catch (err) {
    console.error('Error fetching kunjungan:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat data kunjungan' });
  }
});

// GET /api/kunjungan/:id - Detail Visit with Items & Patient Info
app.get('/api/kunjungan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [visits] = await pool.query(
      `SELECT k.*, 
        p.nama as pasien_nama, p.no_rm as pasien_no_rm, p.hp_wa as pasien_wa, p.alamat as pasien_alamat
       FROM kunjungan k
       JOIN pasien p ON k.pasien_id = p.id
       WHERE k.id = ?`,
      [id]
    );

    if (!visits.length) {
      return res.status(404).json({ success: false, message: 'Data kunjungan tidak ditemukan' });
    }

    const visit = visits[0];
    const [items] = await pool.query('SELECT * FROM kunjungan_detail WHERE kunjungan_id = ?', [id]);

    res.json({ success: true, data: { ...visit, items } });
  } catch (err) {
    console.error('Error fetching kunjungan detail:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail kunjungan' });
  }
});

// POST /api/kunjungan - Register New Service / Homevisit
app.post('/api/kunjungan', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      pasien_id, tipe_layanan = 'klinik', jadwal_kunjungan,
      alamat_homevisit = '', jarak_km = 0, biaya_transport = 0,
      bidan_petugas = 'Bdn. Norhalimah, S.Tr.Keb', catatan_kunjungan = '',
      data_klinis = {}, items = [],
      status_pembayaran = 'belum_lunas', metode_pembayaran = 'transfer_bsi'
    } = req.body;

    if (!pasien_id || !jadwal_kunjungan) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Pasien dan jadwal kunjungan wajib diisi' });
    }

    if (!items || !items.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Pilih minimal satu layanan yang akan diambil' });
    }

    // Auto-generate Kode Kunjungan: REG-YYYYMM-XXXX
    const now = new Date();
    const period = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0');
    const [[{ max_id }]] = await connection.query('SELECT COALESCE(MAX(id), 0) as max_id FROM kunjungan');
    const seq = String(Number(max_id) + 1).padStart(3, '0');
    const kode_kunjungan = `REG-${period}-${seq}`;

    // Calculate subtotal from items
    let subtotal_layanan = 0;
    const validatedItems = [];

    for (const item of items) {
      const [serviceRows] = await connection.query('SELECT id, nama_layanan, tarif FROM layanan WHERE id = ?', [item.layanan_id]);
      if (!serviceRows.length) continue;
      const srv = serviceRows[0];
      const qty = Number(item.qty) || 1;
      const tarif = item.tarif !== undefined ? Number(item.tarif) : Number(srv.tarif);
      const subtotal = tarif * qty;
      subtotal_layanan += subtotal;

      validatedItems.push({
        layanan_id: srv.id,
        nama_layanan: srv.nama_layanan,
        tarif,
        qty,
        subtotal
      });
    }

    const transportFee = tipe_layanan === 'homevisit' ? Number(biaya_transport) : 0;
    const total_biaya = subtotal_layanan + transportFee;

    // Insert kunjungan header
    const [visitResult] = await connection.query(
      `INSERT INTO kunjungan (
        kode_kunjungan, pasien_id, tipe_layanan, jadwal_kunjungan,
        alamat_homevisit, jarak_km, biaya_transport, subtotal_layanan, total_biaya,
        status_kunjungan, status_pembayaran, metode_pembayaran,
        waktu_pembayaran, bidan_petugas, catatan_kunjungan, data_klinis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'terjadwal', ?, ?, ?, ?, ?, ?)`,
      [
        kode_kunjungan,
        pasien_id,
        tipe_layanan,
        jadwal_kunjungan,
        tipe_layanan === 'homevisit' ? alamat_homevisit : null,
        tipe_layanan === 'homevisit' ? Number(jarak_km) : 0,
        transportFee,
        subtotal_layanan,
        total_biaya,
        status_pembayaran,
        metode_pembayaran,
        status_pembayaran === 'lunas' ? new Date() : null,
        bidan_petugas,
        catatan_kunjungan,
        JSON.stringify(data_klinis || {})
      ]
    );

    const kunjungan_id = visitResult.insertId;

    // Insert items
    for (const vItem of validatedItems) {
      await connection.query(
        `INSERT INTO kunjungan_detail (kunjungan_id, layanan_id, nama_layanan, tarif, qty, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [kunjungan_id, vItem.layanan_id, vItem.nama_layanan, vItem.tarif, vItem.qty, vItem.subtotal]
      );
    }

    // If paid upfront, record automatically to transaksi_keuangan
    if (status_pembayaran === 'lunas') {
      const [patientRows] = await connection.query('SELECT nama FROM pasien WHERE id = ?', [pasien_id]);
      const patientNama = patientRows.length ? patientRows[0].nama : '';
      const trxKode = `TRX-IN-${Date.now().toString(36).toUpperCase()}`;

      await connection.query(
        `INSERT INTO transaksi_keuangan (kode_transaksi, tanggal, tipe, kategori, jumlah, keterangan, pasien_id, pasien_nama, kunjungan_id, metode)
         VALUES (?, CURDATE(), 'masuk', ?, ?, ?, ?, ?, ?, ?)`,
        [
          trxKode,
          tipe_layanan === 'homevisit' ? 'Homecare + Transport' : 'Biaya Layanan',
          total_biaya,
          `Pembayaran lunas kunjungan ${kode_kunjungan} (${tipe_layanan.toUpperCase()})`,
          pasien_id,
          patientNama,
          kunjungan_id,
          metode_pembayaran === 'qris' ? 'QRIS' : (metode_pembayaran === 'tunai' ? 'Tunai' : 'Transfer BSI')
        ]
      );
    }

    await connection.commit();

    // Fetch newly created full visit
    const [created] = await pool.query(
      `SELECT k.*, p.nama as pasien_nama, p.hp_wa as pasien_wa, p.no_rm as pasien_no_rm
       FROM kunjungan k
       JOIN pasien p ON k.pasien_id = p.id
       WHERE k.id = ?`,
      [kunjungan_id]
    );
    const [createdItems] = await pool.query('SELECT * FROM kunjungan_detail WHERE kunjungan_id = ?', [kunjungan_id]);

    res.status(201).json({
      success: true,
      message: 'Registrasi layanan / kunjungan berhasil disimpan',
      data: { ...created[0], items: createdItems }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating kunjungan:', err);
    res.status(500).json({ success: false, message: 'Gagal membuat registrasi kunjungan' });
  } finally {
    connection.release();
  }
});

// PUT /api/kunjungan/:id - Update Visit Details, Status & Items
app.put('/api/kunjungan/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    const [exists] = await connection.query('SELECT * FROM kunjungan WHERE id = ?', [id]);
    if (!exists.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Kunjungan tidak ditemukan' });
    }
    const currentVisit = exists[0];

    const {
      tipe_layanan, jadwal_kunjungan, alamat_homevisit, jarak_km,
      biaya_transport, bidan_petugas, catatan_kunjungan,
      status_kunjungan, status_pembayaran, metode_pembayaran,
      data_klinis, items
    } = req.body;

    let subtotal_layanan = Number(currentVisit.subtotal_layanan);
    let transportFee = biaya_transport !== undefined ? Number(biaya_transport) : Number(currentVisit.biaya_transport);

    // If items are provided, replace and recalculate
    if (items && Array.isArray(items) && items.length > 0) {
      subtotal_layanan = 0;
      await connection.query('DELETE FROM kunjungan_detail WHERE kunjungan_id = ?', [id]);

      for (const item of items) {
        const [srvRows] = await connection.query('SELECT id, nama_layanan, tarif FROM layanan WHERE id = ?', [item.layanan_id]);
        if (!srvRows.length) continue;
        const srv = srvRows[0];
        const qty = Number(item.qty) || 1;
        const tarif = item.tarif !== undefined ? Number(item.tarif) : Number(srv.tarif);
        const subtotal = tarif * qty;
        subtotal_layanan += subtotal;

        await connection.query(
          `INSERT INTO kunjungan_detail (kunjungan_id, layanan_id, nama_layanan, tarif, qty, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, srv.id, srv.nama_layanan, tarif, qty, subtotal]
        );
      }
    }

    const newTipe = tipe_layanan || currentVisit.tipe_layanan;
    if (newTipe === 'klinik') transportFee = 0;
    const total_biaya = subtotal_layanan + transportFee;

    const newPaymentStatus = status_pembayaran || currentVisit.status_pembayaran;
    let waktu_pembayaran = currentVisit.waktu_pembayaran;
    if (newPaymentStatus === 'lunas' && currentVisit.status_pembayaran !== 'lunas') {
      waktu_pembayaran = new Date();

      // Record to financial transaction if newly marked as lunas
      const [patientRows] = await connection.query('SELECT nama FROM pasien WHERE id = ?', [currentVisit.pasien_id]);
      const patientNama = patientRows.length ? patientRows[0].nama : '';
      const trxKode = `TRX-IN-${Date.now().toString(36).toUpperCase()}`;

      await connection.query(
        `INSERT INTO transaksi_keuangan (kode_transaksi, tanggal, tipe, kategori, jumlah, keterangan, pasien_id, pasien_nama, kunjungan_id, metode)
         VALUES (?, CURDATE(), 'masuk', ?, ?, ?, ?, ?, ?, ?)`,
        [
          trxKode,
          newTipe === 'homevisit' ? 'Homecare + Transport' : 'Biaya Layanan',
          total_biaya,
          `Pelunasan kunjungan ${currentVisit.kode_kunjungan} (${newTipe.toUpperCase()})`,
          currentVisit.pasien_id,
          patientNama,
          id,
          metode_pembayaran === 'qris' ? 'QRIS' : (metode_pembayaran === 'tunai' ? 'Tunai' : 'Transfer BSI')
        ]
      );
    }

    await connection.query(
      `UPDATE kunjungan SET 
        tipe_layanan = ?, jadwal_kunjungan = ?, alamat_homevisit = ?, jarak_km = ?,
        biaya_transport = ?, subtotal_layanan = ?, total_biaya = ?,
        status_kunjungan = ?, status_pembayaran = ?, metode_pembayaran = ?,
        waktu_pembayaran = ?, bidan_petugas = ?, catatan_kunjungan = ?,
        data_klinis = COALESCE(?, data_klinis)
       WHERE id = ?`,
      [
        newTipe,
        jadwal_kunjungan || currentVisit.jadwal_kunjungan,
        newTipe === 'homevisit' ? (alamat_homevisit !== undefined ? alamat_homevisit : currentVisit.alamat_homevisit) : null,
        newTipe === 'homevisit' ? (jarak_km !== undefined ? Number(jarak_km) : currentVisit.jarak_km) : 0,
        transportFee,
        subtotal_layanan,
        total_biaya,
        status_kunjungan || currentVisit.status_kunjungan,
        newPaymentStatus,
        metode_pembayaran || currentVisit.metode_pembayaran,
        waktu_pembayaran,
        bidan_petugas !== undefined ? bidan_petugas : currentVisit.bidan_petugas,
        catatan_kunjungan !== undefined ? catatan_kunjungan : currentVisit.catatan_kunjungan,
        data_klinis ? JSON.stringify(data_klinis) : null,
        id
      ]
    );

    await connection.commit();

    const [updated] = await pool.query(
      `SELECT k.*, p.nama as pasien_nama, p.hp_wa as pasien_wa, p.no_rm as pasien_no_rm
       FROM kunjungan k
       JOIN pasien p ON k.pasien_id = p.id
       WHERE k.id = ?`,
      [id]
    );
    const [updatedItems] = await pool.query('SELECT * FROM kunjungan_detail WHERE kunjungan_id = ?', [id]);

    res.json({
      success: true,
      message: 'Data kunjungan berhasil diperbarui',
      data: { ...updated[0], items: updatedItems }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error updating kunjungan:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui kunjungan' });
  } finally {
    connection.release();
  }
});

// PUT /api/kunjungan/:id/status-pembayaran - Quick Toggle Lunas / Belum Lunas
app.put('/api/kunjungan/:id/status-pembayaran', async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pembayaran } = req.body;

    const [visits] = await pool.query(
      `SELECT k.*, p.nama as pasien_nama 
       FROM kunjungan k 
       JOIN pasien p ON k.pasien_id = p.id 
       WHERE k.id = ?`,
      [id]
    );
    if (!visits.length) {
      return res.status(404).json({ success: false, message: 'Kunjungan tidak ditemukan' });
    }
    const visit = visits[0];

    const newStatus = status_pembayaran === 'lunas' ? 'lunas' : 'belum_lunas';
    const waktuBayar = newStatus === 'lunas' ? new Date() : null;

    await pool.query(
      'UPDATE kunjungan SET status_pembayaran = ?, waktu_pembayaran = ? WHERE id = ?',
      [newStatus, waktuBayar, id]
    );

    // If marked as lunas and no transaction recorded yet, record to financial table
    if (newStatus === 'lunas') {
      const [[{ exists_trx }]] = await pool.query(
        'SELECT COUNT(*) as exists_trx FROM transaksi_keuangan WHERE kunjungan_id = ?',
        [id]
      );

      if (exists_trx === 0) {
        const trxKode = `TRX-IN-${Date.now().toString(36).toUpperCase()}`;
        await pool.query(
          `INSERT INTO transaksi_keuangan (kode_transaksi, tanggal, tipe, kategori, jumlah, keterangan, pasien_id, pasien_nama, kunjungan_id, metode)
           VALUES (?, CURDATE(), 'masuk', ?, ?, ?, ?, ?, ?, ?)`,
          [
            trxKode,
            visit.tipe_layanan === 'homevisit' ? 'Homecare + Transport' : 'Biaya Layanan',
            visit.total_biaya,
            `Pembayaran lunas kunjungan ${visit.kode_kunjungan}`,
            visit.pasien_id,
            visit.pasien_nama,
            id,
            visit.metode_pembayaran === 'qris' ? 'QRIS' : (visit.metode_pembayaran === 'tunai' ? 'Tunai' : 'Transfer BSI')
          ]
        );
      }
    }

    res.json({ success: true, message: `Status pembayaran diubah menjadi ${newStatus === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}` });
  } catch (err) {
    console.error('Error changing payment status:', err);
    res.status(500).json({ success: false, message: 'Gagal mengubah status pembayaran' });
  }
});

// DELETE /api/kunjungan/:id - Delete Visit
app.delete('/api/kunjungan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [exists] = await pool.query('SELECT kode_kunjungan FROM kunjungan WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Kunjungan tidak ditemukan' });
    }

    await pool.query('DELETE FROM kunjungan WHERE id = ?', [id]);
    res.json({ success: true, message: `Kunjungan ${exists[0].kode_kunjungan} berhasil dihapus` });
  } catch (err) {
    console.error('Error deleting kunjungan:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus kunjungan' });
  }
});

// ===================================================================
// 5. TRANSAKSI KEUANGAN (FINANCIAL & CASHFLOW)
// ===================================================================

// GET /api/transaksi - List Financial Transactions
app.get('/api/transaksi', async (req, res) => {
  try {
    const {
      page = 1, limit = 10, search = '', tipe = '',
      kategori = '', bulan = '', sortBy = 'tanggal', sortOrder = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (search.trim()) {
      whereSql += ' AND (keterangan LIKE ? OR pasien_nama LIKE ? OR kode_transaksi LIKE ? OR kategori LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (tipe && tipe !== 'semua') {
      whereSql += ' AND tipe = ?';
      params.push(tipe);
    }

    if (kategori && kategori !== 'semua') {
      whereSql += ' AND kategori = ?';
      params.push(kategori);
    }

    if (bulan) {
      whereSql += " AND DATE_FORMAT(tanggal, '%Y-%m') = ?";
      params.push(bulan);
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM transaksi_keuangan ${whereSql}`, params);

    const allowedSort = ['id', 'tanggal', 'jumlah', 'tipe', 'kategori'];
    const sortCol = allowedSort.includes(sortBy) ? sortBy : 'tanggal';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [rows] = await pool.query(
      `SELECT * FROM transaksi_keuangan ${whereSql} ORDER BY ${sortCol} ${sortDir}, id DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    // Calculate sum for current query filter
    const [[{ total_filtered_masuk }]] = await pool.query(
      `SELECT COALESCE(SUM(jumlah), 0) as total_filtered_masuk FROM transaksi_keuangan ${whereSql} AND tipe = 'masuk'`,
      params
    );
    const [[{ total_filtered_keluar }]] = await pool.query(
      `SELECT COALESCE(SUM(jumlah), 0) as total_filtered_keluar FROM transaksi_keuangan ${whereSql} AND tipe = 'keluar'`,
      params
    );

    sendPaginatedResponse(res, rows, total, page, limit, {
      total_masuk: Number(total_filtered_masuk),
      total_keluar: Number(total_filtered_keluar),
      net_saldo: Number(total_filtered_masuk) - Number(total_filtered_keluar)
    });
  } catch (err) {
    console.error('Error fetching transaksi:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat transaksi keuangan' });
  }
});

// POST /api/transaksi - Add Manual Income or Expense
app.post('/api/transaksi', async (req, res) => {
  try {
    const { tanggal, tipe, kategori, jumlah, keterangan = '', pasien_id = null, pasien_nama = '', metode = 'Tunai' } = req.body;

    if (!tanggal || !tipe || !kategori || !jumlah) {
      return res.status(400).json({ success: false, message: 'Tanggal, tipe, kategori, dan nominal wajib diisi' });
    }

    const prefix = tipe === 'masuk' ? 'TRX-IN' : 'TRX-OUT';
    const kode_transaksi = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

    const [result] = await pool.query(
      `INSERT INTO transaksi_keuangan (kode_transaksi, tanggal, tipe, kategori, jumlah, keterangan, pasien_id, pasien_nama, metode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kode_transaksi,
        tanggal,
        tipe,
        kategori,
        Number(jumlah),
        keterangan,
        pasien_id || null,
        pasien_nama || null,
        metode
      ]
    );

    const [created] = await pool.query('SELECT * FROM transaksi_keuangan WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Transaksi berhasil dicatat', data: created[0] });
  } catch (err) {
    console.error('Error creating transaksi:', err);
    res.status(500).json({ success: false, message: 'Gagal mencatat transaksi keuangan' });
  }
});

// PUT /api/transaksi/:id - Update Transaction
app.put('/api/transaksi/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, tipe, kategori, jumlah, keterangan, pasien_nama, metode } = req.body;

    const [exists] = await pool.query('SELECT * FROM transaksi_keuangan WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    await pool.query(
      `UPDATE transaksi_keuangan SET 
        tanggal = COALESCE(?, tanggal),
        tipe = COALESCE(?, tipe),
        kategori = COALESCE(?, kategori),
        jumlah = COALESCE(?, jumlah),
        keterangan = COALESCE(?, keterangan),
        pasien_nama = COALESCE(?, pasien_nama),
        metode = COALESCE(?, metode)
       WHERE id = ?`,
      [
        tanggal || null,
        tipe || null,
        kategori || null,
        jumlah !== undefined ? Number(jumlah) : null,
        keterangan !== undefined ? keterangan : null,
        pasien_nama !== undefined ? pasien_nama : null,
        metode || null,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM transaksi_keuangan WHERE id = ?', [id]);
    res.json({ success: true, message: 'Transaksi berhasil diperbarui', data: updated[0] });
  } catch (err) {
    console.error('Error updating transaksi:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui transaksi' });
  }
});

// DELETE /api/transaksi/:id - Delete Transaction
app.delete('/api/transaksi/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [exists] = await pool.query('SELECT id, kode_transaksi FROM transaksi_keuangan WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    await pool.query('DELETE FROM transaksi_keuangan WHERE id = ?', [id]);
    res.json({ success: true, message: `Transaksi ${exists[0].kode_transaksi} berhasil dihapus` });
  } catch (err) {
    console.error('Error deleting transaksi:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus transaksi' });
  }
});

// ===================================================================
// 6. WHATSAPP LOGS & MESSAGES
// ===================================================================

// GET /api/wa-log - List WhatsApp message history
app.get('/api/wa-log', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (search.trim()) {
      whereSql += ' AND (pasien_nama LIKE ? OR no_wa LIKE ? OR pesan LIKE ? OR jenis_pesan LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM wa_log ${whereSql}`, params);

    const [rows] = await pool.query(
      `SELECT * FROM wa_log ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    sendPaginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    console.error('Error fetching wa-log:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat riwayat pesan WhatsApp' });
  }
});

// POST /api/wa-log - Save logged message
app.post('/api/wa-log', async (req, res) => {
  try {
    const { pasien_id, pasien_nama, no_wa, jenis_pesan, pesan, status = 'dibuka_ke_wa' } = req.body;

    if (!pasien_nama || !no_wa || !pesan) {
      return res.status(400).json({ success: false, message: 'Data pesan WhatsApp tidak lengkap' });
    }

    const [result] = await pool.query(
      `INSERT INTO wa_log (pasien_id, pasien_nama, no_wa, jenis_pesan, pesan, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [pasien_id || null, pasien_nama, no_wa, jenis_pesan || 'custom', pesan, status]
    );

    res.status(201).json({ success: true, message: 'Log pesan WhatsApp tersimpan', id: result.insertId });
  } catch (err) {
    console.error('Error saving wa-log:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan log WhatsApp' });
  }
});

// ===================================================================
// 7. FILE UPLOAD (FOTO PASIEN / QRIS)
// ===================================================================
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'File berhasil diunggah',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengunggah file' });
  }
});

// ===================================================================
// 8. AUTHENTICATION & USER MANAGEMENT
// ===================================================================

// POST /api/auth/login - Login user with username & password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) LIMIT 1',
      [username.trim(), username.trim()]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Akun Anda dinonaktifkan. Silakan hubungi admin / Bdn. Norhalimah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Clean user object
    const { password: _, ...userData } = user;

    res.json({
      success: true,
      message: `Selamat datang kembali, ${user.nama}!`,
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Gagal melakukan login' });
  }
});

// GET /api/auth/profile - Get current logged-in profile
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nama, email, role, no_hp, foto_url, is_active, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data profil' });
  }
});

// PUT /api/auth/profile - Update own profile & password
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { nama, email, no_hp, current_password, new_password, foto_url } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }
    const user = rows[0];

    let hashedPassword = user.password;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'Password saat ini wajib diisi untuk mengganti password baru' });
      }
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Password saat ini tidak sesuai' });
      }
      hashedPassword = await bcrypt.hash(new_password, 10);
    }

    await pool.query(
      `UPDATE users SET 
        nama = COALESCE(?, nama),
        email = COALESCE(?, email),
        no_hp = COALESCE(?, no_hp),
        foto_url = COALESCE(?, foto_url),
        password = ?
       WHERE id = ?`,
      [
        nama ? nama.trim() : null,
        email ? email.trim() : null,
        no_hp ? no_hp.trim() : null,
        foto_url || null,
        hashedPassword,
        req.user.id
      ]
    );

    const [updated] = await pool.query(
      'SELECT id, username, nama, email, role, no_hp, foto_url, is_active FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: 'Profil berhasil diperbarui', user: updated[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil' });
  }
});

// GET /api/users - List Users with Search, Role Filter & Pagination
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', is_active = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (search.trim()) {
      whereSql += ' AND (nama LIKE ? OR username LIKE ? OR email LIKE ? OR no_hp LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (role && role !== 'semua') {
      whereSql += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== '') {
      whereSql += ' AND is_active = ?';
      params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users ${whereSql}`, params);

    const allowedSort = ['id', 'username', 'nama', 'role', 'created_at'];
    const sortCol = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [rows] = await pool.query(
      `SELECT id, username, nama, email, role, no_hp, foto_url, is_active, created_at, updated_at
       FROM users ${whereSql}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    sendPaginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat data pengguna' });
  }
});

// GET /api/users/:id - Detail User
app.get('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, username, nama, email, role, no_hp, foto_url, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching user detail:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat detail pengguna' });
  }
});

// POST /api/users - Create User
app.post('/api/users', verifyToken, async (req, res) => {
  try {
    const { username, nama, email, password, role = 'bidan', no_hp, foto_url } = req.body;

    if (!username || !nama || !password) {
      return res.status(400).json({ success: false, message: 'Username, nama, dan password wajib diisi' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)',
      [username.trim(), email ? email.trim() : '']
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan oleh pengguna lain' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (username, nama, email, password, role, no_hp, foto_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        username.trim().toLowerCase(),
        nama.trim(),
        email ? email.trim() : null,
        hashedPassword,
        role || 'bidan',
        no_hp ? no_hp.trim() : null,
        foto_url || null
      ]
    );

    const [newUser] = await pool.query(
      'SELECT id, username, nama, email, role, no_hp, foto_url, is_active, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: `Pengguna ${newUser[0].nama} berhasil ditambahkan`,
      data: newUser[0]
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pengguna baru' });
  }
});

// PUT /api/users/:id - Update User
app.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, password, role, no_hp, foto_url, is_active } = req.body;

    const [exists] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }
    const current = exists[0];

    let hashedPassword = current.password;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    await pool.query(
      `UPDATE users SET 
        nama = COALESCE(?, nama),
        email = COALESCE(?, email),
        password = ?,
        role = COALESCE(?, role),
        no_hp = COALESCE(?, no_hp),
        foto_url = COALESCE(?, foto_url),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        nama ? nama.trim() : null,
        email !== undefined ? (email ? email.trim() : null) : null,
        hashedPassword,
        role || null,
        no_hp !== undefined ? (no_hp ? no_hp.trim() : null) : null,
        foto_url !== undefined ? foto_url : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      ]
    );

    const [updated] = await pool.query(
      'SELECT id, username, nama, email, role, no_hp, foto_url, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui',
      data: updated[0]
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengguna' });
  }
});

// DELETE /api/users/:id - Delete User
app.delete('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === 1 || Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun administrator utama atau akun Anda sendiri' });
    }

    const [exists] = await pool.query('SELECT id, nama FROM users WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: `Pengguna ${exists[0].nama} berhasil dihapus` });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus pengguna' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'PMB Rumah Maryam API' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} tidak ditemukan` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 PMB Rumah Maryam Server running on port ${PORT}`);
  console.log(`📁 Uploads available at http://localhost:${PORT}/uploads`);
});
