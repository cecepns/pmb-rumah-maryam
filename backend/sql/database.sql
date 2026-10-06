-- ===================================================================
-- DATABASE SCHEMA & INITIAL DATA: PMB RUMAH MARYAM
-- Praktik Mandiri Bidan & Homecare Keluarga
-- Collation: utf8mb4_unicode_ci (Universal support: MySQL 5.7+, MySQL 8+, MariaDB)
-- ===================================================================

CREATE DATABASE IF NOT EXISTS `pmb_rumah_maryam` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `pmb_rumah_maryam`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------
-- 1. Table structure for table `klinik_config`
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `klinik_config`;
CREATE TABLE `klinik_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama_praktik` VARCHAR(150) NOT NULL DEFAULT 'PMB Rumah Maryam',
  `tagline` VARCHAR(150) DEFAULT 'Praktik Mandiri Bidan & Homecare Spesialis Ibu & Anak',
  `bidan_nama` VARCHAR(150) DEFAULT 'Bdn. Norhalimah, S.Tr.Keb',
  `sipb` VARCHAR(100) DEFAULT 'SIPB. 503/446/PMB/2024',
  `alamat` TEXT,
  `no_wa` VARCHAR(30) DEFAULT '6282350313030',
  `instagram` VARCHAR(100) DEFAULT '@rumahmaryam.id',
  `bank_nama` VARCHAR(50) DEFAULT 'BSI (Bank Syariah Indonesia)',
  `bank_rekening` VARCHAR(50) DEFAULT '7124826197',
  `bank_atas_nama` VARCHAR(100) DEFAULT 'Norhalimah',
  `qris_image_url` VARCHAR(255) DEFAULT '/uploads/qris.jpeg',
  `default_transport_fee` DECIMAL(12,2) DEFAULT '25000.00',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `klinik_config` (`id`, `nama_praktik`, `tagline`, `bidan_nama`, `sipb`, `alamat`, `no_wa`, `instagram`, `bank_nama`, `bank_rekening`, `bank_atas_nama`, `qris_image_url`, `default_transport_fee`) VALUES
(1, 'PMB Rumah Maryam', 'Praktik Mandiri Bidan & Homecare Spesialis Ibu & Anak', 'Bdn. Norhalimah, S.Tr.Keb', 'SIPB. 503/446/PMB/2024', 'Jl. Manunggal No. 12, Banjarmasin', '6282350313030', '@rumahmaryam.id', 'BSI (Bank Syariah Indonesia)', '7124826197', 'Norhalimah', '/uploads/qris.jpeg', 25000.00);

-- -------------------------------------------------------------------
-- 2. Table structure for table `layanan`
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `layanan`;
CREATE TABLE `layanan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kode` VARCHAR(50) NOT NULL UNIQUE,
  `nama_layanan` VARCHAR(150) NOT NULL,
  `kategori` ENUM('ibu', 'bayi', 'homecare', 'newborn', 'kb', 'imunisasi', 'umum') NOT NULL DEFAULT 'ibu',
  `tarif` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `is_homecare_available` TINYINT(1) DEFAULT '1',
  `deskripsi` TEXT,
  `is_active` TINYINT(1) DEFAULT '1',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `layanan` (`id`, `kode`, `nama_layanan`, `kategori`, `tarif`, `is_homecare_available`, `deskripsi`, `is_active`) VALUES
(1, 'SRV-ANC', 'ANC (Ante Natal Care / Pemeriksaan Kehamilan)', 'ibu', 100000.00, 1, 'Pemeriksaan fisik ibu hamil, palpasi Leopold, USG dasar, cek tensi, timbang badan & konseling gizi', 1),
(2, 'SRV-YOGA', 'Prenatal Yoga Privat', 'ibu', 75000.00, 1, 'Senam dan yoga relaksasi kehamilan untuk mempersiapkan panggul dan napas persalinan nyaman', 1),
(3, 'SRV-SALIN', 'Paket Persalinan Nyaman PMB', 'ibu', 3000000.00, 0, 'Pertolongan persalinan normal, perawatan ibu & bayi 1x24 jam, obat standar persalinan', 1),
(4, 'SRV-NIFAS', 'Kunjungan Nifas (KF 1 / KF 2 / KF 3)', 'ibu', 50000.00, 1, 'Pemeriksaan pemulihan jalan lahir, lochea, kontraksi rahim, tekanan darah ibu pasca melahirkan', 1),
(5, 'SRV-LAKTASI', 'Konsultasi & Manajemen Laktasi', 'ibu', 100000.00, 1, 'Evaluasi pelekatan bayi, pemecahan masalah puting lecet/payudara bengkak, manajemen ASI perah', 1),
(6, 'SRV-KB-SUNTIK1', 'KB Suntik 1 Bulan', 'kb', 100000.00, 1, 'Suntik hormon kombinasi pencegah kehamilan siklus bulanan', 1),
(7, 'SRV-KB-SUNTIK3', 'KB Suntik 3 Bulan (Aman Menyusui)', 'kb', 100000.00, 1, 'Suntik progestin cocok untuk ibu menyusui, tidak mengganggu produksi ASI', 1),
(8, 'SRV-KB-PIL', 'KB Pil', 'kb', 45000.00, 1, 'Pil kontrasepsi oral reguler atau khusus menyusui', 1),
(9, 'SRV-KB-IUD', 'Pemasangan IUD (Spiral)', 'kb', 450000.00, 0, 'Pemasangan alat kontrasepsi dalam rahim jangka panjang efektif 5-8 tahun', 1),
(10, 'SRV-KB-IMPLAN', 'Pemasangan Implan / Susuk KB', 'kb', 400000.00, 0, 'Pemasangan susuk kontrasepsi bawah kulit lengan', 1),
(11, 'SRV-IMUN-HB0', 'Imunisasi HB-0 (Hepatitis B Lahir)', 'imunisasi', 85000.00, 1, 'Vaksin pencegah hepatitis B untuk bayi baru lahir 0-7 hari', 1),
(12, 'SRV-IMUN-BCG', 'Imunisasi BCG & Polio 1', 'imunisasi', 150000.00, 1, 'Vaksin pencegah tuberkulosis (TBC) dan polio oral', 1),
(13, 'SRV-IMUN-DPT', 'Imunisasi DPT-HB-Hib (Pentavalen)', 'imunisasi', 180000.00, 1, 'Vaksin pencegah difteri, pertusis, tetanus, hepatitis B, dan pneumonia/meningitis Hib', 1),
(14, 'SRV-IMUN-CAMPAK', 'Imunisasi Campak / MR', 'imunisasi', 170000.00, 1, 'Vaksin pencegah campak dan rubella pada bayi usia 9 bulan', 1),
(15, 'SRV-BABY-SPA', 'Baby Spa & Hydrotherapy', 'bayi', 100000.00, 0, 'Berenang air hangat, baby massage relaksasi dan stimulasi sensorik motorik bayi', 1),
(16, 'SRV-MPASI', 'Konsultasi MPASI Sehat Gizi Seimbang', 'bayi', 75000.00, 1, 'Panduan menu tekstur makanan pendamping ASI, pencegahan stunting & GTM', 1),
(17, 'SRV-PJ-BAYI', 'Pijat Bayi (Baby Massage Homecare)', 'homecare', 100000.00, 1, 'Pijat relaksasi stimulasi tumbuh kembang bayi, atasi kolik, kembung & tidur nyenyak di rumah', 1),
(18, 'SRV-PJ-HAMIL', 'Pijat Hamil (Pregnancy Massage Homecare)', 'homecare', 120000.00, 1, 'Pijat relaksasi pegal punggung, pinggang dan kaki bengkak pada ibu hamil oleh bidan tersertifikasi', 1),
(19, 'SRV-PJ-LAKTASI', 'Pijat Laktasi & Oksitosin Homecare', 'homecare', 100000.00, 1, 'Pijat stimulasi hormon oksitosin dan perlancar ASI, atasi bendungan ASI di rumah', 1),
(20, 'SRV-NEWBORN', 'Perawatan Bayi Baru Lahir (Newborn Care)', 'newborn', 200000.00, 1, 'Memandikan bayi baru lahir, perawatan tali pusat steril, jemur & edukasi orang tua baru', 1),
(21, 'SRV-MOM-CARE', 'Perawatan Ibu Pasca Melahirkan (Mom Treatment)', 'newborn', 200000.00, 1, 'Bengkung modern, boreh herbal, lulur nifas & pijat pemulihan stamina ibu nifas', 1),
(22, 'SRV-UMUM', 'Pemeriksaan Berobat Umum', 'umum', 50000.00, 1, 'Konsultasi keluhan umum ringan, pemeriksaan vital sign dan resep edukasi kesehatan', 1);

-- -------------------------------------------------------------------
-- 3. Table structure for table `pasien`
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `pasien`;
CREATE TABLE `pasien` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `no_rm` VARCHAR(50) NOT NULL UNIQUE,
  `nama` VARCHAR(150) NOT NULL,
  `nik` VARCHAR(30) DEFAULT NULL,
  `tanggal_lahir` DATE DEFAULT NULL,
  `hp_wa` VARCHAR(30) NOT NULL,
  `alamat` TEXT,
  `nama_suami` VARCHAR(150) DEFAULT NULL,
  `golongan_darah` VARCHAR(5) DEFAULT NULL,
  `alergi` VARCHAR(255) DEFAULT NULL,
  `catatan_khusus` TEXT,
  `foto_url` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pasien` (`id`, `no_rm`, `nama`, `nik`, `tanggal_lahir`, `hp_wa`, `alamat`, `nama_suami`, `golongan_darah`, `alergi`, `catatan_khusus`) VALUES
(1, 'RM-2026-0001', 'Bunda Siti Nurhaliza', '6371015609950001', '1995-09-16', '081234567890', 'Komp. Pondok Sejahtera Blok B No. 4, Banjarmasin', 'Bpk. Ahmad Fauzi', 'O', 'Tidak ada', 'Ibu nifas hari ke-7, ASI sangat lancar, butuh pijat relaksasi'),
(2, 'RM-2026-0002', 'Bunda Rina Marlina', '6371024508980002', '1998-08-05', '082155667788', 'Jl. Veteran No. 45 RT 02, Banjarmasin', 'Bpk. Hendra Saputra', 'B', 'Amoksisilin', 'Kehamilan trimester 3 (34 minggu), rajin yoga hamil'),
(3, 'RM-2026-0003', 'Bunda Dewi Kartika', '6371036012960003', '1996-12-20', '085244332211', 'Jl. Sultan Adam Komp. Kadar Permai No. 18', 'Bpk. Dimas Pratama', 'A', 'Tidak ada', 'Akseptor KB Suntik 3 Bulan rutin'),
(4, 'RM-2026-0004', 'Bunda Anisa Rahmawati', '6371047101990004', '1999-01-31', '087811223344', 'Jl. Cempaka Putih No. 8', 'Bpk. Rizky Aditya', 'AB', 'Tidak ada', 'Bayi usia 2 bulan, jadwal imunisasi DPT-HB-Hib 1'),
(5, 'RM-2026-0005', 'Bunda Fitriani Az-Zahra', '6371055504970005', '1997-04-15', '081399887766', 'Jl. Pramuka Komp. Melati Indah No. 12', 'Bpk. Fajar Ramadhan', 'O', 'Udang / Seafood', 'Memerlukan Homevisit Newborn Care & Pijat Bayi');

-- -------------------------------------------------------------------
-- 4. Table structure for table `kunjungan`
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `kunjungan`;
CREATE TABLE `kunjungan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kode_kunjungan` VARCHAR(50) NOT NULL UNIQUE,
  `pasien_id` INT NOT NULL,
  `tipe_layanan` ENUM('klinik', 'homevisit') NOT NULL DEFAULT 'klinik',
  `jadwal_kunjungan` DATETIME NOT NULL,
  `alamat_homevisit` TEXT,
  `jarak_km` DECIMAL(5,1) DEFAULT '0.0',
  `biaya_transport` DECIMAL(12,2) DEFAULT '0.00',
  `subtotal_layanan` DECIMAL(12,2) DEFAULT '0.00',
  `total_biaya` DECIMAL(12,2) DEFAULT '0.00',
  `status_kunjungan` ENUM('terjadwal', 'dalam_proses', 'selesai', 'batal') NOT NULL DEFAULT 'terjadwal',
  `status_pembayaran` ENUM('belum_lunas', 'lunas') NOT NULL DEFAULT 'belum_lunas',
  `metode_pembayaran` ENUM('transfer_bsi', 'qris', 'tunai') DEFAULT 'transfer_bsi',
  `waktu_pembayaran` DATETIME DEFAULT NULL,
  `bidan_petugas` VARCHAR(150) DEFAULT NULL,
  `catatan_kunjungan` TEXT,
  `data_klinis` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pasien` (`pasien_id`),
  KEY `idx_jadwal` (`jadwal_kunjungan`),
  KEY `idx_status` (`status_kunjungan`),
  KEY `idx_pembayaran` (`status_pembayaran`),
  CONSTRAINT `fk_kunjungan_pasien` FOREIGN KEY (`pasien_id`) REFERENCES `pasien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kunjungan` (`id`, `kode_kunjungan`, `pasien_id`, `tipe_layanan`, `jadwal_kunjungan`, `alamat_homevisit`, `jarak_km`, `biaya_transport`, `subtotal_layanan`, `total_biaya`, `status_kunjungan`, `status_pembayaran`, `metode_pembayaran`, `waktu_pembayaran`, `bidan_petugas`, `catatan_kunjungan`, `data_klinis`) VALUES
(1, 'REG-202610-001', 1, 'homevisit', '2026-10-04 15:00:32', 'Komp. Pondok Sejahtera Blok B No. 4, Banjarmasin', 4.5, 25000.00, 200000.00, 225000.00, 'selesai', 'lunas', 'qris', '2026-10-04 15:30:00', 'Bdn. Norhalimah, S.Tr.Keb', 'Layanan Homevisit Pijat Bayi dan Pijat Laktasi berjalan lancar', '{\"kondisi_pemulihan\": \"Involusi rahim baik, ASI lancar, bayi sehat\", \"kunjungan_nifas_ke\": \"1\"}'),
(2, 'REG-202610-002', 2, 'klinik', '2026-10-05 15:00:32', NULL, 0.0, 0.00, 175000.00, 175000.00, 'selesai', 'lunas', 'transfer_bsi', '2026-10-05 15:20:00', 'Bdn. Norhalimah, S.Tr.Keb', 'ANC rutin dan Prenatal Yoga Privat', '{\"hpl\": \"2026-11-17\", \"hpht\": \"2026-02-10\", \"kondisi_ibu\": \"Baik\", \"usia_kehamilan\": 34, \"hasil_pemeriksaan\": \"Tensi 110/75, DJJ 142x/mnt reguler, kepala sudah masuk PAP\"}'),
(3, 'REG-202610-003', 3, 'klinik', '2026-10-06 15:00:32', NULL, 0.0, 0.00, 100000.00, 100000.00, 'terjadwal', 'belum_lunas', 'transfer_bsi', NULL, 'Bdn. Norhalimah, S.Tr.Keb', 'Jadwal ulang suntik KB 3 bulan', '{\"jenis_kb\": \"Suntik 3 Bulan\", \"jadwal_ulang\": \"2026-10-06\", \"tanggal_mulai\": \"2026-07-06\"}'),
(4, 'REG-202610-004', 5, 'homevisit', '2026-10-07 15:00:32', 'Jl. Pramuka Komp. Melati Indah No. 12', 6.0, 30000.00, 300000.00, 330000.00, 'terjadwal', 'belum_lunas', 'transfer_bsi', NULL, 'Bdn. Norhalimah, S.Tr.Keb', 'Homecare Newborn Care + Pijat Bayi', '{\"terapis\": \"Bdn. Norhalimah, S.Tr.Keb\", \"usia_bayi_hari\": 10}');

-- -------------------------------------------------------------------
-- 5. Table structure for table `kunjungan_detail`
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `kunjungan_detail`;
CREATE TABLE `kunjungan_detail` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kunjungan_id` INT NOT NULL,
  `layanan_id` INT NOT NULL,
  `nama_layanan` VARCHAR(150) NOT NULL,
  `tarif` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `qty` INT NOT NULL DEFAULT '1',
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kunjungan` (`kunjungan_id`),
  KEY `idx_layanan` (`layanan_id`),
  CONSTRAINT `fk_detail_kunjungan` FOREIGN KEY (`kunjungan_id`) REFERENCES `kunjungan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detail_layanan` FOREIGN KEY (`layanan_id`) REFERENCES `layanan` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kunjungan_detail` (`id`, `kunjungan_id`, `layanan_id`, `nama_layanan`, `tarif`, `qty`, `subtotal`) VALUES
(1, 1, 17, 'Pijat Bayi (Baby Massage Homecare)', 100000.00, 1, 100000.00),
(2, 1, 19, 'Pijat Laktasi & Oksitosin Homecare', 100000.00, 1, 100000.00),
(3, 2, 1, 'ANC (Ante Natal Care / Pemeriksaan Kehamilan)', 100000.00, 1, 100000.00),
(4, 2, 2, 'Prenatal Yoga Privat', 75000.00, 1, 75000.00),
(5, 3, 7, 'KB Suntik 3 Bulan (Aman Menyusui)', 100000.00, 1, 100000.00),
(6, 4, 17, 'Pijat Bayi (Baby Massage Homecare)', 100000.00, 1, 100000.00),
(7, 4, 20, 'Perawatan Bayi Baru Lahir (Newborn Care)', 200000.00, 1, 200000.00);

-- -------------------------------------------------------------------
-- 6. Table structure for table `transaksi_keuangan`
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `transaksi_keuangan`;
CREATE TABLE `transaksi_keuangan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kode_transaksi` VARCHAR(50) NOT NULL UNIQUE,
  `tanggal` DATE NOT NULL,
  `tipe` ENUM('masuk', 'keluar') NOT NULL,
  `kategori` VARCHAR(100) NOT NULL,
  `jumlah` DECIMAL(12,2) NOT NULL,
  `keterangan` TEXT,
  `pasien_id` INT DEFAULT NULL,
  `pasien_nama` VARCHAR(150) DEFAULT NULL,
  `kunjungan_id` INT DEFAULT NULL,
  `metode` VARCHAR(50) DEFAULT 'Transfer BSI',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_tipe` (`tipe`),
  KEY `idx_kategori` (`kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `transaksi_keuangan` (`id`, `kode_transaksi`, `tanggal`, `tipe`, `kategori`, `jumlah`, `keterangan`, `pasien_id`, `pasien_nama`, `kunjungan_id`, `metode`) VALUES
(1, 'TRX-IN-001', '2026-10-04', 'masuk', 'Homecare + Transport', 225000.00, 'Pembayaran Homevisit Pijat Bayi & Laktasi via QRIS', 1, 'Bunda Siti Nurhaliza', 1, 'QRIS'),
(2, 'TRX-IN-002', '2026-10-05', 'masuk', 'Biaya Layanan', 175000.00, 'Pembayaran ANC & Yoga Hamil via BSI', 2, 'Bunda Rina Marlina', 2, 'Transfer BSI'),
(3, 'TRX-OUT-001', '2026-10-03', 'keluar', 'Pembelian BHP', 185000.00, 'Pembelian kapas alkohol, sarung tangan steril & minyak baby oil herbal', NULL, NULL, NULL, 'Tunai'),
(4, 'TRX-OUT-002', '2026-10-04', 'keluar', 'Sampah Medis', 75000.00, 'Biaya retribusi pengangkutan limbah medis & safety box', NULL, NULL, NULL, 'Transfer BSI'),
(5, 'TRX-OUT-003', '2026-10-05', 'keluar', 'Listrik & Kuota', 250000.00, 'Token listrik PMB & kuota WhatsApp admin operasional', NULL, NULL, NULL, 'Transfer BSI');

-- -------------------------------------------------------------------
-- 7. Table structure for table `wa_log`
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `wa_log`;
CREATE TABLE `wa_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `pasien_id` INT DEFAULT NULL,
  `pasien_nama` VARCHAR(150) NOT NULL,
  `no_wa` VARCHAR(30) NOT NULL,
  `jenis_pesan` VARCHAR(50) NOT NULL,
  `pesan` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'dibuka_ke_wa',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wa_pasien` (`pasien_id`),
  KEY `idx_wa_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `wa_log` (`id`, `pasien_id`, `pasien_nama`, `no_wa`, `jenis_pesan`, `pesan`, `status`) VALUES
(1, 1, 'Bunda Siti Nurhaliza', '081234567890', 'invoice_homevisit', 'Trimakasih Bunda Siti Nurhaliza sudah reservasi layanan Homevisite dari @rumahmaryam.id\n\nBerikut Invoice layanan homevisitenya\nHari /tgl : Sabtu, 04 Oktober 2026\n\nPijat Bayi : Rp. 100.000\nPijat Laktasi : Rp. 100.000\nBiaya Transport : Rp. 25.000\n\nTotal : Rp. 225.000\n\nPembayaran bisa trf via Qris (tanpa biaya admin) atau transfer ke rekening berikut :\n\nBSI 7124826197\nAtas nama Norhalimah\n\nTrimakasih😊🙏', 'dibuka_ke_wa');

SET FOREIGN_KEY_CHECKS = 1;
