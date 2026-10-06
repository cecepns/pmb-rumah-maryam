-- MySQL dump 10.13  Distrib 26.7.0, for macos26.6 (arm64)
--
-- Host: localhost    Database: pmb_rumah_maryam
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

CREATE DATABASE IF NOT EXISTS `pmb_rumah_maryam` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pmb_rumah_maryam`;


--
-- Table structure for table `klinik_config`
--

DROP TABLE IF EXISTS `klinik_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `klinik_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_praktik` varchar(150) NOT NULL DEFAULT 'PMB Rumah Maryam',
  `tagline` varchar(150) DEFAULT 'Praktik Mandiri Bidan & Homecare Spesialis Ibu & Anak',
  `bidan_nama` varchar(150) DEFAULT 'Bdn. Norhalimah, S.Tr.Keb',
  `sipb` varchar(100) DEFAULT 'SIPB. 503/446/PMB/2024',
  `alamat` text,
  `no_wa` varchar(30) DEFAULT '6282350313030',
  `instagram` varchar(100) DEFAULT '@rumahmaryam.id',
  `bank_nama` varchar(50) DEFAULT 'BSI (Bank Syariah Indonesia)',
  `bank_rekening` varchar(50) DEFAULT '7124826197',
  `bank_atas_nama` varchar(100) DEFAULT 'Norhalimah',
  `qris_image_url` varchar(255) DEFAULT '/uploads/qris.jpeg',
  `default_transport_fee` decimal(12,2) DEFAULT '25000.00',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `klinik_config`
--

LOCK TABLES `klinik_config` WRITE;
/*!40000 ALTER TABLE `klinik_config` DISABLE KEYS */;
INSERT INTO `klinik_config` VALUES (1,'PMB Rumah Maryam','Praktik Mandiri Bidan & Homecare Spesialis Ibu & Anak','Bdn. Norhalimah, S.Tr.Keb','SIPB. 503/446/PMB/2024','Jl. Manunggal No. 12, Banjarmasin','6282350313030','@rumahmaryam.id','BSI (Bank Syariah Indonesia)','7124826197','Norhalimah','/uploads/qris.jpeg',25000.00,'2026-10-06 15:00:32');
/*!40000 ALTER TABLE `klinik_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kunjungan`
--

DROP TABLE IF EXISTS `kunjungan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kunjungan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode_kunjungan` varchar(50) NOT NULL,
  `pasien_id` int NOT NULL,
  `tipe_layanan` enum('klinik','homevisit') NOT NULL DEFAULT 'klinik',
  `jadwal_kunjungan` datetime NOT NULL,
  `alamat_homevisit` text,
  `jarak_km` decimal(5,1) DEFAULT '0.0',
  `biaya_transport` decimal(12,2) DEFAULT '0.00',
  `subtotal_layanan` decimal(12,2) DEFAULT '0.00',
  `total_biaya` decimal(12,2) DEFAULT '0.00',
  `status_kunjungan` enum('terjadwal','dalam_proses','selesai','batal') NOT NULL DEFAULT 'terjadwal',
  `status_pembayaran` enum('belum_lunas','lunas') NOT NULL DEFAULT 'belum_lunas',
  `metode_pembayaran` enum('transfer_bsi','qris','tunai') DEFAULT 'transfer_bsi',
  `waktu_pembayaran` datetime DEFAULT NULL,
  `bidan_petugas` varchar(150) DEFAULT NULL,
  `catatan_kunjungan` text,
  `data_klinis` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_kunjungan` (`kode_kunjungan`),
  KEY `idx_pasien` (`pasien_id`),
  KEY `idx_jadwal` (`jadwal_kunjungan`),
  KEY `idx_status` (`status_kunjungan`),
  KEY `idx_pembayaran` (`status_pembayaran`),
  CONSTRAINT `fk_kunjungan_pasien` FOREIGN KEY (`pasien_id`) REFERENCES `pasien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kunjungan`
--

LOCK TABLES `kunjungan` WRITE;
/*!40000 ALTER TABLE `kunjungan` DISABLE KEYS */;
INSERT INTO `kunjungan` VALUES (1,'REG-202610-001',1,'homevisit','2026-10-04 15:00:32','Komp. Pondok Sejahtera Blok B No. 4, Banjarmasin',4.5,25000.00,200000.00,225000.00,'selesai','lunas','qris',NULL,'Bdn. Norhalimah, S.Tr.Keb','Layanan Homevisit Pijat Bayi dan Pijat Laktasi berjalan lancar','{\"kondisi_pemulihan\": \"Involusi rahim baik, ASI lancar, bayi sehat\", \"kunjungan_nifas_ke\": \"1\"}','2026-10-06 15:00:32','2026-10-06 15:00:32'),(2,'REG-202610-002',2,'klinik','2026-10-05 15:00:32',NULL,0.0,0.00,175000.00,175000.00,'selesai','lunas','transfer_bsi',NULL,'Bdn. Norhalimah, S.Tr.Keb','ANC rutin dan Prenatal Yoga Privat','{\"hpl\": \"2026-11-17\", \"hpht\": \"2026-02-10\", \"usia_kehamilan\": 34, \"hasil_pemeriksaan\": \"Tensi 110/75, DJJ 142x/mnt reguler, kepala sudah masuk PAP\"}','2026-10-06 15:00:32','2026-10-06 15:00:32'),(3,'REG-202610-003',3,'klinik','2026-10-06 15:00:32',NULL,0.0,0.00,100000.00,100000.00,'terjadwal','belum_lunas','transfer_bsi',NULL,'Bdn. Norhalimah, S.Tr.Keb','Jadwal ulang suntik KB 3 bulan','{\"jenis_kb\": \"Suntik 3 Bulan\", \"jadwal_ulang\": \"2026-10-06\", \"tanggal_mulai\": \"2026-07-06\"}','2026-10-06 15:00:32','2026-10-06 15:00:32'),(4,'REG-202610-004',5,'homevisit','2026-10-07 15:00:32','Jl. Pramuka Komp. Melati Indah No. 12',6.0,30000.00,300000.00,330000.00,'terjadwal','belum_lunas','transfer_bsi',NULL,'Bdn. Norhalimah, S.Tr.Keb','Homecare Newborn Care + Pijat Bayi','{\"terapis\": \"Bdn. Norhalimah, S.Tr.Keb\", \"usia_bayi_hari\": 10}','2026-10-06 15:00:32','2026-10-06 15:00:32'),(5,'REG-202610-005',1,'homevisit','2026-10-08 10:00:00','Komp. Pondok Sejahtera Blok B No. 4',5.0,25000.00,200000.00,225000.00,'terjadwal','lunas','transfer_bsi','2026-10-06 15:42:35','Bdn. Norhalimah, S.Tr.Keb','','{}','2026-10-06 15:42:06','2026-10-06 15:42:34');
/*!40000 ALTER TABLE `kunjungan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kunjungan_detail`
--

DROP TABLE IF EXISTS `kunjungan_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kunjungan_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kunjungan_id` int NOT NULL,
  `layanan_id` int NOT NULL,
  `nama_layanan` varchar(150) NOT NULL,
  `tarif` decimal(12,2) NOT NULL DEFAULT '0.00',
  `qty` int NOT NULL DEFAULT '1',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kunjungan` (`kunjungan_id`),
  KEY `idx_layanan` (`layanan_id`),
  CONSTRAINT `fk_detail_kunjungan` FOREIGN KEY (`kunjungan_id`) REFERENCES `kunjungan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detail_layanan` FOREIGN KEY (`layanan_id`) REFERENCES `layanan` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kunjungan_detail`
--

LOCK TABLES `kunjungan_detail` WRITE;
/*!40000 ALTER TABLE `kunjungan_detail` DISABLE KEYS */;
INSERT INTO `kunjungan_detail` VALUES (1,1,17,'Pijat Bayi (Baby Massage Homecare)',100000.00,1,100000.00,'2026-10-06 15:00:32'),(2,1,19,'Pijat Laktasi & Oksitosin Homecare',100000.00,1,100000.00,'2026-10-06 15:00:32'),(3,2,1,'ANC (Ante Natal Care / Pemeriksaan Kehamilan)',100000.00,1,100000.00,'2026-10-06 15:00:32'),(4,2,2,'Prenatal Yoga Privat',75000.00,1,75000.00,'2026-10-06 15:00:32'),(5,3,7,'KB Suntik 3 Bulan (Aman Menyusui)',100000.00,1,100000.00,'2026-10-06 15:00:32'),(6,4,17,'Pijat Bayi (Baby Massage Homecare)',100000.00,1,100000.00,'2026-10-06 15:00:32'),(7,4,20,'Perawatan Bayi Baru Lahir (Newborn Care)',200000.00,1,200000.00,'2026-10-06 15:00:32'),(8,5,17,'Pijat Bayi (Baby Massage Homecare)',100000.00,1,100000.00,'2026-10-06 15:42:06'),(9,5,19,'Pijat Laktasi & Oksitosin Homecare',100000.00,1,100000.00,'2026-10-06 15:42:06');
/*!40000 ALTER TABLE `kunjungan_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `layanan`
--

DROP TABLE IF EXISTS `layanan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `layanan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode` varchar(50) NOT NULL,
  `nama_layanan` varchar(150) NOT NULL,
  `kategori` enum('ibu','bayi','homecare','newborn','kb','imunisasi','umum') NOT NULL DEFAULT 'ibu',
  `tarif` decimal(12,2) NOT NULL DEFAULT '0.00',
  `is_homecare_available` tinyint(1) DEFAULT '1',
  `deskripsi` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `layanan`
--

LOCK TABLES `layanan` WRITE;
/*!40000 ALTER TABLE `layanan` DISABLE KEYS */;
INSERT INTO `layanan` VALUES (1,'SRV-ANC','ANC (Ante Natal Care / Pemeriksaan Kehamilan)','ibu',100000.00,1,'Pemeriksaan fisik ibu hamil, palpasi Leopold, USG dasar, cek tensi, timbang badan & konseling gizi',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(2,'SRV-YOGA','Prenatal Yoga Privat','ibu',75000.00,1,'Senam dan yoga relaksasi kehamilan untuk mempersiapkan panggul dan napas persalinan nyaman',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(3,'SRV-SALIN','Paket Persalinan Nyaman PMB','ibu',3000000.00,0,'Pertolongan persalinan normal, perawatan ibu & bayi 1x24 jam, obat standar persalinan',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(4,'SRV-NIFAS','Kunjungan Nifas (KF 1 / KF 2 / KF 3)','ibu',50000.00,1,'Pemeriksaan pemulihan jalan lahir, lochea, kontraksi rahim, tekanan darah ibu pasca melahirkan',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(5,'SRV-LAKTASI','Konsultasi & Manajemen Laktasi','ibu',100000.00,1,'Evaluasi pelekatan bayi, pemecahan masalah puting lecet/payudara bengkak, manajemen ASI perah',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(6,'SRV-KB-SUNTIK1','KB Suntik 1 Bulan','kb',100000.00,1,'Suntik hormon kombinasi pencegah kehamilan siklus bulanan',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(7,'SRV-KB-SUNTIK3','KB Suntik 3 Bulan (Aman Menyusui)','kb',100000.00,1,'Suntik progestin cocok untuk ibu menyusui, tidak mengganggu produksi ASI',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(8,'SRV-KB-PIL','KB Pil','kb',45000.00,1,'Pil kontrasepsi oral reguler atau khusus menyusui',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(9,'SRV-KB-IUD','Pemasangan IUD (Spiral)','kb',450000.00,0,'Pemasangan alat kontrasepsi dalam rahim jangka panjang efektif 5-8 tahun',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(10,'SRV-KB-IMPLAN','Pemasangan Implan / Susuk KB','kb',400000.00,0,'Pemasangan susuk kontrasepsi bawah kulit lengan',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(11,'SRV-IMUN-HB0','Imunisasi HB-0 (Hepatitis B Lahir)','imunisasi',85000.00,1,'Vaksin pencegah hepatitis B untuk bayi baru lahir 0-7 hari',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(12,'SRV-IMUN-BCG','Imunisasi BCG & Polio 1','imunisasi',150000.00,1,'Vaksin pencegah tuberkulosis (TBC) dan polio oral',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(13,'SRV-IMUN-DPT','Imunisasi DPT-HB-Hib (Pentavalen)','imunisasi',180000.00,1,'Vaksin pencegah difteri, pertusis, tetanus, hepatitis B, dan pneumonia/meningitis Hib',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(14,'SRV-IMUN-CAMPAK','Imunisasi Campak / MR','imunisasi',170000.00,1,'Vaksin pencegah campak dan rubella pada bayi usia 9 bulan',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(15,'SRV-BABY-SPA','Baby Spa & Hydrotherapy','bayi',100000.00,0,'Berenang air hangat, baby massage relaksasi dan stimulasi sensorik motorik bayi',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(16,'SRV-MPASI','Konsultasi MPASI Sehat Gizi Seimbang','bayi',75000.00,1,'Panduan menu tekstur makanan pendamping ASI, pencegahan stunting & GTM',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(17,'SRV-PJ-BAYI','Pijat Bayi (Baby Massage Homecare)','homecare',100000.00,1,'Pijat relaksasi stimulasi tumbuh kembang bayi, atasi kolik, kembung & tidur nyenyak di rumah',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(18,'SRV-PJ-HAMIL','Pijat Hamil (Pregnancy Massage Homecare)','homecare',120000.00,1,'Pijat relaksasi pegal punggung, pinggang dan kaki bengkak pada ibu hamil oleh bidan tersertifikasi',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(19,'SRV-PJ-LAKTASI','Pijat Laktasi & Oksitosin Homecare','homecare',100000.00,1,'Pijat stimulasi hormon oksitosin dan perlancar ASI, atasi bendungan ASI di rumah',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(20,'SRV-NEWBORN','Perawatan Bayi Baru Lahir (Newborn Care)','newborn',200000.00,1,'Memandikan bayi baru lahir, perawatan tali pusat steril, jemur & edukasi orang tua baru',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(21,'SRV-MOM-CARE','Perawatan Ibu Pasca Melahirkan (Mom Treatment)','newborn',200000.00,1,'Bengkung modern, boreh herbal, lulur nifas & pijat pemulihan stamina ibu nifas',1,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(22,'SRV-UMUM','Pemeriksaan Berobat Umum','umum',50000.00,1,'Konsultasi keluhan umum ringan, pemeriksaan vital sign dan resep edukasi kesehatan',1,'2026-10-06 15:00:32','2026-10-06 15:00:32');
/*!40000 ALTER TABLE `layanan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pasien`
--

DROP TABLE IF EXISTS `pasien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pasien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `no_rm` varchar(50) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `nik` varchar(30) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `hp_wa` varchar(30) NOT NULL,
  `alamat` text,
  `nama_suami` varchar(150) DEFAULT NULL,
  `golongan_darah` varchar(5) DEFAULT NULL,
  `alergi` varchar(255) DEFAULT NULL,
  `catatan_khusus` text,
  `foto_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `no_rm` (`no_rm`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pasien`
--

LOCK TABLES `pasien` WRITE;
/*!40000 ALTER TABLE `pasien` DISABLE KEYS */;
INSERT INTO `pasien` VALUES (1,'RM-2026-0001','Bunda Siti Nurhaliza','6371015609950001','1995-09-16','081234567890','Komp. Pondok Sejahtera Blok B No. 4, Banjarmasin','Bpk. Ahmad Fauzi','O','Tidak ada','Ibu nifas hari ke-7, ASI sangat lancar, butuh pijat relaksasi',NULL,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(2,'RM-2026-0002','Bunda Rina Marlina','6371024508980002','1998-08-05','082155667788','Jl. Veteran No. 45 RT 02, Banjarmasin','Bpk. Hendra Saputra','B','Amoksisilin','Kehamilan trimester 3 (34 minggu), rajin yoga hamil',NULL,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(3,'RM-2026-0003','Bunda Dewi Kartika','6371036012960003','1996-12-20','085244332211','Jl. Sultan Adam Komp. Kadar Permai No. 18','Bpk. Dimas Pratama','A','Tidak ada','Akseptor KB Suntik 3 Bulan rutin',NULL,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(4,'RM-2026-0004','Bunda Anisa Rahmawati','6371047101990004','1999-01-31','087811223344','Jl. Cempaka Putih No. 8','Bpk. Rizky Aditya','AB','Tidak ada','Bayi usia 2 bulan, jadwal imunisasi DPT-HB-Hib 1',NULL,'2026-10-06 15:00:32','2026-10-06 15:00:32'),(5,'RM-2026-0005','Bunda Fitriani Az-Zahra','6371055504970005','1997-04-15','081399887766','Jl. Pramuka Komp. Melati Indah No. 12','Bpk. Fajar Ramadhan','O','Udang / Seafood','Memerlukan Homevisit Newborn Care & Pijat Bayi',NULL,'2026-10-06 15:00:32','2026-10-06 15:00:32');
/*!40000 ALTER TABLE `pasien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaksi_keuangan`
--

DROP TABLE IF EXISTS `transaksi_keuangan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaksi_keuangan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode_transaksi` varchar(50) NOT NULL,
  `tanggal` date NOT NULL,
  `tipe` enum('masuk','keluar') NOT NULL,
  `kategori` varchar(100) NOT NULL,
  `jumlah` decimal(12,2) NOT NULL,
  `keterangan` text,
  `pasien_id` int DEFAULT NULL,
  `pasien_nama` varchar(150) DEFAULT NULL,
  `kunjungan_id` int DEFAULT NULL,
  `metode` varchar(50) DEFAULT 'Transfer',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_transaksi` (`kode_transaksi`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_tipe` (`tipe`),
  KEY `idx_kategori` (`kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaksi_keuangan`
--

LOCK TABLES `transaksi_keuangan` WRITE;
/*!40000 ALTER TABLE `transaksi_keuangan` DISABLE KEYS */;
INSERT INTO `transaksi_keuangan` VALUES (1,'TRX-IN-001','2026-10-04','masuk','Homecare + Transport',225000.00,'Pembayaran Homevisit Pijat Bayi & Laktasi via QRIS',1,'Bunda Siti Nurhaliza',1,'QRIS','2026-10-06 15:00:32','2026-10-06 15:00:32'),(2,'TRX-IN-002','2026-10-05','masuk','Biaya Layanan',175000.00,'Pembayaran ANC & Yoga Hamil via BSI',2,'Bunda Rina Marlina',2,'Transfer BSI','2026-10-06 15:00:32','2026-10-06 15:00:32'),(3,'TRX-OUT-001','2026-10-03','keluar','Pembelian BHP',185000.00,'Pembelian kapas alkohol, sarung tangan steril & minyak baby oil herbal',NULL,NULL,NULL,'Tunai','2026-10-06 15:00:32','2026-10-06 15:00:32'),(4,'TRX-OUT-002','2026-10-04','keluar','Sampah Medis',75000.00,'Biaya retribusi pengangkutan limbah medis & safety box',NULL,NULL,NULL,'Transfer BSI','2026-10-06 15:00:32','2026-10-06 15:00:32'),(5,'TRX-OUT-003','2026-10-05','keluar','Listrik & Kuota',250000.00,'Token listrik PMB & kuota WhatsApp admin operasional',NULL,NULL,NULL,'Transfer BSI','2026-10-06 15:00:32','2026-10-06 15:00:32'),(6,'TRX-IN-MUWFKN05','2026-10-06','masuk','Homecare + Transport',225000.00,'Pembayaran lunas kunjungan REG-202610-005',1,'Bunda Siti Nurhaliza',5,'Transfer BSI','2026-10-06 15:42:34','2026-10-06 15:42:34');
/*!40000 ALTER TABLE `transaksi_keuangan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wa_log`
--

DROP TABLE IF EXISTS `wa_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wa_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pasien_id` int DEFAULT NULL,
  `pasien_nama` varchar(150) NOT NULL,
  `no_wa` varchar(30) NOT NULL,
  `jenis_pesan` varchar(50) NOT NULL,
  `pesan` text NOT NULL,
  `status` varchar(50) DEFAULT 'dibuka_ke_wa',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wa_pasien` (`pasien_id`),
  KEY `idx_wa_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wa_log`
--

LOCK TABLES `wa_log` WRITE;
/*!40000 ALTER TABLE `wa_log` DISABLE KEYS */;
INSERT INTO `wa_log` VALUES (1,1,'Bunda Siti Nurhaliza','081234567890','invoice_homevisit','Trimakasih Bunda Siti Nurhaliza sudah reservasi layanan Homevisite dari @rumahmaryam.id\n\nBerikut Invoice layanan homevisitenya\nHari /tgl : Sabtu, 04 Oktober 2026\n\nPijat Bayi : Rp. 100.000\nPijat Laktasi : Rp. 100.000\nBiaya Transport : Rp. 25.000\n\nTotal : Rp. 225.000\n\nPembayaran bisa trf via Qris (tanpa biaya admin) atau transfer ke rekening berikut :\n\nBSI 7124826197\nAtas nama Norhalimah\n\nTrimakasih😊🙏','dibuka_ke_wa','2026-10-06 15:00:32'),(2,1,'Bunda Siti Nurhaliza','081234567890','invoice_homevisit','Trimakasih Bunda Siti Nurhaliza sudah reservasi layanan Homevisite dari @rumahmaryam.id...','dibuka_ke_wa','2026-10-06 15:42:45');
/*!40000 ALTER TABLE `wa_log` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-06 15:43:02
