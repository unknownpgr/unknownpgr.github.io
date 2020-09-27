git pull origin master
git add .
if [[ `git status --porcelain` ]]; then
	git commit -m "Post update at $(date)."
fi
git push origin master
