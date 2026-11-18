@echo off
chcp 65001 >nul
title BilimIzde
cd /d "%~dp0"
echo BilimIzde іске қосылуда...
if not exist ".venv\Scripts\python.exe" (
  echo Бірінші рет баптап жатырмын, 1-2 минут күтіңіз...
  python -m venv .venv
  if errorlevel 1 (
    echo.
    echo Python табылмады. python.org сайтынан Python орнатыңыз ^(Add Python to PATH белгісін қойыңыз^).
    pause
    exit /b
  )
)
call ".venv\Scripts\activate.bat"
python -m pip install -q -r backend\requirements.txt
echo.
echo Сайт ашылуда: http://127.0.0.1:8000
echo Бұл терезені жаппаңыз - жапсаңыз, сайт тоқтайды.
echo.
start "" cmd /c "timeout /t 4 >nul & start http://127.0.0.1:8000"
python -m uvicorn backend.app.main:app
pause
