@echo off
chcp 65001 >nul
title Portal Yiqul - 1-Click Push ke GitHub
color 0A

echo ======================================================================
echo    PORTAL YIQUL — OTOMATISASI PUSH KE GITHUB REPOSITORY
echo    Target: https://github.com/busdigit/portal-yiqul
echo ======================================================================
echo.

:: 0. Re-build bundle terbaru sebelum push
echo [*] Melakukan re-bundle otomatis (bundle.css & bundle.js)...
call node tools/build.js
echo.

:: 1. Deteksi Git (System PATH atau GitHub Desktop embedded)
set "GIT_CMD=git"
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [*] Mencari Git bawaan GitHub Desktop...
    for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do (
        if exist "%%D\resources\app\git\cmd\git.exe" (
            set "GIT_CMD=%%D\resources\app\git\cmd\git.exe"
        )
    )
)

"%GIT_CMD%" --version >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git belum terpasang di sistem PATH!
    echo.
    echo Cara termudah:
    echo 1. Anda punya aplikasi GitHub Desktop di taskbar (logo kucing hitam).
    echo    Buka GitHub Desktop -> File -> Add Local Repository -> pilih folder ini
    echo    Lalu klik "Commit to main" dan klik "Push origin"!
    echo.
    echo 2. ATAU install Git resmi dari: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/5] Git siap digunakan: %GIT_CMD%
"%GIT_CMD%" --version
echo.

:: 2. Inisialisasi Git jika belum ada
if not exist ".git" (
    echo [2/5] Menginisialisasi repositori Git lokal...
    "%GIT_CMD%" init
    "%GIT_CMD%" branch -M main
) else (
    echo [2/5] Repositori Git lokal sudah siap.
)
echo.

:: 3. Setup Remote Origin ke busdigit/portal-yiqul
echo [3/5] Menghubungkan ke https://github.com/busdigit/portal-yiqul.git...
"%GIT_CMD%" remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    "%GIT_CMD%" remote add origin https://github.com/busdigit/portal-yiqul.git
) else (
    "%GIT_CMD%" remote set-url origin https://github.com/busdigit/portal-yiqul.git
)
echo Remote origin terkonfigurasi.
echo.

:: 4. Tambahkan seluruh berkas
echo [4/5] Mengemas bundle.css, bundle.js, index.html, src/, assets/, .nojekyll...
"%GIT_CMD%" add -A
"%GIT_CMD%" commit -m "feat: implementasi cyber security suite (SHA-256, anti brute force, audit trail, clickjacking guard)"
echo.

:: 5. Push ke GitHub
echo [5/5] Mengunggah (PUSH) ke GitHub...
echo (Jika muncul popup otentikasi GitHub, klik 'Sign in with your browser')
echo.
"%GIT_CMD%" push -u origin main

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ======================================================================
    echo  ALHAMDULILLAH! PUSH BERHASIL 100%!
    echo  Semua file bundle.css, bundle.js, dan index.html sudah di GitHub!
    echo.
    echo  Silakan buka: https://busdigit.github.io/portal-yiqul/
    echo  (Tekan Ctrl + F5 di browser untuk melihat tampilan utuh aplikasi)
    echo ======================================================================
) else (
    color 0E
    echo.
    echo [CATATAN] Mencoba sinkronisasi branch dengan git push --force...
    echo.
    "%GIT_CMD%" push -u origin main --force
    if %errorlevel% equ 0 (
        color 0A
        echo.
        echo ======================================================================
        echo  ALHAMDULILLAH! PUSH FORCE BERHASIL 100%!
        echo  Semua file bundle dan tampilan utuh sudah terpasang di GitHub!
        echo  Silakan buka: https://busdigit.github.io/portal-yiqul/
        echo  (Tekan Ctrl + F5 di browser)
        echo ======================================================================
    ) else (
        color 0C
        echo.
        echo [GAGAL] Push gagal. Silakan gunakan GitHub Desktop untuk push,
        echo atau pastikan sudah login ke akun 'busdigit'.
    )
)

echo.
pause
