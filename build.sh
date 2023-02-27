# This script will build docker image for blog builder, and build blog from blog builder.
ROOT="$(dirname -- $0)"
cd $ROOT

git checkout build
git rebase master

docker build -t blog .
docker run --rm -v $(pwd)/posts:/posts -v $(pwd)/docs:/out blog

chown -R $(id -u):$(id -g) docs

git add .
git commit -m "Build blog"
git checkout master
git merge build --no-ff -m "Merge build branch"
git push origin master