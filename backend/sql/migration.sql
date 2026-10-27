-- ===================================================================
-- MIGRATION SCRIPT: PMB RUMAH MARYAM
-- Tanggal: 27 Oktober 2026
-- 
-- Rincian Perubahan:
-- 1. Penambahan Kolom `hasil_pemeriksaan` pada tabel `kunjungan`
-- 2. Pembaruan nama & gelar Bidan Utama menjadi 'Bdn. Norhalimah, S.Keb'
-- 3. Penambahan data akun Bidan Pelaksana (Megananda, Am.Keb & Rizqi Amaliyah Putri, Am.Keb)
-- ===================================================================

USE `pmb_rumah_maryam`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------
-- 1. Tambah Kolom hasil_pemeriksaan pada tabel kunjungan (Safe / Idempotent)
-- -------------------------------------------------------------------
SET @dbname = DATABASE();
SET @tablename = "kunjungan";
SET @columnname = "hasil_pemeriksaan";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 'Column hasil_pemeriksaan already exists' as notice;",
  "ALTER TABLE `kunjungan` ADD COLUMN `hasil_pemeriksaan` TEXT DEFAULT NULL AFTER `catatan_kunjungan`;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- -------------------------------------------------------------------
-- 2. Update default bidan_petugas pada tabel kunjungan
-- -------------------------------------------------------------------
ALTER TABLE `kunjungan` 
MODIFY COLUMN `bidan_petugas` VARCHAR(150) DEFAULT 'Bdn. Norhalimah, S.Keb';

-- Perbarui data nama bidan lama jika masih bergelar S.Tr.Keb
UPDATE `kunjungan` 
SET `bidan_petugas` = 'Bdn. Norhalimah, S.Keb' 
WHERE `bidan_petugas` = 'Bdn. Norhalimah, S.Tr.Keb';

-- -------------------------------------------------------------------
-- 3. Update nama Bidan Utama pada tabel klinik_config
-- -------------------------------------------------------------------
ALTER TABLE `klinik_config` 
MODIFY COLUMN `bidan_nama` VARCHAR(150) DEFAULT 'Bdn. Norhalimah, S.Keb';

UPDATE `klinik_config` 
SET `bidan_nama` = 'Bdn. Norhalimah, S.Keb' 
WHERE `id` = 1;

-- -------------------------------------------------------------------
-- 4. Pastikan tabel users ada & perbarui data Bidan Pelaksana
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `nama` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'bidan') NOT NULL DEFAULT 'bidan',
  `no_hp` VARCHAR(30) DEFAULT NULL,
  `foto_url` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT '1',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert atau update akun Admin (Bdn. Norhalimah, S.Keb) & Bidan Pelaksana
INSERT INTO `users` (`id`, `username`, `nama`, `email`, `password`, `role`, `no_hp`, `is_active`) VALUES
(1, 'admin', 'Bdn. Norhalimah, S.Keb', 'norhalimah@rumahmaryam.id', '$2b$10$Jx9RuUTwmbnbLDjnrjpq3u1NTxLWYOLxVzs.htExRSzvsfMruApim', 'admin', '082350313030', 1),
(2, 'megananda', 'Megananda, Am.Keb', 'megananda@rumahmaryam.id', '$2b$10$lVwYwu5aesdiUxxKF2p.wu7xOQdNQYkFygvbkSuJsYmLj45lBv2OC', 'bidan', '082150001001', 1),
(3, 'rizqi', 'Rizqi Amaliyah Putri, Am.Keb', 'rizqi@rumahmaryam.id', '$2b$10$lVwYwu5aesdiUxxKF2p.wu7xOQdNQYkFygvbkSuJsYmLj45lBv2OC', 'bidan', '082150001002', 1)
ON DUPLICATE KEY UPDATE 
  `nama` = VALUES(`nama`),
  `role` = VALUES(`role`),
  `no_hp` = VALUES(`no_hp`),
  `is_active` = VALUES(`is_active`);

SET FOREIGN_KEY_CHECKS = 1;
