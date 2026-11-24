/**
 * SERVICE: FILE UPLOADER & GOOGLE DRIVE CONNECTOR
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola proses Choose File dari folder PC/perangkat, pembacaan Base64,
 * pengiriman ke backend Google Apps Script Drive Engine, serta konversi direct link lh3.
 */

/**
 * Konversi URL Google Drive standar menjadi link direct CDN lh3.googleusercontent.com
 * @param {string} driveUrl
 * @returns {string} Direct image link
 */
export function convertGoogleDriveToDirectLink(driveUrl) {
  if (!driveUrl || typeof driveUrl !== 'string') return driveUrl;
  const trimmed = driveUrl.trim();

  // Jika sudah berupa lh3.googleusercontent.com
  if (trimmed.includes('lh3.googleusercontent.com')) {
    return trimmed;
  }

  // Pola 1: https://drive.google.com/file/d/{FILE_ID}/view...
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    return `https://lh3.googleusercontent.com/d/${matchFileD[1]}`;
  }

  // Pola 2: https://drive.google.com/open?id={FILE_ID} atau uc?id={FILE_ID} atau thumbnail?id={FILE_ID}
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) {
    return `https://lh3.googleusercontent.com/d/${matchIdParam[1]}`;
  }

  return trimmed;
}

/**
 * Membaca berkas dari PC/Device pengguna sebagai Base64 Data URL
 * @param {File} file
 * @returns {Promise<{base64: string, fileName: string, mimeType: string, fileSize: number}>}
 */
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Tidak ada berkas yang dipilih.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        base64: reader.result,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size
      });
    };
    reader.onerror = (error) => {
      reject(new Error('Gagal membaca berkas dari perangkat: ' + error.message));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload berkas ke Google Drive melalui Google Apps Script backend
 * Jika berjalan di luar lingkungan GAS (misal: localhost standalone),
 * otomatis menggunakan simulasi lokal Base64/Mock Drive agar developer/admin tetap bisa preview.
 * 
 * @param {File} file - Berkas dari input type="file"
 * @param {Object} options
 * @param {'logos'|'banners'|'app_icons'|'documents'} options.folderType
 * @returns {Promise<{success: boolean, fileId: string, directUrl: string, webViewLink: string, fileName: string}>}
 */
export async function uploadFileToDrive(file, { folderType = 'logos' } = {}) {
  // 1. Baca berkas dari PC
  const fileData = await readFileAsBase64(file);

  // Batas ukuran 15MB
  const MAX_SIZE = 15 * 1024 * 1024;
  if (fileData.fileSize > MAX_SIZE) {
    throw new Error('Ukuran berkas melebihi batas maksimal 15MB.');
  }

  // 2. Cek apakah berjalan di dalam Google Apps Script Web App
  const isGasEnvironment = typeof window !== 'undefined' && 
    window.google && 
    window.google.script && 
    window.google.script.run;

  if (isGasEnvironment) {
    return new Promise((resolve, reject) => {
      window.google.script.run
        .withSuccessHandler((response) => {
          if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Gagal menyimpan berkas ke Google Drive.'));
          }
        })
        .withFailureHandler((err) => {
          reject(new Error(err.message || 'Koneksi ke Google Apps Script backend gagal.'));
        })
        .apiUploadFileToDrive({
          base64Data: fileData.base64,
          fileName: fileData.fileName,
          mimeType: fileData.mimeType,
          folderType: folderType
        });
    });
  }

  // 3. Lingkungan Standalone / Localhost Fallback:
  // Gunakan Base64 Data URL untuk render instan di browser
  const mockFileId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const directUrl = fileData.base64; // Data URL langsung ditampilkan di <img>

  return {
    success: true,
    fileId: mockFileId,
    fileName: fileData.fileName,
    mimeType: fileData.mimeType,
    directUrl: directUrl,
    webViewLink: directUrl,
    folderType: folderType,
    isLocalFallback: true,
    uploadedAt: new Date().toISOString()
  };
}
