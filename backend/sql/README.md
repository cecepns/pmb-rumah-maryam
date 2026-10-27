# Database & Migration - PMB Rumah Maryam

Panduan struktur dan eksekusi file SQL untuk database **PMB Rumah Maryam**.

---

## 📁 Daftar File SQL

| File / Folder | Keterangan |
|---|---|
| [`database.sql`](file:///Users/cecep/Desktop/SP%20-%20New/pmb-rumah-maryam/backend/sql/database.sql) | **Skema Lengkap (Fresh Install)**: Dijalankan jika melakukan setup database baru dari nol. Berisi seluruh tabel, relasi, trigger, dan sample data terbaru. |
| [`migration.sql`](file:///Users/cecep/Desktop/SP%20-%20New/pmb-rumah-maryam/backend/sql/migration.sql) | **File Migrasi Kumulatif**: Script migrasi aman (*idempotent*) untuk database yang sudah berjalan (production). Aman dijalankan berulang kali tanpa merusak data lama. |
| [`migrations/`](file:///Users/cecep/Desktop/SP%20-%20New/pmb-rumah-maryam/backend/sql/migrations) | **Folder Riwayat Migrasi**: Berisi file migrasi bertanggal untuk setiap revisi fitur. |
| ↳ [`20261027_revisi_hasil_pemeriksaan_dan_bidan.sql`](file:///Users/cecep/Desktop/SP%20-%20New/pmb-rumah-maryam/backend/sql/migrations/20261027_revisi_hasil_pemeriksaan_dan_bidan.sql) | Migrasi revisi 27 Oktober 2026: Tambah kolom `hasil_pemeriksaan`, update nama `Bdn. Norhalimah, S.Keb`, dan penambahan akun Bidan Pelaksana. |

---

## 🚀 Cara Menjalankan Migrasi

### 1. Otomatis saat Backend Server Berjalan
Backend (`server.js`) memiliki fitur **auto-check schema** pada saat startup (`ensureDatabaseSchema()`). Jika kolom `hasil_pemeriksaan` atau tabel `users` belum ada, server akan otomatis membuatkannya saat pertama kali running.

### 2. Manual via Command Line (Terminal / SSH VPS)
Jalankan perintah berikut:
```bash
mysql -u [db_user] -p [nama_database] < backend/sql/migration.sql
```
Contoh jika di localhost:
```bash
mysql -u root -p pmb_rumah_maryam < backend/sql/migration.sql
```

### 3. Manual via phpMyAdmin / cPanel
1. Buka **phpMyAdmin**.
2. Pilih database PMB Rumah Maryam di sidebar kiri.
3. Klik tab **Import** (atau tab **SQL**).
4. Pilih file [`backend/sql/migration.sql`](file:///Users/cecep/Desktop/SP%20-%20New/pmb-rumah-maryam/backend/sql/migration.sql) atau copy-paste isinya ke kotak SQL query.
5. Klik tombol **Go / Kirim**.

---

## 📝 Catatan Perubahan Database (Changelog 27 Oktober 2026)

1. **Tabel `kunjungan`**:
   - Menambahkan kolom `hasil_pemeriksaan TEXT DEFAULT NULL` setelah `catatan_kunjungan`.
   - Mengubah default value `bidan_petugas` menjadi `'Bdn. Norhalimah, S.Keb'`.
   - Mengupdate rekam kunjungan lama yang masih bergelar `'Bdn. Norhalimah, S.Tr.Keb'`.

2. **Tabel `klinik_config`**:
   - Mengubah kolom `bidan_nama` menjadi default `'Bdn. Norhalimah, S.Keb'`.
   - Mengupdate row pengaturan id 1.

3. **Tabel `users`**:
   - Menjamin tabel `users` tersedia dengan struktur `username`, `nama`, `email`, `password`, `role` (admin/bidan), `no_hp`, `foto_url`, `is_active`.
   - Memasukkan data awal akun:
     - Admin: `admin` (`Bdn. Norhalimah, S.Keb`)
     - Bidan 1: `megananda` (`Megananda, Am.Keb`)
     - Bidan 2: `rizqi` (`Rizqi Amaliyah Putri, Am.Keb`)
