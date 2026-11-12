@echo off
setlocal
title Pastera VIP Club - Windows 11 Kasa
cd /d "%~dp0"
echo.
echo ===========================================
echo PASTERA VIP CLUB - CANLI NFC KASA
echo ===========================================
echo.
echo Bu program GERCEK VIP puani ekleyebilir.
echo Once karti mevcut musteri hesabina atayin.
echo Vercel Production VIP_NFC_TERMINAL_SECRET
echo ayarinin yapildigindan emin olun.
echo Program NFC okuyucunun kart UID bilgisini okur.
echo Telefonda kart okutma puan eklemez.
echo.
where py >nul 2>nul
if %errorlevel%==0 (
    py -3 "%~dp0vip-nfc-windows.py" --mode pos --url https://www.pastera.de
    goto end
)
where python >nul 2>nul
if %errorlevel%==0 (
    python "%~dp0vip-nfc-windows.py" --mode pos --url https://www.pastera.de
    goto end
)
echo Python 3 bulunamadi. Claude ile Python 3 kurulumunu tamamlayin.

:end
echo.
echo Program durdu. Kapatmak icin bir tusa basin.
pause >nul
