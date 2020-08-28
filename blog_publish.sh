git pull origin master
git add .
if [[ `git status --porcelain` ]]; then
	git commit -m "[update]Auto commit at $(date)."
fi
git push origin master
