@echo off
title Iniciando CAPICUA 888...
echo ========================================================
echo          INICIANDO CAPICUA 888 - EL UNIVERSO DEL SABER
echo ========================================================
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo Iniciando servidor local en http://localhost:8088 ...
  start "" node server.js
  timeout /t 1 >nul
  start "" "http://localhost:8088"
) else (
  echo Abriendo directamente en tu navegador...
  start "" "index.html"
)
exit
