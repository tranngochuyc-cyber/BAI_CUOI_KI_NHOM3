@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Chạy demo Circular Economy Exchange không cần Internet: http://localhost:8000
where python >nul 2>nul && (python demo-server.py & goto :end)
where py >nul 2>nul && (py demo-server.py & goto :end)
echo Khong tim thay Python.
echo Cach khac: mo thu muc nay bang VS Code, cai extension Live Server,
echo chuot phai index.html va chon "Open with Live Server".
:end
pause
