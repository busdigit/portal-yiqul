@echo off
chcp 65001 >nul
title Portal Yiqul - 1-Click Push ke GitHub
color 0A

echo ======================================================================
echo    PORTAL YIQUL — OTOMATISASI PUSH KE GITHUB REPOSITORY
echo    Target: https://github.com/busdigit/portal-yiqul
echo ======================================================================
echo.

:: 1. Cek apakah Git sudah terinstall
where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git belum terdeteksi di laptop/PC Anda!
    echo.
    echo Supaya Anda bisa "TINGGAL PUSH" tanpa perlu copas file satu per satu,
    echo Anda harus menginstall Git for Windows terlebih dahulu (cukup 1x seumur hidup).
    echo.
    echo 1. Unduh Git di: https://git-scm.com/download/win
    echo    (Pilih "Click here to download" versi 64-bit Standalone Installer)
    echo 2. Buka filenya dan klik "Next" sampai selesai.
    echo 3. Setelah selesai, jalankan file push-ke-github.bat ini lagi!
    echo.
    echo Membuka link download Git di browser Anda sekarang...
    start https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/5] Git terdeteksi dengan sukses!
git --version
echo.

:: 2. Inisialisasi Git jika belum ada
if not exist ".git" (
    echo [2/5] Menginisialisasi repositori Git lokal...
    git init
    git branch -M main
) else (
    echo [2/5] Repositori Git lokal sudah siap.
)
echo.

:: 3. Setup Remote Origin ke busdigit/portal-yiqul
echo [3/5] Menghubungkan ke https://github.com/busdigit/portal-yiqul.git...
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    git remote add origin https://github.com/busdigit/portal-yiqul.git
) else (
    git remote set-url origin https://github.com/busdigit/portal-yiqul.git
)
echo Remote origin terkonfigurasi.
echo.

:: 4. Tambahkan seluruh berkas (termasuk src/, assets/, .nojekyll)
echo [4/5] Memindai dan mengemas seluruh folder & file...
git add -A
git commit -m "feat: deploy lengkap portal yiqul PWA (css, js, assets, nojekyll)"
echo.

:: 5. Push ke GitHub
echo [5/5] Mengunggah (PUSH) ke GitHub...
echo (Jika muncul jendela login GitHub di layar, klik 'Sign in with your browser')
echo.
git push -u origin main

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ======================================================================
    echo  ALHAMDULILLAH! PUSH BERHASIL 100%!
    echo  Semua file, folder src/, assets/, styling CSS, dan JS sudah di GitHub!
    echo.
    echo  Silakan buka: https://busdigit.github.io/portal-yiqul/
    echo  (Tekan Ctrl + F5 di browser untuk melihat tampilan utuh aplikasi)
    echo ======================================================================
) else (
    color 0E
    echo.
    echo [CATATAN] Jika push ditolak karena ada perbedaan file di GitHub:
    echo Mencoba menyelaraskan branch dengan git push --force...
    echo.
    git push -u origin main --force
    if %errorlevel% equ 0 (
        color 0A
        echo.
        echo ======================================================================
        echo  ALHAMDULILLAH! PUSH FORCE BERHASIL 100%!
        echo  Semua file & folder sudah sinkron dengan GitHub!
        echo  Silakan buka: https://busdigit.github.io/portal-yiqul/
        echo  (Tekan Ctrl + F5 di browser)
        echo ======================================================================
    ) else (
        color 0C
        echo.
        echo [GAGAL] Push gagal. Pastikan Anda sudah login ke akun GitHub 'busdigit'
        echo di browser atau masukkan Personal Access Token jika diminta.
    )
)

echo.
pause
