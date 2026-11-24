/**
 * GOOGLE APPS SCRIPT BACKEND & DRIVE ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola penyimpanan Google Drive otomatis, konversi Direct Link CDN lh3,
 * upload berkas via metode Choose File, serta persistensi ScriptProperties.
 */

// Konfigurasi Folder Google Drive
var DRIVE_CONFIG = {
  ROOT_FOLDER_NAME: 'PORTAL_YIQUL_STORAGE',
  SUBFOLDERS: {
    LOGOS: 'LOGOS',
    BANNERS: 'BANNERS',
    APP_ICONS: 'APP_ICONS',
    DOCUMENTS: 'DOCUMENTS'
  }
};

/**
 * Handle HTTP GET Request untuk menyajikan antarmuka Portal Yiqul
 * ATAU melayani panggilan REST JSON API jika dipanggil dari Netlify / PWA Client
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    if (action === 'getConfig') {
      var configResult = apiGetPortalConfig();
      return ContentService.createTextOutput(JSON.stringify(configResult))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (action === 'setupDb') {
      var setupRes = setupSpreadsheetDatabase();
      return ContentService.createTextOutput(JSON.stringify(setupRes))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Portal Yiqul — Unified Digital Ecosystem Launcher')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handle HTTP POST Request untuk API Upload / REST sync jika dipanggil dari luar
 */
function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : '';
    if (!rawData) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Empty post data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(rawData);
    var action = payload.action || 'upload';

    if (action === 'upload') {
      var result = apiUploadFileToDrive(payload);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'saveConfig') {
      var saveResult = apiSavePortalConfig(payload.config);
      return ContentService.createTextOutput(JSON.stringify(saveResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper: Mencari atau otomatis membuat folder di Google Drive
 * @param {string} folderName - Nama folder yang dicari/dibuat
 * @param {GoogleAppsScript.Drive.Folder} [parentFolder] - Folder induk (opsional)
 * @returns {GoogleAppsScript.Drive.Folder}
 */
function getOrCreateFolder(folderName, parentFolder) {
  var folders = parentFolder 
    ? parentFolder.getFoldersByName(folderName) 
    : DriveApp.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  }

  // Jika folder belum ada, buat otomatis
  var newFolder = parentFolder 
    ? parentFolder.createFolder(folderName) 
    : DriveApp.createFolder(folderName);

  // Buat folder publik agar seluruh aset dapat dibaca di web
  try {
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    console.warn('Gagal mengatur sharing folder publik: ' + e.message);
  }

  return newFolder;
}

/**
 * Helper: Mengambil target subfolder berdasarkan tipe berkas
 * @param {string} folderType - 'logos' | 'banners' | 'app_icons' | 'documents'
 * @returns {GoogleAppsScript.Drive.Folder}
 */
function getStorageFolder(folderType) {
  var rootFolder = getOrCreateFolder(DRIVE_CONFIG.ROOT_FOLDER_NAME);
  var type = (folderType || 'logos').toLowerCase();
  var subfolderName = DRIVE_CONFIG.SUBFOLDERS.LOGOS;

  if (type === 'banners' || type === 'banner') {
    subfolderName = DRIVE_CONFIG.SUBFOLDERS.BANNERS;
  } else if (type === 'app_icons' || type === 'icons' || type === 'app') {
    subfolderName = DRIVE_CONFIG.SUBFOLDERS.APP_ICONS;
  } else if (type === 'documents' || type === 'docs' || type === 'doc') {
    subfolderName = DRIVE_CONFIG.SUBFOLDERS.DOCUMENTS;
  }

  return getOrCreateFolder(subfolderName, rootFolder);
}

/**
 * Mengonversi ID file Google Drive menjadi URL Direct CDN lh3.googleusercontent.com
 * Format ini anti-CORS dan langsung dapat di-render pada elemen <img> di web.
 * @param {string} fileId
 * @returns {string} Direct CDN link
 */
function formatDirectImageUrl(fileId) {
  return 'https://lh3.googleusercontent.com/d/' + fileId;
}

/**
 * API SERVER: Upload File Base64 ke Google Drive
 * Dipanggil dari Frontend melalui google.script.run atau POST REST API.
 * 
 * @param {Object} payload
 * @param {string} payload.base64Data - Data file dalam bentuk base64 (dengan atau tanpa prefix data URL)
 * @param {string} payload.fileName - Nama file asli dari PC/Device pengguna
 * @param {string} [payload.mimeType] - Tipe konten (misal: image/png, image/jpeg, application/pdf)
 * @param {string} [payload.folderType] - 'logos' | 'banners' | 'app_icons' | 'documents'
 * @returns {Object} { success, fileId, directUrl, webViewLink, fileName }
 */
function apiUploadFileToDrive(payload) {
  try {
    if (!payload || !payload.base64Data || !payload.fileName) {
      throw new Error('Data payload tidak lengkap: base64Data dan fileName wajib disertakan.');
    }

    var rawBase64 = payload.base64Data;
    var mimeType = payload.mimeType || 'image/png';

    // Bersihkan prefix data URL jika ada (contoh: "data:image/png;base64,....")
    if (rawBase64.indexOf(';base64,') !== -1) {
      var parts = rawBase64.split(';base64,');
      var prefix = parts[0];
      if (prefix.indexOf('data:') === 0) {
        mimeType = prefix.replace('data:', '');
      }
      rawBase64 = parts[1];
    }

    // Decode base64 menjadi byte array
    var decodedBytes = Utilities.base64Decode(rawBase64);
    var blob = Utilities.newBlob(decodedBytes, mimeType, payload.fileName);

    // Dapatkan target subfolder di Google Drive
    var targetFolder = getStorageFolder(payload.folderType);

    // Buat file di Google Drive
    var file = targetFolder.createFile(blob);

    // Atur izin sharing file ke ANYONE_WITH_LINK (View only)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var isImage = mimeType.indexOf('image/') === 0;

    // Untuk gambar, gunakan format lh3.googleusercontent.com
    var directUrl = isImage ? formatDirectImageUrl(fileId) : file.getUrl();

    return {
      success: true,
      fileId: fileId,
      fileName: payload.fileName,
      mimeType: mimeType,
      directUrl: directUrl,
      webViewLink: file.getUrl(),
      downloadUrl: file.getDownloadUrl ? file.getDownloadUrl() : directUrl,
      folderType: payload.folderType || 'logos',
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error saat upload berkas ke Google Drive:', error);
    return {
      success: false,
      error: error.message || 'Gagal menyimpan berkas ke Google Drive.'
    };
  }
}

/**
 * API SERVER: Simpan konfigurasi lengkap portal (Branding, Banners, Apps) ke ScriptProperties
 */
function apiSavePortalConfig(config) {
  try {
    if (!config || typeof config !== 'object') {
      throw new Error('Config harus berupa objek.');
    }
    var props = PropertiesService.getScriptProperties();
    props.setProperty('YIQUL_PORTAL_CONFIG', JSON.stringify(config));
    return { success: true, savedAt: new Date().toISOString() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * API SERVER: Ambil konfigurasi lengkap portal dari ScriptProperties
 */
function apiGetPortalConfig() {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty('YIQUL_PORTAL_CONFIG');
    if (!raw) return { success: true, config: null };
    return { success: true, config: JSON.parse(raw) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


/**
 * ==============================================================================
 * GOOGLE SHEETS RELATIONAL DATABASE ENGINE
 * ==============================================================================
 * Mengonversi Google Sheets menjadi Database Cloud Real-time untuk Portal Yiqul.
 * Administrator yayasan dapat memantau dan mengedit data langsung dari Google Sheets!
 */

function setupSpreadsheetDatabase() {
  try {
    var rootFolder = getOrCreateFolder(DRIVE_CONFIG.ROOT_FOLDER_NAME);
    var files = rootFolder.getFilesByName('DATABASE_PORTAL_YIQUL');
    var ss;

    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create('DATABASE_PORTAL_YIQUL');
      var file = DriveApp.getFileById(ss.getId());
      file.moveTo(rootFolder);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    var props = PropertiesService.getScriptProperties();
    props.setProperty('SPREADSHEET_DB_ID', ss.getId());

    // 1. Setup Sheet APPS
    var sheetApps = ss.getSheetByName('APPS') || ss.insertSheet('APPS');
    if (sheetApps.getLastRow() === 0) {
      sheetApps.appendRow(['ID', 'TITLE', 'TARGET_URL', 'CATEGORY', 'ICON', 'CUSTOM_ICON_URL', 'TARGET_MODE', 'STATUS', 'ORDER', 'UPDATED_AT']);
      sheetApps.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#D1FAE5');
      sheetApps.setFrozenRows(1);
    }

    // 2. Setup Sheet BANNERS
    var sheetBanners = ss.getSheetByName('BANNERS') || ss.insertSheet('BANNERS');
    if (sheetBanners.getLastRow() === 0) {
      sheetBanners.appendRow(['ID', 'TITLE', 'SUBTITLE', 'IMAGE_URL', 'ACTION_URL', 'ACTION_TEXT', 'IS_ACTIVE', 'ORDER']);
      sheetBanners.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#FEF3C7');
      sheetBanners.setFrozenRows(1);
    }

    // 3. Setup Sheet BRANDING
    var sheetBranding = ss.getSheetByName('BRANDING') || ss.insertSheet('BRANDING');
    if (sheetBranding.getLastRow() === 0) {
      sheetBranding.appendRow(['SETTING_KEY', 'SETTING_VALUE']);
      sheetBranding.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#EFF6FF');
      sheetBranding.setFrozenRows(1);
      sheetBranding.appendRow(['portalTitle', 'PORTAL YIQUL']);
      sheetBranding.appendRow(['portalSubtitle', 'Ecosystem Command Center']);
      sheetBranding.appendRow(['organizationName', 'Yayasan Islam Qudwatul Ummah']);
      sheetBranding.appendRow(['logoUrl', '']);
    }

    // 4. Setup Sheet DOCS
    var sheetDocs = ss.getSheetByName('DOCS') || ss.insertSheet('DOCS');
    if (sheetDocs.getLastRow() === 0) {
      sheetDocs.appendRow(['ID', 'TITLE', 'CATEGORY', 'FILE_URL', 'FILE_TYPE', 'FILE_SIZE', 'UPDATED_AT']);
      sheetDocs.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#F1F5F9');
      sheetDocs.setFrozenRows(1);
    }

    // Hapus sheet default "Sheet1" jika ada
    var defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
    if (defaultSheet && ss.getSheets().length > 1) {
      try { ss.deleteSheet(defaultSheet); } catch(e) {}
    }

    return {
      success: true,
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      message: 'Database Google Sheets berhasil dibuat & dihubungkan!'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
