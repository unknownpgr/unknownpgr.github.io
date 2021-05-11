@echo off
setlocal
set /p msg=Enter commit message : 
git add .
git commit -m "[frontend]%msg% at %date% %time%."
git pull origin master --no-commit
git commit -m "[frontend]%msg% and marge remote at %date% %time%."
git push origin master
echo Publish finished.
pause