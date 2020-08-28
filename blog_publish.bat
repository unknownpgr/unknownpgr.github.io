git add .
git commit -m "[update]Update post at %date% %time%."
git pull origin master --no-commit
git commit -m "[update]Marge remote at %date% %time%."
git push origin master
echo Publish finished.
pause