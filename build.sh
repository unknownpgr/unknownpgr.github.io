# This script will build docker image for blog builder, and build blog from blog builder.
set -e

ROOT="$(dirname -- $0)"
cd $ROOT

rm -rf src/.cache
rm -rf docs

docker build -t blog .
docker run --rm -it -v $(pwd)/posts:/posts -v $(pwd)/docs:/out blog

sudo chown -R $(id -u):$(id -g) docs

touch docs/.nojekyll

git add docs/*