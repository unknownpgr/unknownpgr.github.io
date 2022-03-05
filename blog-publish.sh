#!/bin/sh
set -e
cd "$(dirname "$0")"

./blog-build.sh

git add .
git commit -m "[post] Post update post at $(date) $(time)."
git push blog master
echo Publish finished.
read -p "Press any key to resume ..."
