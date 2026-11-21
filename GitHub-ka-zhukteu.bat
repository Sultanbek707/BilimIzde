@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo BilimIzde: GitHub-qa zhukteu...
git add -A
git commit -m "BilimIzde: 2026 zhylgy otu baldary (GZhBM grant iegerleri tizimi boiynsha)"
echo GitHub-tagy ozgeristerdi alu...
git pull --rebase --autostash
git push
echo.
echo Dayin. Render 2-5 minutta avtomatty zhanartady.
pause
