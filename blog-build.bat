@echo off
setlocal
set /p msg=Enter commit message : 
git add .
git commit -m "[build] %msg% at %date% %time%."
git pull origin master --no-commit
git commit -m "[build] %msg% and marge remote at %date% %time%."
git push origin master
echo Publish finished.
pause