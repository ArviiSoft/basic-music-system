@echo off
title Music

:loop
  node arvis.js
  echo [%date% %time%] Bot kapandi. Hata kodu: %errorlevel%.
  echo 5 Saniye sonra yeniden baslatilacak...
  timeout /t 5 /nobreak > nul
goto loop