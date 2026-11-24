/**
 * COMPONENT: SPMB ONLINE (PENDAFTARAN SANTRI BARU) INTERACTIVE MODAL & DIGITAL SLIP
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * Yayasan Islam Qudwatul Ummah (Yiqul)
 * 
 * Menyediakan wizard pendaftaran online multi-tahap yang ramah mobile:
 * - Tahap 1: Data Calon Santri, Jenjang, & Riwayat Hafalan
 * - Tahap 2: Data Orang Tua/Wali & Finansial
 * - Tahap 3: Alamat Domisili & Riwayat Kesehatan
 * - Tanda Terima / Bukti Digital Resmi Pendaftaran (Printable & Direct WhatsApp Confirmation)
 */

import { registerNewStudent, createWhatsAppConfirmationLink, getRegistrationById } from '../services/spmbService.js';
import { escapeHtml } from '../services/sanitizer.js';

let currentStep = 1;
let registrationResult = null;

/**
 * Buka modal formulir pendaftaran SPMB Online
 * @param {string} prefillJenjang - 'Day Care' | 'Play Group' | 'RAT Al-Qudwah' | 'TKT Al-Qudwah' | 'SDT Al-Qudwah' | 'SMPT Al-Qudwah' | 'SMAT Al-Qudwah'
 */
export function openSpmbModal(prefillJenjang = 'SDT Al-Qudwah') {
  currentStep = 1;
  registrationResult = null;

  const modal = document.getElementById('spmb-modal');
  if (!modal) return;

  renderSpmbModalContent(prefillJenjang);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Tutup modal pendaftaran SPMB
 */
export function closeSpmbModal() {
  const modal = document.getElementById('spmb-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Buka langsung bukti pendaftaran digital berdasarkan ID (untuk preview admin atau cetak ulang)
 * @param {string} id - Nomor Registrasi (SPMB-2026-XXXX)
 */
export function openSpmbReceiptDirect(id) {
  const reg = getRegistrationById(id);
  if (!reg) return;

  currentStep = 4;
  registrationResult = reg;

  const modal = document.getElementById('spmb-modal');
  if (!modal) return;

  renderSpmbModalContent();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Render konten modal SPMB sesuai tahap yang sedang aktif
 * @param {string} prefillJenjang 
 */
function renderSpmbModalContent(prefillJenjang = 'MTs') {
  const modal = document.getElementById('spmb-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-container spmb-modal-window">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <div class="brand-logo-badge" style="background: rgba(16, 185, 129, 0.15); color: #10B981;" aria-hidden="true">
            <i data-lucide="graduation-cap" width="20" height="20"></i>
          </div>
          <div>
            <h3 class="modal-title">Pendaftaran Santri Baru (SPMB 2026/2027)</h3>
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">
              Yayasan Islam Qudwatul Ummah Lebak - Banten
            </span>
          </div>
        </div>
        <button type="button" class="btn-icon" id="spmb-close-btn" aria-label="Tutup Formulir">
          <i data-lucide="x" width="20" height="20"></i>
        </button>
      </div>

      <!-- Step Indicator Bar (Hanya tampil jika belum submit / step 1-3) -->
      ${currentStep <= 3 ? `
        <div class="spmb-step-indicator" role="tablist">
          <div class="spmb-step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}">
            <div class="step-num">1</div>
            <div class="step-label">Data Calon Santri</div>
          </div>
          <div class="spmb-step-line ${currentStep > 1 ? 'filled' : ''}"></div>
          <div class="spmb-step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}">
            <div class="step-num">2</div>
            <div class="step-label">Orang Tua / Wali</div>
          </div>
          <div class="spmb-step-line ${currentStep > 2 ? 'filled' : ''}"></div>
          <div class="spmb-step-item ${currentStep === 3 ? 'active' : ''}">
            <div class="step-num">3</div>
            <div class="step-label">Domisili & Kesehatan</div>
          </div>
        </div>
      ` : ''}

      <!-- Modal Body -->
      <div class="spmb-modal-body">
        ${currentStep === 1 ? renderStep1(prefillJenjang) : ''}
        ${currentStep === 2 ? renderStep2() : ''}
        ${currentStep === 3 ? renderStep3() : ''}
        ${currentStep === 4 && registrationResult ? renderStepSuccess(registrationResult) : ''}
      </div>
    </div>
  `;

  bindSpmbEvents();
}

/**
 * STEP 1: Pilihan Jenjang & Data Calon Santri
 */
function renderStep1(defaultJenjang) {
  return `
    <form id="spmb-step1-form" class="spmb-form-step">
      <div class="spmb-alert-info">
        <i data-lucide="info" width="18" height="18"></i>
        <span>Silakan isi data calon santri dengan teliti sesuai akta kelahiran / kartu keluarga.</span>
      </div>

      <!-- Jenjang, Jalur & Hunian -->
      <div class="form-group-grid-3">
        <div class="form-group">
          <label class="form-label" for="spmb-jenjang">Jenjang Pendidikan *</label>
          <select id="spmb-jenjang" class="form-select" required>
            <option value="Day Care" ${defaultJenjang === 'Day Care' ? 'selected' : ''}>Day Care</option>
            <option value="Play Group" ${defaultJenjang === 'Play Group' ? 'selected' : ''}>Play Group</option>
            <option value="RAT Al-Qudwah" ${defaultJenjang === 'RAT Al-Qudwah' ? 'selected' : ''}>RAT Al-Qudwah</option>
            <option value="TKT Al-Qudwah" ${defaultJenjang === 'TKT Al-Qudwah' ? 'selected' : ''}>TKT Al-Qudwah</option>
            <option value="SDT Al-Qudwah" ${defaultJenjang === 'SDT Al-Qudwah' || !defaultJenjang ? 'selected' : ''}>SDT Al-Qudwah</option>
            <option value="SMPT Al-Qudwah" ${defaultJenjang === 'SMPT Al-Qudwah' ? 'selected' : ''}>SMPT Al-Qudwah</option>
            <option value="SMAT Al-Qudwah" ${defaultJenjang === 'SMAT Al-Qudwah' ? 'selected' : ''}>SMAT Al-Qudwah</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-jalur">Jalur Masuk *</label>
          <select id="spmb-jalur" class="form-select" required>
            <option value="Reguler">Jalur Reguler</option>
            <option value="Prestasi">Jalur Prestasi Akademik</option>
            <option value="Beasiswa_Tahfidz">Beasiswa Tahfidz Al-Qur'an</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-asrama">Pola Pendidikan *</label>
          <select id="spmb-asrama" class="form-select" required>
            <option value="Boarding">Asrama (Boarding School)</option>
            <option value="FullDay">Non-Asrama (Full Day)</option>
          </select>
        </div>
      </div>

      <!-- Nama Calon Santri -->
      <div class="form-group">
        <label class="form-label" for="spmb-nama">Nama Lengkap Calon Santri *</label>
        <input type="text" id="spmb-nama" class="form-input" placeholder="Contoh: Muhammad Fatih Al-Ayyubi" required autocomplete="name">
      </div>

      <!-- Identitas: NISN, NIK, Kelamin -->
      <div class="form-group-grid-3">
        <div class="form-group">
          <label class="form-label" for="spmb-nisn">NISN (10 Digit)</label>
          <input type="text" id="spmb-nisn" class="form-input" placeholder="0012345678" maxlength="10" inputmode="numeric">
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-nik">NIK Santri (16 Digit)</label>
          <input type="text" id="spmb-nik" class="form-input" placeholder="3602xxxxxxxxxxxx" maxlength="16" inputmode="numeric">
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-gender">Jenis Kelamin *</label>
          <select id="spmb-gender" class="form-select" required>
            <option value="L">Laki-laki (Ikhwan)</option>
            <option value="P">Perempuan (Akhwat)</option>
          </select>
        </div>
      </div>

      <!-- Tempat & Tanggal Lahir -->
      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-tempat-lahir">Tempat Lahir *</label>
          <input type="text" id="spmb-tempat-lahir" class="form-input" placeholder="Contoh: Lebak" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-tgl-lahir">Tanggal Lahir *</label>
          <input type="date" id="spmb-tgl-lahir" class="form-input" required>
        </div>
      </div>

      <!-- Asal Sekolah & Riwayat Hafalan -->
      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-asal-sekolah">Asal Sekolah / Madrasah *</label>
          <input type="text" id="spmb-asal-sekolah" class="form-input" placeholder="Contoh: SDIT Qudwatul Ummah Lebak" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-hafalan">Riwayat Hafalan Al-Qur'an *</label>
          <select id="spmb-hafalan" class="form-select" required>
            <option value="Belum Ada">Belum Ada / Baru Juz Amma</option>
            <option value="1-2 Juz">1 - 2 Juz</option>
            <option value="3-5 Juz">3 - 5 Juz</option>
            <option value="> 5 Juz">Lebih dari 5 Juz</option>
            <option value="30 Juz Mutqin">Khatam 30 Juz</option>
          </select>
        </div>
      </div>

      <div class="spmb-footer-actions">
        <div></div>
        <button type="submit" class="btn-primary" id="btn-spmb-next-1">
          <span>Lanjut ke Data Orang Tua</span>
          <i data-lucide="arrow-right" width="16" height="16"></i>
        </button>
      </div>
    </form>
  `;
}

/**
 * STEP 2: Data Orang Tua / Wali & Kontak
 */
function renderStep2() {
  return `
    <form id="spmb-step2-form" class="spmb-form-step">
      <div class="spmb-alert-info">
        <i data-lucide="info" width="18" height="18"></i>
        <span>Pastikan nomor WhatsApp orang tua aktif untuk menerima konfirmasi seleksi & pengumuman.</span>
      </div>

      <!-- Ayah -->
      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-nama-ayah">Nama Lengkap Ayah Kandung *</label>
          <input type="text" id="spmb-nama-ayah" class="form-input" placeholder="Nama lengkap Ayah beserta gelar" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-pekerjaan-ayah">Pekerjaan Ayah *</label>
          <select id="spmb-pekerjaan-ayah" class="form-select" required>
            <option value="PNS/TNI/Polri">PNS / TNI / Polri</option>
            <option value="Karyawan Swasta">Karyawan Swasta</option>
            <option value="Wiraswasta/Pedagang">Wiraswasta / Pengusaha / Pedagang</option>
            <option value="Guru/Dosen">Guru / Dosen</option>
            <option value="Petani/Buruh">Petani / Nelayan / Buruh</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      <!-- Ibu -->
      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-nama-ibu">Nama Lengkap Ibu Kandung *</label>
          <input type="text" id="spmb-nama-ibu" class="form-input" placeholder="Nama lengkap Ibu beserta gelar" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-pekerjaan-ibu">Pekerjaan Ibu *</label>
          <select id="spmb-pekerjaan-ibu" class="form-select" required>
            <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
            <option value="PNS/TNI/Polri">PNS / TNI / Polri</option>
            <option value="Karyawan Swasta">Karyawan Swasta</option>
            <option value="Wiraswasta">Wiraswasta / Pengusaha</option>
            <option value="Guru/Dosen">Guru / Dosen</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      <!-- Finansial & Kontak WhatsApp -->
      <div class="form-group-grid-3">
        <div class="form-group">
          <label class="form-label" for="spmb-penghasilan">Penghasilan Ortu (Total Bulanan) *</label>
          <select id="spmb-penghasilan" class="form-select" required>
            <option value="< 2 Juta">&lt; Rp 2.000.000</option>
            <option value="2 - 5 Juta" selected>Rp 2.000.000 - Rp 5.000.000</option>
            <option value="5 - 10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
            <option value="> 10 Juta">&gt; Rp 10.000.000</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-wa">No. WhatsApp Aktif (Utama) *</label>
          <input type="tel" id="spmb-wa" class="form-input" placeholder="Contoh: 081289123456" required autocomplete="tel" inputmode="tel">
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-hubungan">Hubungan Wali</label>
          <select id="spmb-hubungan" class="form-select">
            <option value="Orang Tua Kandung" selected>Orang Tua Kandung</option>
            <option value="Kakek/Nenek">Kakek / Nenek</option>
            <option value="Paman/Bibi">Paman / Bibi</option>
            <option value="Wali Lainnya">Wali Lainnya</option>
          </select>
        </div>
      </div>

      <div class="spmb-footer-actions">
        <button type="button" class="btn-secondary" id="btn-spmb-prev-2">
          <i data-lucide="arrow-left" width="16" height="16"></i>
          <span>Kembali</span>
        </button>
        <button type="submit" class="btn-primary" id="btn-spmb-next-2">
          <span>Lanjut ke Domisili & Selesai</span>
          <i data-lucide="arrow-right" width="16" height="16"></i>
        </button>
      </div>
    </form>
  `;
}

/**
 * STEP 3: Domisili & Riwayat Kesehatan
 */
function renderStep3() {
  return `
    <form id="spmb-step3-form" class="spmb-form-step">
      <div class="spmb-alert-info">
        <i data-lucide="info" width="18" height="18"></i>
        <span>Langkah terakhir: lengkapi alamat tempat tinggal domisili dan kondisi kesehatan santri.</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="spmb-alamat">Alamat Lengkap (Jalan, RT/RW, No. Rumah) *</label>
        <textarea id="spmb-alamat" class="form-textarea" rows="2" placeholder="Contoh: Jl. Raya Rangkasbitung - Pandeglang Km. 4 RT 02/05" required></textarea>
      </div>

      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-kelurahan">Kelurahan / Desa *</label>
          <input type="text" id="spmb-kelurahan" class="form-input" placeholder="Contoh: Cijoro Pasir" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-kecamatan">Kecamatan *</label>
          <input type="text" id="spmb-kecamatan" class="form-input" placeholder="Contoh: Rangkasbitung" required>
        </div>
      </div>

      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-kabupaten">Kota / Kabupaten *</label>
          <input type="text" id="spmb-kabupaten" class="form-input" value="Kab. Lebak" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-provinsi">Provinsi *</label>
          <input type="text" id="spmb-provinsi" class="form-input" value="Banten" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="spmb-kesehatan">Catatan Riwayat Kesehatan / Alergi Santri</label>
        <input type="text" id="spmb-kesehatan" class="form-input" placeholder="Contoh: Tidak ada riwayat penyakit berat, alergi debu ringan, dsb.">
      </div>

      <div class="spmb-footer-actions">
        <button type="button" class="btn-secondary" id="btn-spmb-prev-3">
          <i data-lucide="arrow-left" width="16" height="16"></i>
          <span>Kembali</span>
        </button>
        <button type="submit" class="btn-primary" id="btn-spmb-submit" style="background: #10B981; border-color: #059669;">
          <i data-lucide="check-circle" width="16" height="16"></i>
          <span>Kirim Pendaftaran Sekarang</span>
        </button>
      </div>
    </form>
  `;
}

/**
 * STEP 4: Success / Bukti Pendaftaran Digital (Digital Registration Card)
 * @param {Object} reg 
 */
function renderStepSuccess(reg) {
  const waUrl = createWhatsAppConfirmationLink(reg);
  const safeName = escapeHtml(reg.namaLengkap);
  const safeId = escapeHtml(reg.id);
  const safeJenjang = escapeHtml(reg.jenjang);
  const safeJalur = escapeHtml(reg.jalur);
  const safeAsrama = escapeHtml(reg.asrama);
  const safeSekolah = escapeHtml(reg.asalSekolah);
  const safeHafalan = escapeHtml(reg.riwayatHafalan);
  const safeOrtu = escapeHtml(`${reg.namaAyah} / ${reg.namaIbu}`);
  const safeWa = escapeHtml(reg.noWhatsapp);
  const safeDate = new Date(reg.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
    <div class="spmb-success-view fade-in">
      <div class="spmb-success-header">
        <div class="success-icon-badge">
          <i data-lucide="check" width="32" height="32"></i>
        </div>
        <h3 class="success-title">Alhamdulillah! Pendaftaran Berhasil Terkirim</h3>
        <p class="success-subtitle">
          Data calon santri telah tersimpan aman dalam sistem pangkalan data penerimaan santri baru Yiqul.
        </p>
      </div>

      <!-- Kartu Slip Tanda Terima Digital Resmi (Printable Slip) -->
      <div class="spmb-receipt-slip printable-area" id="spmb-receipt-card">
        <div class="receipt-top-banner">
          <div class="receipt-logo-group">
            <div class="receipt-mini-badge">YIQUL</div>
            <div>
              <div class="receipt-inst-name">YAYASAN ISLAM QUDWATUL UMMAH</div>
              <div class="receipt-inst-sub">PANITIA PENERIMAAN SANTRI BARU (SPMB) T.A 2026/2027</div>
              <div class="receipt-inst-address">Jl. Raya Rangkasbitung - Pandeglang Km. 4, Lebak - Banten</div>
            </div>
          </div>
          <div class="receipt-number-badge">
            <span class="badge-tag">NO. REGISTRASI RESMI</span>
            <span class="badge-code">${safeId}</span>
          </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-grid">
          <div class="receipt-col">
            <div class="receipt-field">
              <span class="label">Nama Calon Santri:</span>
              <strong class="value highlight">${safeName}</strong>
            </div>
            <div class="receipt-field">
              <span class="label">Jenjang & Pola:</span>
              <span class="value">${safeJenjang} (${safeAsrama})</span>
            </div>
            <div class="receipt-field">
              <span class="label">Jalur Pendaftaran:</span>
              <span class="value">${safeJalur}</span>
            </div>
            <div class="receipt-field">
              <span class="label">Asal Sekolah:</span>
              <span class="value">${safeSekolah}</span>
            </div>
          </div>

          <div class="receipt-col">
            <div class="receipt-field">
              <span class="label">Riwayat Hafalan:</span>
              <span class="value">${safeHafalan}</span>
            </div>
            <div class="receipt-field">
              <span class="label">Orang Tua / Wali:</span>
              <span class="value">${safeOrtu}</span>
            </div>
            <div class="receipt-field">
              <span class="label">WhatsApp Kontak:</span>
              <span class="value">${safeWa}</span>
            </div>
            <div class="receipt-field">
              <span class="label">Tanggal Registrasi:</span>
              <span class="value">${safeDate}</span>
            </div>
          </div>
        </div>

        <div class="receipt-footer-notes">
          <div class="notes-title">Petunjuk Tes & Verifikasi Berkas:</div>
          <ol>
            <li>Simpan atau cetak slip tanda terima ini sebagai bukti pendaftaran resmi.</li>
            <li>Klik tombol hijau di bawah untuk konfirmasi otomatis ke WhatsApp Panitia SPMB.</li>
            <li>Siapkan fotokopi Akta Kelahiran, Kartu Keluarga, dan Surat Keterangan Lulus / NISN saat verifikasi.</li>
          </ol>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="spmb-success-actions">
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-spmb-wa">
          <i data-lucide="message-circle" width="18" height="18"></i>
          <span>Konfirmasi ke WhatsApp Panitia ↗</span>
        </a>

        <button type="button" class="btn-secondary" id="btn-spmb-print">
          <i data-lucide="printer" width="18" height="18"></i>
          <span>Cetak Bukti Pendaftaran (PDF / Slip)</span>
        </button>

        <button type="button" class="btn-outline" id="btn-spmb-done">
          <i data-lucide="home" width="18" height="18"></i>
          <span>Selesai & Kembali ke Portal</span>
        </button>
      </div>
    </div>
  `;
}

// Temporary in-memory draft data between steps
let spmbDraft = {};

/**
 * Event handling untuk wizard form
 */
function bindSpmbEvents() {
  const modal = document.getElementById('spmb-modal');
  if (!modal) return;

  // Tutup Modal
  const closeBtn = document.getElementById('spmb-close-btn');
  if (closeBtn) closeBtn.onclick = closeSpmbModal;

  // STEP 1 Submit -> to STEP 2
  const step1Form = document.getElementById('spmb-step1-form');
  if (step1Form) {
    step1Form.onsubmit = (e) => {
      e.preventDefault();
      spmbDraft.jenjang = document.getElementById('spmb-jenjang').value;
      spmbDraft.jalur = document.getElementById('spmb-jalur').value;
      spmbDraft.asrama = document.getElementById('spmb-asrama').value;
      spmbDraft.namaLengkap = document.getElementById('spmb-nama').value;
      spmbDraft.nisn = document.getElementById('spmb-nisn').value;
      spmbDraft.nikSantri = document.getElementById('spmb-nik').value;
      spmbDraft.jenisKelamin = document.getElementById('spmb-gender').value;
      spmbDraft.tempatLahir = document.getElementById('spmb-tempat-lahir').value;
      spmbDraft.tanggalLahir = document.getElementById('spmb-tgl-lahir').value;
      spmbDraft.asalSekolah = document.getElementById('spmb-asal-sekolah').value;
      spmbDraft.riwayatHafalan = document.getElementById('spmb-hafalan').value;

      currentStep = 2;
      renderSpmbModalContent();
    };
  }

  // STEP 2 Back -> to STEP 1
  const prevBtn2 = document.getElementById('btn-spmb-prev-2');
  if (prevBtn2) {
    prevBtn2.onclick = () => {
      currentStep = 1;
      renderSpmbModalContent();
    };
  }

  // STEP 2 Submit -> to STEP 3
  const step2Form = document.getElementById('spmb-step2-form');
  if (step2Form) {
    step2Form.onsubmit = (e) => {
      e.preventDefault();
      spmbDraft.namaAyah = document.getElementById('spmb-nama-ayah').value;
      spmbDraft.pekerjaanAyah = document.getElementById('spmb-pekerjaan-ayah').value;
      spmbDraft.namaIbu = document.getElementById('spmb-nama-ibu').value;
      spmbDraft.pekerjaanIbu = document.getElementById('spmb-pekerjaan-ibu').value;
      spmbDraft.penghasilanOrtu = document.getElementById('spmb-penghasilan').value;
      spmbDraft.noWhatsapp = document.getElementById('spmb-wa').value;
      spmbDraft.hubunganWali = document.getElementById('spmb-hubungan').value;

      currentStep = 3;
      renderSpmbModalContent();
    };
  }

  // STEP 3 Back -> to STEP 2
  const prevBtn3 = document.getElementById('btn-spmb-prev-3');
  if (prevBtn3) {
    prevBtn3.onclick = () => {
      currentStep = 2;
      renderSpmbModalContent();
    };
  }

  // STEP 3 Final Submit -> Save & Show Success
  const step3Form = document.getElementById('spmb-step3-form');
  if (step3Form) {
    step3Form.onsubmit = (e) => {
      e.preventDefault();
      spmbDraft.alamatLengkap = document.getElementById('spmb-alamat').value;
      spmbDraft.kelurahanDesa = document.getElementById('spmb-kelurahan').value;
      spmbDraft.kecamatan = document.getElementById('spmb-kecamatan').value;
      spmbDraft.kotaKabupaten = document.getElementById('spmb-kabupaten').value;
      spmbDraft.provinsi = document.getElementById('spmb-provinsi').value;
      spmbDraft.catatanKesehatan = document.getElementById('spmb-kesehatan').value;

      // Register new student into SPMB database
      registrationResult = registerNewStudent(spmbDraft);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yiqul:spmb-updated', { detail: registrationResult }));
      }
      currentStep = 4;
      renderSpmbModalContent();
    };
  }

  // STEP 4 Print
  const printBtn = document.getElementById('btn-spmb-print');
  if (printBtn) {
    printBtn.onclick = () => {
      window.print();
    };
  }

  // STEP 4 Done
  const doneBtn = document.getElementById('btn-spmb-done');
  if (doneBtn) {
    doneBtn.onclick = () => {
      closeSpmbModal();
    };
  }
}

/**
 * Inisialisasi event listener global untuk pemicu modal SPMB
 */
export function initSpmbModal() {
  // Backdrop click to close
  const modal = document.getElementById('spmb-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeSpmbModal();
      }
    });
  }

  // Tangkap event global pemicu SPMB
  window.addEventListener('yiqul:open-spmb', (e) => {
    const jenjang = (e.detail && e.detail.jenjang) || 'SDT Al-Qudwah';
    openSpmbModal(jenjang);
  });
}
