@echo off
setlocal
title Pastera VIP Club - Windows 11 NFC Test
cd /d "%~dp0"
echo.
echo PASTERA VIP CLUB - WINDOWS 11 NFC TEST
echo ====================================
echo This test detects NFC cards and updates a browser tab.
echo No real orders or loyalty points are created.
echo.

where py >nul 2>nul
if %errorlevel%==0 (
    py -3 "%~dp0vip-nfc-windows.py" --mode browser-test
    goto end
)
where python >nul 2>nul
if %errorlevel%==0 (
    python "%~dp0vip-nfc-windows.py" --mode browser-test
    goto end
)
echo Python 3 not found.
echo Install Python 3 from https://www.python.org/downloads/windows/
echo Then double-click this file again.

:end
echo.
echo NFC test stopped. Press any key to close.
pause >nul
