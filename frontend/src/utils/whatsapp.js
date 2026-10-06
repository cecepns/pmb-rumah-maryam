import { formatRupiah, formatDate, formatDateTime, normalizeWA } from './formatters';

export const WA_MESSAGE_TYPES = {
  INVOICE_HOMEVISIT: 'invoice_homevisit',
  INVOICE_KLINIK: 'invoice_klinik',
  PENGINGAT_JADWAL: 'pengingat_jadwal',
  PENGINGAT_KB: 'pengingat_kb',
  PENGINGAT_NIFAS: 'pengingat_nifas',
  PENGINGAT_IMUNISASI: 'pengingat_imunisasi',
  STRUK_LUNAS: 'struk_lunas',
  SAMBUTAN_PASIEN_BARU: 'sambutan_pasien_baru',
  FOLLOW_UP: 'follow_up'
};

export const WA_TYPE_LABELS = {
  [WA_MESSAGE_TYPES.INVOICE_HOMEVISIT]: 'Invoice Homevisit (Sesuai Format Klien)',
  [WA_MESSAGE_TYPES.INVOICE_KLINIK]: 'Invoice Layanan Klinik',
  [WA_MESSAGE_TYPES.PENGINGAT_JADWAL]: 'Pengingat Jadwal Kunjungan',
  [WA_MESSAGE_TYPES.PENGINGAT_KB]: 'Pengingat Jadwal Ulang KB',
  [WA_MESSAGE_TYPES.PENGINGAT_NIFAS]: 'Pengingat Kunjungan Nifas',
  [WA_MESSAGE_TYPES.PENGINGAT_IMUNISASI]: 'Pengingat Imunisasi Bayi',
  [WA_MESSAGE_TYPES.STRUK_LUNAS]: 'Struk Bukti Pembayaran Lunas',
  [WA_MESSAGE_TYPES.SAMBUTAN_PASIEN_BARU]: 'Sambutan Pasien Baru',
  [WA_MESSAGE_TYPES.FOLLOW_UP]: 'Follow Up Pasca Layanan'
};

export function buildWhatsAppMessage(type, { visit, patient, config = {} }) {
  const clinicName = config.nama_praktik || 'PMB Rumah Maryam';
  const igHandle = config.instagram || '@rumahmaryam.id';
  const bankName = config.bank_nama || 'BSI';
  const bankRekening = config.bank_rekening || '7124826197';
  const bankAtasNama = config.bank_atas_nama || 'Norhalimah';

  const patientName = patient?.nama || visit?.pasien_nama || 'Bunda';
  const jadwalStr = visit?.jadwal_kunjungan ? formatDate(visit.jadwal_kunjungan) : '-';
  const jadwalTimeStr = visit?.jadwal_kunjungan ? formatDateTime(visit.jadwal_kunjungan) : '-';

  // Format list items
  const items = visit?.items || [];
  const itemsListText = items.length > 0
    ? items.map(item => `${item.nama_layanan} : ${formatRupiah(item.tarif)}`).join('\n')
    : 'Layanan Homevisite : ' + formatRupiah(visit?.subtotal_layanan || 0);

  const transportFee = Number(visit?.biaya_transport || 0);
  const totalBiaya = Number(visit?.total_biaya || 0);

  switch (type) {
    case WA_MESSAGE_TYPES.INVOICE_HOMEVISIT:
      return `Trimakasih ${patientName} sudah reservasi layanan Homevisite dari ${igHandle}

Berikut Invoice layanan homevisitenya
Hari /tgl : ${jadwalStr}

${itemsListText}
${transportFee > 0 ? `Layanan homevisite / Transport : ${formatRupiah(transportFee)}\n` : ''}
Total : ${formatRupiah(totalBiaya)}

Pembayaran bisa trf via Qris (tanpa biaya admin) atau transfer ke rekening berikut :

${bankName} ${bankRekening}
Atas nama ${bankAtasNama}

Trimakasih😊🙏`;

    case WA_MESSAGE_TYPES.INVOICE_KLINIK:
      return `Trimakasih ${patientName} sudah mendaftar layanan di ${clinicName}

Berikut Rincian Tagihan Layanan:
Hari /tgl : ${jadwalStr}

${itemsListText}

Total Tagihan : ${formatRupiah(totalBiaya)}
Status : ${visit?.status_pembayaran === 'lunas' ? 'LUNAS ✅' : 'Belum Lunas'}

Pembayaran dapat melalui QRIS (tanpa admin) atau transfer:
${bankName} ${bankRekening}
a.n. ${bankAtasNama}

Trimakasih atas kepercayaannya pada ${clinicName} 🌸`;

    case WA_MESSAGE_TYPES.PENGINGAT_JADWAL:
      return `Halo ${patientName} 🔔

Mengingatkan kembali jadwal kunjungan Anda di ${clinicName}:
Hari / Tgl : ${jadwalTimeStr}
Tipe Layanan : ${visit?.tipe_layanan === 'homevisit' ? 'Homevisit (Kunjungan ke Rumah)' : 'Klinik PMB'}
${visit?.tipe_layanan === 'homevisit' ? `Alamat : ${visit?.alamat_homevisit || patient?.alamat || '-'}\n` : ''}Layanan : ${items.map(i => i.nama_layanan).join(', ') || '-'}

Mohon konfirmasi jika ada kendala atau perubahan jadwal ya Bunda.
Sampai jumpa, salam sehat dari ${clinicName} 😊🙏`;

    case WA_MESSAGE_TYPES.PENGINGAT_KB:
      return `Halo ${patientName} 🌸

Salam hangat dari ${clinicName}.
Mengingatkan bahwa jadwal kontrol / suntik KB ulang Anda dijadwalkan pada:
📅 Tanggal : ${visit?.data_klinis?.jadwal_ulang ? formatDate(visit.data_klinis.jadwal_ulang) : jadwalStr}
Jenis KB : ${visit?.data_klinis?.jenis_kb || 'KB Reguler'}

Disarankan tepat waktu agar efektivitas perlindungan kontrasepsi tetap maksimal ya Bunda.
Jika ingin reservasi kunjungan klinik atau homevisit, silakan balas pesan ini. Terima kasih! 😊`;

    case WA_MESSAGE_TYPES.PENGINGAT_NIFAS:
      return `Halo ${patientName} 💕

Bagaimana kabar Bunda dan buah hati tercinta?
Mengingatkan jadwal Kunjungan Nifas (KF):
📅 Tanggal : ${jadwalStr}
Layanan : Kunjungan Pemantauan Nifas & Menyusui

Pemeriksaan nifas penting untuk memastikan pemulihan rahim dan kesehatan Bunda serta si kecil berjalan optimal.
Salam hangat dari ${clinicName} 🌸`;

    case WA_MESSAGE_TYPES.PENGINGAT_IMUNISASI:
      return `Halo ${patientName} 👶💉

Mengingatkan jadwal imunisasi untuk si kecil di ${clinicName}:
📅 Jadwal : ${visit?.data_klinis?.jadwal_berikutnya ? formatDate(visit.data_klinis.jadwal_berikutnya) : jadwalStr}
Vaksin : ${visit?.data_klinis?.jenis_vaksin || 'Imunisasi Bayi'}

Pastikan si kecil dalam kondisi sehat dan tidak sedang demam tinggi sebelum imunisasi ya Bunda.
Silakan konfirmasi kehadiran. Terima kasih 😊🙏`;

    case WA_MESSAGE_TYPES.STRUK_LUNAS:
      return `Halo ${patientName} ✅

Terima kasih atas pembayaran Anda.
Berikut bukti pembayaran sah dari ${clinicName}:
No. Kunjungan : *${visit?.kode_kunjungan || '-'}*
Tanggal Bayar : ${formatDate(new Date().toISOString())}
Total Biaya : *${formatRupiah(totalBiaya)}*
Status : *LUNAS (PAID)*
Metode : ${visit?.metode_pembayaran === 'qris' ? 'QRIS' : (visit?.metode_pembayaran === 'tunai' ? 'Tunai' : 'Transfer BSI')}

Semoga Bunda dan keluarga senantiasa sehat selalu. Terima kasih atas kepercayaannya! 🌸`;

    case WA_MESSAGE_TYPES.SAMBUTAN_PASIEN_BARU:
      return `Selamat datang di ${clinicName}, ${patientName} 🌸

Data rekam medis Anda telah terdaftar:
Nama Pasien : *${patient?.nama || '-'}*
No. Rekam Medis : *${patient?.no_rm || '-'}*
No. WhatsApp : *${patient?.hp_wa || '-'}*

Kami siap melayani kebutuhan kesehatan ibu, bayi, dan keluarga dengan penuh kasih.
Simpan nomor ini untuk konsultasi & reservasi layanan berikutnya ya Bunda. Terima kasih 😊🙏`;

    case WA_MESSAGE_TYPES.FOLLOW_UP:
      return `Halo ${patientName} 💕

Bagaimana kondisi Bunda / si kecil setelah mendapatkan layanan dari ${clinicName}?
Semoga terasa lebih nyaman dan bugar ya Bunda.

Apabila ada keluhan atau hal yang ingin dikonsultasikan kembali, jangan ragu untuk menghubungi kami.
Salam sehat dan hangat dari seluruh tim ${clinicName} 🌸`;

    default:
      return `Halo ${patientName}, salam hangat dari ${clinicName}. Silakan hubungi kami untuk informasi dan reservasi layanan.`;
  }
}

export function openWhatsAppDirect(phone, message) {
  const cleanPhone = normalizeWA(phone);
  if (!cleanPhone) {
    throw new Error('Nomor WhatsApp pasien tidak valid');
  }
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}
