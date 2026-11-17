@echo off
rem Menjalankan RELAFUN + Tutor AI + Pembahas Soal di http://localhost:3000
rem Cara pakai: klik dua kali file ini. Tutup jendela atau tekan Ctrl+C untuk berhenti.
rem Panduan lengkap: docs/12-MENJALANKAN-LOKAL.md
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang atau belum dikenali. Pasang Node.js LTS, lalu buka ulang jendela ini.
  goto selesai
)

if not exist node_modules (
  echo Memasang paket server untuk pertama kali...
  call npm.cmd install
  if errorlevel 1 goto selesai
)

if not exist .env (
  echo Catatan: server\.env belum ada. Aplikasi tetap jalan, tetapi fitur AI belum aktif.
  echo Salin .env.example menjadi .env lalu isi GEMINI_API_KEY.
)

rem Buka browser 3 detik setelah server mulai (lewati dengan: mulai-relafun.cmd --tanpa-browser)
if /i not "%~1"=="--tanpa-browser" start "" /b cmd /c "timeout /t 3 /nobreak >nul & start "" http://localhost:3000"

call npm.cmd start

:selesai
echo.
pause
