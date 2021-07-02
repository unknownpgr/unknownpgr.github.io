read -p "Enter commit message : " msg
git add .
git commit -m "[build] $msg at $(date +"%Y-%M-%d %H:%M:%S")"
git pull origin master --no-commit
git commit -m "[build] %msg% and marge remote at $(date +"%Y-%M-%d %H:%M:%S")"
git push origin master
echo Publish finished.
read -p "Press any key to resume ..."