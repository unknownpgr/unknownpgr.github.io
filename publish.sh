git add .
if [[ `git status --porcelain` ]]; then
	git commit -m "Auto commit at $(date)."
fi
