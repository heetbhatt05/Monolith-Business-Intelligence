@echo off
title BCA PROJECT SUPERVISOR
color 0A

echo ==================================================
echo      STARTING AI BUSINESS INTELLIGENCE SYSTEM
echo ==================================================
echo.

REM Always work relative to this file location
cd /d %~dp0

echo [1/5] Starting MongoDB...
start "MongoDB" cmd /k "E:\MongoDB\bin\mongod.exe --port 27018 --dbpath E:\data\db27018"

echo [2/5] Starting Python Inference AI...
start "Python Inference" cmd /k "cd /d %~dp0ML && python inference_api.py"

echo [3/5] Starting Python Machine Learning API...
start "Python ML API" cmd /k "cd /d %~dp0ML && python ml_api.py"

echo [4/5] Starting Node.js Backend...
start "Node Backend" cmd /k "cd /d %~dp0backend && npx nodemon server.js"

echo [5/5] Starting React Frontend...
start "React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==================================================
echo           ALL SYSTEMS GO. GOOD LUCK.
echo ==================================================
pause