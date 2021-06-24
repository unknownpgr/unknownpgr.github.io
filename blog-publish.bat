git add .
git commit -m "[post] Post update post at %date% %time%."
git pull origin master --no-commit
git commit -m "[post] Post update and marge remote at %date% %time%."
git push origin master
echo Publish finished.
pause