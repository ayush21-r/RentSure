@echo off
setlocal

REM Start backend
start "RentSure API" cmd /k "cd /d C:\Project\RentSure && .venv\Scripts\python.exe -m uvicorn app:app --reload"

REM Start frontend
start "RentSure Frontend" cmd /k "cd /d C:\Project\RentSure\frontend && npm install && npm run dev"

endlocal
