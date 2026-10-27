@echo off
title Masroufi - مصروفي لإدارة المصروفات
echo ========================================================
echo         جاري تشغيل تطبيق مصروفي (Masroufi Finance)
echo ========================================================
set "PATH=C:\Users\PC\node-v20;C:\Users\PC\mingit\cmd;%PATH%"
cd /d "%~dp0"
npx vite --port 5175 --open
