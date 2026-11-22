@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo BilimIzde: GitHub-qa zhukteu...
git add -A
git commit -m "BilimIzde: ZhOO betinde mamandyktar kestesi + grant konkursyna shekti ball"
echo GitHub-tagy ozgeristerdi alu...
git pull --rebase --autostash
git push
echo.
echo Dayin. Render 2-5 minutta avtomatty zhanartady.
pause
