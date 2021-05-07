git add .
git commit -m "[frontend]Auto update at %date% %time%."
git pull origin master --no-commit
git commit -m "[frontend]Auto update and marge remote at %date% %time%."
git push origin master
echo Publish finished.
pause