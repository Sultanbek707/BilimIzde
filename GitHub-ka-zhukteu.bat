@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo BilimIzde: GitHub-qa zhukteu...
git add -A
git commit -m "BilimIzde: zhatakhana, QS reiting, magistratura, zhalaky, kolledzh, UBT synak, shetel ZhOO audarmasy"
git push
echo.
echo Dayin. Render 2-5 minutta avtomatty zhanartady.
pause
